package com.edoc.appointmentservice.service;

import com.edoc.appointmentservice.client.DoctorServiceClient;
import com.edoc.appointmentservice.client.NotificationServiceClient;
import com.edoc.appointmentservice.client.PatientServiceClient;
import com.edoc.appointmentservice.dto.AppointmentRequest;
import com.edoc.appointmentservice.dto.AppointmentStatusUpdate;
import com.edoc.appointmentservice.dto.PaymentStatusUpdate;
import com.edoc.appointmentservice.model.Appointment;
import com.edoc.appointmentservice.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorServiceClient doctorServiceClient;
    private final PatientServiceClient patientServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    // ─── BOOK ────────────────────────────────────────────────────────────────

    public Appointment bookAppointment(AppointmentRequest request) {

        // Step 1: Validate patient exists and is active.
        Map<String, Object> patientStatus = patientServiceClient.getPatientStatusById(request.getPatientId());
        assertPatientActiveForBooking(request.getPatientId(), patientStatus);

        // Step 2: Check the slot isn't already taken
        boolean slotTaken = appointmentRepository
                .existsByDoctorIdAndAppointmentDateAndTimeSlotAndStatusNot(
                        request.getDoctorId(),
                        request.getAppointmentDate(),
                        request.getTimeSlot(),
                        Appointment.AppointmentStatus.CANCELLED
                );

        if (slotTaken) {
            throw new RuntimeException(
                    "This time slot is already booked. Please choose a different slot."
            );
        }

        // Step 3: Fetch doctor details from doctor-service
        Map<?, ?> doctorData = doctorServiceClient.getDoctorById(request.getDoctorId());

        // Step 4: Build the appointment object
        Appointment appointment = new Appointment();
        appointment.setPatientId(request.getPatientId());
        appointment.setDoctorId(request.getDoctorId());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setDayOfWeek(request.getDayOfWeek());
        appointment.setType(request.getType());
        appointment.setReasonForVisit(request.getReasonForVisit());
        appointment.setStatus(Appointment.AppointmentStatus.PENDING);
        appointment.setCreatedAt(LocalDateTime.now());
        appointment.setUpdatedAt(LocalDateTime.now());

        // Payment starts as NOT_REQUIRED until doctor confirms
        appointment.setPaymentStatus(Appointment.PaymentStatus.NOT_REQUIRED);

        // Step 5: Snapshot doctor details into the appointment
        if (doctorData != null) {
            appointment.setDoctorName(
                    doctorData.get("firstName") + " " + doctorData.get("lastName")
            );
            appointment.setDoctorSpecialty((String) doctorData.get("specialty"));
            appointment.setDoctorHospital((String) doctorData.get("hospital"));
            Object fee = doctorData.get("consultationFee");
            if (fee != null) {
                appointment.setConsultationFee(Double.parseDouble(fee.toString()));
            }
        }

        // Step 6: Mark the slot as booked in doctor-service
        // Extract start time from "09:00-09:30" → "09:00"
        String startTime = request.getTimeSlot().split("-")[0];
        doctorServiceClient.markSlotAsBooked(
                request.getDoctorId(),
                request.getDayOfWeek(),
                startTime
        );

        Appointment savedAppointment = appointmentRepository.save(appointment);
        notifyBooking(savedAppointment, doctorData);
        return savedAppointment;
    }

    // ─── GET ─────────────────────────────────────────────────────────────────

    public Appointment getAppointmentById(String id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
    }

    public List<Appointment> getAppointmentsByPatient(String patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsByDoctor(String doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> getPendingAppointmentsForDoctor(String doctorId) {
        return appointmentRepository.findByDoctorIdAndStatus(
                doctorId, Appointment.AppointmentStatus.PENDING
        );
    }

    public List<Appointment> getAppointmentsByPatientAndStatus(
            String patientId, Appointment.AppointmentStatus status) {
        return appointmentRepository.findByPatientIdAndStatus(patientId, status);
    }

    // Get appointments that are confirmed but not yet paid
    // Payment service can use this to find pending payments
    public List<Appointment> getUnpaidConfirmedAppointments(String doctorId) {
        return appointmentRepository.findByDoctorIdAndStatusAndPaymentStatus(
                doctorId,
                Appointment.AppointmentStatus.CONFIRMED,
                Appointment.PaymentStatus.PENDING
        );
    }

    // ─── UPDATE STATUS ───────────────────────────────────────────────────────

    public Appointment updateAppointmentStatus(String id, AppointmentStatusUpdate update) {
        Appointment appointment = getAppointmentById(id);

        appointment.setStatus(update.getStatus());
        appointment.setUpdatedAt(LocalDateTime.now());

        // Add doctor notes if provided
        if (update.getDoctorNotes() != null) {
            appointment.setDoctorNotes(update.getDoctorNotes());
        }

        // Add video session link if provided
        if (update.getVideoSessionLink() != null) {
            appointment.setVideoSessionLink(update.getVideoSessionLink());
        }

        // When doctor CONFIRMS → payment becomes required
        if (update.getStatus() == Appointment.AppointmentStatus.CONFIRMED) {
            appointment.setPaymentStatus(Appointment.PaymentStatus.PENDING);
        }

        // When cancelled after payment → refund
        if (update.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            appointment.setCancellationReason(update.getCancellationReason());

            // If already paid, mark as refunded
            if (appointment.getPaymentStatus() == Appointment.PaymentStatus.PAID) {
                appointment.setPaymentStatus(Appointment.PaymentStatus.REFUNDED);
            } else {
                appointment.setPaymentStatus(Appointment.PaymentStatus.NOT_REQUIRED);
            }

            String startTime = appointment.getTimeSlot().split("-")[0];
            doctorServiceClient.markSlotAsFree(
                    appointment.getDoctorId(),
                    appointment.getDayOfWeek(),
                    startTime
            );
        }

        Appointment savedAppointment = appointmentRepository.save(appointment);

        if (update.getStatus() == Appointment.AppointmentStatus.CONFIRMED) {
            notifyAppointmentConfirmed(savedAppointment);
        }
        if (update.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            notifyAppointmentCancelled(savedAppointment);
        }
        if (update.getStatus() == Appointment.AppointmentStatus.COMPLETED) {
            notifyCompletion(savedAppointment);
        }

        return savedAppointment;
    }

    // ─── UPDATE PAYMENT STATUS ───────────────────────────────────────────────
    // Called by payment-service after successful payment

    public Appointment updatePaymentStatus(String id, PaymentStatusUpdate update) {
        Appointment appointment = getAppointmentById(id);

        // Can only pay for CONFIRMED appointments
        if (appointment.getStatus() != Appointment.AppointmentStatus.CONFIRMED) {
            throw new RuntimeException(
                    "Payment can only be made for CONFIRMED appointments. " +
                            "Current status: " + appointment.getStatus()
            );
        }

        // Can only pay if payment is still pending
        if (appointment.getPaymentStatus() == Appointment.PaymentStatus.PAID) {
            throw new RuntimeException("This appointment has already been paid.");
        }

        appointment.setPaymentStatus(update.getPaymentStatus());
        appointment.setPaymentId(update.getPaymentId());
        appointment.setPaymentDate(LocalDateTime.now());
        appointment.setUpdatedAt(LocalDateTime.now());

        return appointmentRepository.save(appointment);
    }

    // ─── CANCEL ──────────────────────────────────────────────────────────────

    public Appointment cancelAppointment(String id, String reason) {
        Appointment appointment = getAppointmentById(id);

        // Can only cancel if PENDING or CONFIRMED
        if (appointment.getStatus() == Appointment.AppointmentStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed appointment.");
        }
        if (appointment.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            throw new RuntimeException("Appointment is already cancelled.");
        }

        appointment.setStatus(Appointment.AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);
        appointment.setUpdatedAt(LocalDateTime.now());

        // Handle payment refund if already paid
        if (appointment.getPaymentStatus() == Appointment.PaymentStatus.PAID) {
            appointment.setPaymentStatus(Appointment.PaymentStatus.REFUNDED);
        } else {
            appointment.setPaymentStatus(Appointment.PaymentStatus.NOT_REQUIRED);
        }

        String startTime = appointment.getTimeSlot().split("-")[0];
        doctorServiceClient.markSlotAsFree(
                appointment.getDoctorId(),
                appointment.getDayOfWeek(),
                startTime
        );

        return appointmentRepository.save(appointment);
    }

    // ─── MODIFY ──────────────────────────────────────────────────────────────

    public Appointment modifyAppointment(String id, AppointmentRequest request) {
        Appointment existing = getAppointmentById(id);

        // Can only modify PENDING appointments
        if (existing.getStatus() != Appointment.AppointmentStatus.PENDING) {
            throw new RuntimeException(
                    "Only PENDING appointments can be modified. " +
                            "Current status: " + existing.getStatus()
            );
        }

        // Free old slot
        String oldStartTime = existing.getTimeSlot().split("-")[0];
        doctorServiceClient.markSlotAsFree(
                existing.getDoctorId(),
                existing.getDayOfWeek(),
                oldStartTime
        );

        // Check new slot is available
        boolean newSlotTaken = appointmentRepository
                .existsByDoctorIdAndAppointmentDateAndTimeSlotAndStatusNot(
                        request.getDoctorId(),
                        request.getAppointmentDate(),
                        request.getTimeSlot(),
                        Appointment.AppointmentStatus.CANCELLED
                );

        if (newSlotTaken) {
            // Re-book old slot since we freed it
            doctorServiceClient.markSlotAsBooked(
                    existing.getDoctorId(),
                    existing.getDayOfWeek(),
                    oldStartTime
            );
            throw new RuntimeException("The new time slot is already booked.");
        }

        // Update fields
        existing.setAppointmentDate(request.getAppointmentDate());
        existing.setTimeSlot(request.getTimeSlot());
        existing.setDayOfWeek(request.getDayOfWeek());
        existing.setType(request.getType());
        existing.setReasonForVisit(request.getReasonForVisit());
        existing.setUpdatedAt(LocalDateTime.now());

        // Book new slot
        String newStartTime = request.getTimeSlot().split("-")[0];
        doctorServiceClient.markSlotAsBooked(
                request.getDoctorId(),
                request.getDayOfWeek(),
                newStartTime
        );

        return appointmentRepository.save(existing);
    }

    // Delete a completed appointment - patient cleans up their history
    public void deleteCompletedAppointment(String id, String patientId) {
        Appointment appointment = getAppointmentById(id);

        // Security check - make sure the patient owns this appointment
        if (!appointment.getPatientId().equals(patientId)) {
            throw new RuntimeException(
                    "You are not authorized to delete this appointment."
            );
        }

        // Only COMPLETED or CANCELLED appointments can be deleted
        // We never delete PENDING or CONFIRMED - those are active
        if (appointment.getStatus() == Appointment.AppointmentStatus.PENDING) {
            throw new RuntimeException(
                    "Cannot delete a PENDING appointment. Cancel it first."
            );
        }

        if (appointment.getStatus() == Appointment.AppointmentStatus.CONFIRMED) {
            throw new RuntimeException(
                    "Cannot delete a CONFIRMED appointment. Cancel it first."
            );
        }

        appointmentRepository.delete(appointment);
    }

    private void assertPatientActiveForBooking(String patientId, Map<String, Object> patientStatus) {
        if (patientStatus == null || patientStatus.get("status") == null) {
            throw new RuntimeException("Patient status could not be validated for booking.");
        }

        String status = patientStatus.get("status").toString().toUpperCase(Locale.ROOT);
        if (!"ACTIVE".equals(status)) {
            throw new RuntimeException("Cannot book appointment: patient is " + status + ".");
        }
    }

    private void notifyBooking(Appointment appointment, Map<?, ?> doctorData) {
        try {
            Map<?, ?> patientData = patientServiceClient.getPatientById(appointment.getPatientId());

            String patientEmail = getString(patientData, "email");
            String patientPhone = getString(patientData, "phone");
            String patientName = getFullName(patientData, "firstName", "lastName");

            String doctorEmail = getString(doctorData, "email");
            String doctorPhone = getString(doctorData, "phoneNumber");
            String doctorName = getFullName(doctorData, "firstName", "lastName");

            String resolvedDoctorName = appointment.getDoctorName() != null ? appointment.getDoctorName() : doctorName;

            if (patientEmail != null || patientPhone != null) {
                Map<String, Object> data = new HashMap<>();
                data.put("recipientName", patientName != null ? patientName : "there");
                data.put("doctorName", resolvedDoctorName != null ? resolvedDoctorName : "your doctor");
                data.put("date", appointment.getAppointmentDate() != null ? appointment.getAppointmentDate().toString() : "");
                data.put("timeSlot", appointment.getTimeSlot() != null ? appointment.getTimeSlot() : "");
                data.put("dayOfWeek", appointment.getDayOfWeek() != null ? appointment.getDayOfWeek() : "");
                notificationServiceClient.sendNotification("APPOINTMENT_BOOKED", patientEmail, patientPhone, data);
            }

            if (doctorEmail != null || doctorPhone != null) {
                Map<String, Object> data = new HashMap<>();
                data.put("recipientName", doctorName != null ? "Dr. " + doctorName : "Doctor");
                data.put("doctorName", resolvedDoctorName != null ? resolvedDoctorName : "your doctor");
                data.put("date", appointment.getAppointmentDate() != null ? appointment.getAppointmentDate().toString() : "");
                data.put("timeSlot", appointment.getTimeSlot() != null ? appointment.getTimeSlot() : "");
                data.put("dayOfWeek", appointment.getDayOfWeek() != null ? appointment.getDayOfWeek() : "");
                notificationServiceClient.sendNotification("APPOINTMENT_BOOKED", doctorEmail, doctorPhone, data);
            }
        } catch (Exception ex) {
            log.warn("Notification send failed for booking {}", appointment.getId(), ex);
        }
    }

    private void notifyAppointmentConfirmed(Appointment appointment) {
        try {
            Map<?, ?> patientData = patientServiceClient.getPatientById(appointment.getPatientId());
            String patientEmail = getString(patientData, "email");
            String patientPhone = getString(patientData, "phone");
            String patientName = getFullName(patientData, "firstName", "lastName");

            if (patientEmail != null || patientPhone != null) {
                Map<String, Object> data = new HashMap<>();
                data.put("patientName", patientName != null ? patientName : "there");
                data.put("date", appointment.getAppointmentDate() != null ? appointment.getAppointmentDate().toString() : "");
                data.put("timeSlot", appointment.getTimeSlot() != null ? appointment.getTimeSlot() : "");
                data.put("dayOfWeek", appointment.getDayOfWeek() != null ? appointment.getDayOfWeek() : "");
                notificationServiceClient.sendNotification("APPOINTMENT_CONFIRMED", patientEmail, patientPhone, data);
            }
        } catch (Exception ex) {
            log.warn("Notification send failed for confirmation {}", appointment.getId(), ex);
        }
    }

    private void notifyAppointmentCancelled(Appointment appointment) {
        try {
            Map<?, ?> patientData = patientServiceClient.getPatientById(appointment.getPatientId());
            String patientEmail = getString(patientData, "email");
            String patientPhone = getString(patientData, "phone");
            String patientName = getFullName(patientData, "firstName", "lastName");

            if (patientEmail != null || patientPhone != null) {
                Map<String, Object> data = new HashMap<>();
                data.put("patientName", patientName != null ? patientName : "there");
                data.put("date", appointment.getAppointmentDate() != null ? appointment.getAppointmentDate().toString() : "");
                data.put("timeSlot", appointment.getTimeSlot() != null ? appointment.getTimeSlot() : "");
                data.put("dayOfWeek", appointment.getDayOfWeek() != null ? appointment.getDayOfWeek() : "");
                notificationServiceClient.sendNotification("APPOINTMENT_CANCELLED", patientEmail, patientPhone, data);
            }
        } catch (Exception ex) {
            log.warn("Notification send failed for cancellation {}", appointment.getId(), ex);
        }
    }

    private void notifyCompletion(Appointment appointment) {
        try {
            Map<?, ?> patientData = patientServiceClient.getPatientById(appointment.getPatientId());
            Map<?, ?> doctorData = doctorServiceClient.getDoctorById(appointment.getDoctorId());

            String patientEmail = getString(patientData, "email");
            String patientPhone = getString(patientData, "phone");
            String patientName = getFullName(patientData, "firstName", "lastName");

            String doctorEmail = getString(doctorData, "email");
            String doctorPhone = getString(doctorData, "phoneNumber");
            String doctorName = getFullName(doctorData, "firstName", "lastName");

            if (patientEmail != null || patientPhone != null) {
                Map<String, Object> data = new HashMap<>();
                data.put("recipientName", patientName != null ? patientName : "there");
                data.put("date", appointment.getAppointmentDate() != null ? appointment.getAppointmentDate().toString() : "");
                data.put("timeSlot", appointment.getTimeSlot() != null ? appointment.getTimeSlot() : "");
                data.put("dayOfWeek", appointment.getDayOfWeek() != null ? appointment.getDayOfWeek() : "");
                notificationServiceClient.sendNotification("APPOINTMENT_COMPLETED", patientEmail, patientPhone, data);
            }

            if (doctorEmail != null || doctorPhone != null) {
                Map<String, Object> data = new HashMap<>();
                data.put("recipientName", doctorName != null ? "Dr. " + doctorName : "Doctor");
                data.put("date", appointment.getAppointmentDate() != null ? appointment.getAppointmentDate().toString() : "");
                data.put("timeSlot", appointment.getTimeSlot() != null ? appointment.getTimeSlot() : "");
                data.put("dayOfWeek", appointment.getDayOfWeek() != null ? appointment.getDayOfWeek() : "");
                notificationServiceClient.sendNotification("APPOINTMENT_COMPLETED", doctorEmail, doctorPhone, data);
            }
        } catch (Exception ex) {
            log.warn("Notification send failed for completion {}", appointment.getId(), ex);
        }
    }

    private String getString(Map<?, ?> data, String key) {
        if (data == null) {
            return null;
        }
        Object value = data.get(key);
        return value == null ? null : String.valueOf(value);
    }

    private String getFullName(Map<?, ?> data, String firstNameKey, String lastNameKey) {
        String first = getString(data, firstNameKey);
        String last = getString(data, lastNameKey);
        if (first == null && last == null) {
            return null;
        }
        if (first == null) {
            return last;
        }
        if (last == null) {
            return first;
        }
        return first + " " + last;
    }
}
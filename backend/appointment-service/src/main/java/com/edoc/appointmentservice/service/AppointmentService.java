package com.edoc.appointmentservice.service;

import com.edoc.appointmentservice.client.DoctorServiceClient;
import com.edoc.appointmentservice.client.NotificationServiceClient;
import com.edoc.appointmentservice.client.PatientServiceClient;
import com.edoc.appointmentservice.dto.AppointmentRequest;
import com.edoc.appointmentservice.dto.AppointmentStatusUpdate;
import com.edoc.appointmentservice.model.Appointment;
import com.edoc.appointmentservice.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorServiceClient doctorServiceClient;
    private final PatientServiceClient patientServiceClient;
    private final NotificationServiceClient notificationServiceClient;

    // ─── BOOK APPOINTMENT ────────────────────────────────────────────────────

    public Appointment bookAppointment(AppointmentRequest request) {

        // Step 1: Check the slot isn't already taken
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

        // Step 2: Fetch doctor details from doctor-service
        Map doctorData = doctorServiceClient.getDoctorById(request.getDoctorId());

        // Step 3: Build the appointment object
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

        // Step 4: Snapshot doctor details into the appointment
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

        // Step 5: Mark the slot as booked in doctor-service
        // Extract start time from "09:00-09:30" → "09:00"
        String startTime = request.getTimeSlot().split("-")[0];
        doctorServiceClient.markSlotAsBooked(
                request.getDoctorId(),
                request.getDayOfWeek(),
                startTime
        );

        // Step 6: Save and return
        Appointment saved = appointmentRepository.save(appointment);

        notifyBooking(saved, doctorData);

        return saved;
    }

    // ─── GET APPOINTMENTS ────────────────────────────────────────────────────

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

        // If being cancelled, store the reason and free up the slot
        if (update.getStatus() == Appointment.AppointmentStatus.CANCELLED) {
            appointment.setCancellationReason(update.getCancellationReason());

            // Free up the slot in doctor-service
            String startTime = appointment.getTimeSlot().split("-")[0];
            doctorServiceClient.markSlotAsFree(
                    appointment.getDoctorId(),
                    appointment.getDayOfWeek(),
                    startTime
            );
        }

        Appointment saved = appointmentRepository.save(appointment);

        if (update.getStatus() == Appointment.AppointmentStatus.COMPLETED) {
            notifyCompletion(saved);
        }

        return saved;
    }

    // ─── CANCEL APPOINTMENT ──────────────────────────────────────────────────

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

        // Free up the slot in doctor-service
        String startTime = appointment.getTimeSlot().split("-")[0];
        doctorServiceClient.markSlotAsFree(
                appointment.getDoctorId(),
                appointment.getDayOfWeek(),
                startTime
        );

        return appointmentRepository.save(appointment);
    }

    // ─── MODIFY APPOINTMENT ──────────────────────────────────────────────────

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

    private void notifyBooking(Appointment appointment, Map doctorData) {
        try {
            Map patientData = patientServiceClient.getPatientById(appointment.getPatientId());

            String patientEmail = getString(patientData, "email");
            String patientPhone = getString(patientData, "phone");
            String patientName = getFullName(patientData, "firstName", "lastName");

            String doctorEmail = getString(doctorData, "email");
            String doctorPhone = getString(doctorData, "phoneNumber");
            String doctorName = getFullName(doctorData, "firstName", "lastName");

            String subject = "Appointment booked";
            String message = String.format(
                    "Appointment booked for %s on %s (%s) with Dr. %s.",
                    appointment.getTimeSlot(),
                    appointment.getAppointmentDate(),
                    appointment.getDayOfWeek(),
                    appointment.getDoctorName() != null ? appointment.getDoctorName() : doctorName
            );

            if (patientEmail != null || patientPhone != null) {
                String patientMessage = patientName == null
                        ? message
                        : "Hello " + patientName + ", " + message;
                notificationServiceClient.sendEmail(patientEmail, subject, patientMessage);
                notificationServiceClient.sendSms(patientPhone, patientMessage);
            }

            if (doctorEmail != null || doctorPhone != null) {
                String doctorMessage = doctorName == null
                        ? message
                        : "Hello Dr. " + doctorName + ", " + message;
                notificationServiceClient.sendEmail(doctorEmail, subject, doctorMessage);
                notificationServiceClient.sendSms(doctorPhone, doctorMessage);
            }
        } catch (Exception ex) {
            log.warn("Notification send failed for booking {}", appointment.getId(), ex);
        }
    }

    private void notifyCompletion(Appointment appointment) {
        try {
            Map patientData = patientServiceClient.getPatientById(appointment.getPatientId());
            Map doctorData = doctorServiceClient.getDoctorById(appointment.getDoctorId());

            String patientEmail = getString(patientData, "email");
            String patientPhone = getString(patientData, "phone");
            String patientName = getFullName(patientData, "firstName", "lastName");

            String doctorEmail = getString(doctorData, "email");
            String doctorPhone = getString(doctorData, "phoneNumber");
            String doctorName = getFullName(doctorData, "firstName", "lastName");

            String subject = "Consultation completed";
            String message = String.format(
                    "Consultation completed for %s on %s (%s) with Dr. %s.",
                    appointment.getTimeSlot(),
                    appointment.getAppointmentDate(),
                    appointment.getDayOfWeek(),
                    appointment.getDoctorName() != null ? appointment.getDoctorName() : doctorName
            );

            if (patientEmail != null || patientPhone != null) {
                String patientMessage = patientName == null
                        ? message
                        : "Hello " + patientName + ", " + message;
                notificationServiceClient.sendEmail(patientEmail, subject, patientMessage);
                notificationServiceClient.sendSms(patientPhone, patientMessage);
            }

            if (doctorEmail != null || doctorPhone != null) {
                String doctorMessage = doctorName == null
                        ? message
                        : "Hello Dr. " + doctorName + ", " + message;
                notificationServiceClient.sendEmail(doctorEmail, subject, doctorMessage);
                notificationServiceClient.sendSms(doctorPhone, doctorMessage);
            }
        } catch (Exception ex) {
            log.warn("Notification send failed for completion {}", appointment.getId(), ex);
        }
    }

    private String getString(Map data, String key) {
        if (data == null) {
            return null;
        }
        Object value = data.get(key);
        return value == null ? null : String.valueOf(value);
    }

    private String getFullName(Map data, String firstNameKey, String lastNameKey) {
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

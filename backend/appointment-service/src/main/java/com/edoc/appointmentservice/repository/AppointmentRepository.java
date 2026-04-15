package com.edoc.appointmentservice.repository;

import com.edoc.appointmentservice.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    // Get all appointments for a specific patient
    List<Appointment> findByPatientId(String patientId);

    // Get all appointments for a specific doctor
    List<Appointment> findByDoctorId(String doctorId);

    // Get appointments by status (e.g. all PENDING ones for a doctor)
    List<Appointment> findByDoctorIdAndStatus(String doctorId, Appointment.AppointmentStatus status);

    // Get appointments by patient and status
    List<Appointment> findByPatientIdAndStatus(String patientId, Appointment.AppointmentStatus status);

    // Check if a slot is already booked on a specific date
    // Used to prevent double-booking
    boolean existsByDoctorIdAndAppointmentDateAndTimeSlotAndStatusNot(
            String doctorId,
            LocalDate appointmentDate,
            String timeSlot,
            Appointment.AppointmentStatus status
    );

    // Get appointments for a doctor on a specific date
    List<Appointment> findByDoctorIdAndAppointmentDate(String doctorId, LocalDate date);

    // Get all appointments for a patient on a specific date
    List<Appointment> findByPatientIdAndAppointmentDate(String patientId, LocalDate date);

    // NEW - for payment service to find unpaid confirmed appointments
    List<Appointment> findByDoctorIdAndStatusAndPaymentStatus(
            String doctorId,
            Appointment.AppointmentStatus status,
            Appointment.PaymentStatus paymentStatus
    );

    // NEW - get all appointments with a specific payment status
    List<Appointment> findByPatientIdAndPaymentStatus(
            String patientId,
            Appointment.PaymentStatus paymentStatus
    );
}

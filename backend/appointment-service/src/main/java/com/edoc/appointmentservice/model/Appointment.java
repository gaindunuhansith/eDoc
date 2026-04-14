package com.edoc.appointmentservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "appointments")
public class Appointment {

    @Id
    private String id;

    private String patientId;
    private String doctorId;

    // Doctor details snapshot - we store these so if doctor
    // updates profile later, appointment record stays accurate
    private String doctorName;
    private String doctorSpecialty;
    private String doctorHospital;
    private double consultationFee;

    // Appointment date and time
    private LocalDate appointmentDate;
    private String timeSlot;        // e.g. "09:00-09:30"
    private String dayOfWeek;       // e.g. "MONDAY"

    // Type of appointment
    private AppointmentType type;   // IN_PERSON or VIDEO

    // Current status of the appointment
    private AppointmentStatus status;

    // Reason patient is booking
    private String reasonForVisit;

    // Notes added by doctor during/after consultation
    private String doctorNotes;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Video session link - filled when telemedicine session starts
    private String videoSessionLink;

    // Cancellation reason - filled if appointment is cancelled
    private String cancellationReason;

    // Enum for appointment type
    public enum AppointmentType {
        IN_PERSON,
        VIDEO
    }

    // Enum for appointment status
    // This tracks the full lifecycle of an appointment
    public enum AppointmentStatus {
        PENDING,        // Patient booked, waiting for doctor to accept
        CONFIRMED,      // Doctor accepted
        REJECTED,       // Doctor rejected
        COMPLETED,      // Consultation done
        CANCELLED,      // Cancelled by patient or doctor
        NO_SHOW         // Patient didn't show up
    }
}

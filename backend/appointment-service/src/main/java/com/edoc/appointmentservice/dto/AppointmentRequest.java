package com.edoc.appointmentservice.dto;

import com.edoc.appointmentservice.model.Appointment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AppointmentRequest {

    @NotBlank(message = "Patient ID is required")
    private String patientId;

    @NotBlank(message = "Patient userId is required")
    private String patientUserId;  // patient's userId (String UUID) for consistent ID usage

    @NotBlank(message = "Doctor ID is required")
    private String doctorId;

    private String doctorName;   // optional, passed by frontend if available

    @NotNull(message = "Appointment date is required")
    private LocalDate appointmentDate;

    @NotBlank(message = "Time slot is required")
    private String timeSlot;        // "09:00-09:30"

    @NotBlank(message = "Day of week is required")
    private String dayOfWeek;       // "MONDAY"

    @NotNull(message = "Appointment type is required")
    private Appointment.AppointmentType type;

    private String reasonForVisit;

    private String patientName;   // passed by frontend for display in doctor dashboard
}

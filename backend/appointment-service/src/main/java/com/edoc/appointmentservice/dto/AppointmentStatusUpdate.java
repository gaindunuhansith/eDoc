package com.edoc.appointmentservice.dto;

import com.edoc.appointmentservice.model.Appointment;
import lombok.Data;

@Data
public class AppointmentStatusUpdate {

    // New status to set
    private Appointment.AppointmentStatus status;

    // Optional - used when doctor adds notes after consultation
    private String doctorNotes;

    // Optional - used when cancelling
    private String cancellationReason;

    // Optional - used when starting a video session
    private String videoSessionLink;
}

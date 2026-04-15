package com.edoc.appointmentservice.dto;

import com.edoc.appointmentservice.model.Appointment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentStatusUpdate {

    @NotNull(message = "Payment status is required")
    private Appointment.PaymentStatus paymentStatus;

    @NotBlank(message = "Payment ID is required")
    private String paymentId;  // Reference ID from payment service
}

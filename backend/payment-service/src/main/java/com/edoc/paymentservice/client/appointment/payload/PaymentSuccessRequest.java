package com.edoc.paymentservice.client.appointment.payload;

import java.util.UUID;

public record PaymentSuccessRequest(
        UUID paymentId,
        Long appointmentId,
        String status) {
}

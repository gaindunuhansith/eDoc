package com.edoc.paymentservice.service.bridge;

import java.util.UUID;

public record PaymentSuccessNotification(
        UUID paymentId,
        Long appointmentId,
        String status) {
}
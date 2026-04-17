package com.edoc.notificationservice.dto.data;

import java.math.BigDecimal;

public record PaymentSuccessData(
        BigDecimal amount,
        String currency,
        String appointmentId,
        String orderId
) implements NotificationData {}

package com.edoc.paymentservice.client.notification.payload;

import java.util.Map;


public record NotificationRequest(
        NotificationType type,
        String patientId,
        String doctorId,
        String userId,
        Map<String, Object> data
) {
}

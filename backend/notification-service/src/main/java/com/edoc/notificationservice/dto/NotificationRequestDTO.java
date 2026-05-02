package com.edoc.notificationservice.dto;

import java.util.Map;

// Unified request model for event-driven notifications.
// Callers pass IDs — notification-service resolves email/phone itself.
public record NotificationRequestDTO(
        NotificationType type,
        String patientId,   // patient-service ID → resolves phone + email (via userId → user-service)
        String doctorId,    // doctor-service ID  → resolves email + phoneNumber
        String userId,      // user-service UUID  → resolves email directly (used when a userId is known directly)
        Map<String, Object> data
) {
}

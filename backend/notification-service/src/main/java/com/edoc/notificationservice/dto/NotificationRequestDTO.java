package com.edoc.notificationservice.dto;

import java.util.Map;

// Unified request model for event-driven notifications.
// Callers may pass IDs for resolution, or pre-resolved contact info to skip user-service lookups.
public record NotificationRequestDTO(
        NotificationType type,
        String patientId,       // patient-service ID → resolves inboxUserId for in-app inbox
        String doctorId,        // doctor-service ID  → resolves email + phoneNumber via user-service
        String userId,          // user-service UUID  → resolves email directly
        String recipientEmail,  // pre-resolved email; if provided, skips user-service lookup for email/SMS
        String recipientPhone,  // pre-resolved phone; if provided, skips user-service lookup for email/SMS
        Map<String, Object> data
) {
}

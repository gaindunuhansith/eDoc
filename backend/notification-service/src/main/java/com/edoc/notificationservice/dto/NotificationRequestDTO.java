package com.edoc.notificationservice.dto;

import java.util.Map;

// Unified request model for event-driven notifications.
public record NotificationRequestDTO(
        NotificationType type,
        String email,
        String phone,
        Map<String, Object> data
) {
}

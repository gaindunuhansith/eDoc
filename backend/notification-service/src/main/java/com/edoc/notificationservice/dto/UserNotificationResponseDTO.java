package com.edoc.notificationservice.dto;

import java.util.UUID;

// Response DTO for user-facing notification inbox entries.
public record UserNotificationResponseDTO(
        UUID id,
        String userId,
        String type,
        String title,
        String message,
        boolean isRead,
        String createdAt
) {
}

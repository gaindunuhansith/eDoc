package com.edoc.notificationservice.dto;

// Response DTO for user-facing notification inbox entries.
public record UserNotificationResponseDTO(
        Long id,
        String userId,
        String type,
        String title,
        String message,
        boolean isRead,
        String createdAt
) {
}

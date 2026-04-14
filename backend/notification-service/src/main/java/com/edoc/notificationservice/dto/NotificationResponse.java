package com.edoc.notificationservice.dto;

// Provider send result returned to callers.
public record NotificationResponse(String status, String messageId, String error) {
}

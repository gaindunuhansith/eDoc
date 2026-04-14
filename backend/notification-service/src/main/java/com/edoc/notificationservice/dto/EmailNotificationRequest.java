package com.edoc.notificationservice.dto;

// Email send payload.
public record EmailNotificationRequest(String to, String subject, String body) {
}

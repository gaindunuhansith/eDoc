package com.edoc.notificationservice.dto;

public record EmailNotificationRequest(String to, String subject, String body) {
}

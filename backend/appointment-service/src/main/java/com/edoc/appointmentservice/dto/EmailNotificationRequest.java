package com.edoc.appointmentservice.dto;

public record EmailNotificationRequest(String to, String subject, String body) {
}

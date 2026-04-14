package com.edoc.notificationservice.dto;

// SMS send payload.
public record SmsNotificationRequest(String to, String text) {
}

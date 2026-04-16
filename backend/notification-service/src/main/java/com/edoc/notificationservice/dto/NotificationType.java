package com.edoc.notificationservice.dto;

// Supported high-level notification events.
public enum NotificationType {
    APPOINTMENT_BOOKED,
    APPOINTMENT_CONFIRMED,
    APPOINTMENT_CANCELLED,
    APPOINTMENT_COMPLETED,
    FEEDBACK_RECEIVED,
    PAYMENT_SUCCESS
}

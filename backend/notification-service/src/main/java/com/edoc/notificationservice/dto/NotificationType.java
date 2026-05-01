package com.edoc.notificationservice.dto;

// Supported high-level notification events.
public enum NotificationType {
    APPOINTMENT_BOOKED,
    APPOINTMENT_CONFIRMED,
    APPOINTMENT_REJECTED,
    APPOINTMENT_CANCELLED,
    APPOINTMENT_COMPLETED,
    TELEMEDICINE_SESSION_STARTED,
    FEEDBACK_RECEIVED,
    PAYMENT_SUCCESS
}

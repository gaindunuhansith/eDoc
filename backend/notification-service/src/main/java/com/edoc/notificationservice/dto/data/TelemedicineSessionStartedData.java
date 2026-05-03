package com.edoc.notificationservice.dto.data;

public record TelemedicineSessionStartedData(
        String recipientName,   // may be null — telemedicine-service does not always supply it
        String doctorName,
        String date,
        String timeSlot
) implements NotificationData {}

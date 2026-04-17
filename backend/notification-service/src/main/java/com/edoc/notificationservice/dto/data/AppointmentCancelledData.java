package com.edoc.notificationservice.dto.data;

public record AppointmentCancelledData(
        String patientName,
        String date,
        String dayOfWeek,
        String timeSlot
) implements NotificationData {}

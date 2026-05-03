package com.edoc.notificationservice.dto.data;

public record AppointmentConfirmedData(
        String patientName,
        String date,
        String dayOfWeek,
        String timeSlot
) implements NotificationData {}

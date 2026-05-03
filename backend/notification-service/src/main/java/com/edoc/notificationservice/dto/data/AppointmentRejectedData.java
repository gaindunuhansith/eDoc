package com.edoc.notificationservice.dto.data;

public record AppointmentRejectedData(
        String patientName,
        String doctorName,
        String date,
        String dayOfWeek,
        String timeSlot
) implements NotificationData {}

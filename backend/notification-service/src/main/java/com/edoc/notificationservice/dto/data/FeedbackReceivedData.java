package com.edoc.notificationservice.dto.data;

public record FeedbackReceivedData(
        String doctorName,   // may be null — feedback-service does not supply it
        Integer rating,
        String comment
) implements NotificationData {}

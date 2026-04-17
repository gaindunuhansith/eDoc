package com.edoc.notificationservice.dto.data;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

// Sealed interface for strongly-typed notification payload data.
// Jackson uses the sibling "type" field in NotificationRequestDTO (EXTERNAL_PROPERTY)
// to select the correct subtype for deserialization.
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = AppointmentBookedData.class,            name = "APPOINTMENT_BOOKED"),
        @JsonSubTypes.Type(value = AppointmentConfirmedData.class,         name = "APPOINTMENT_CONFIRMED"),
        @JsonSubTypes.Type(value = AppointmentRejectedData.class,          name = "APPOINTMENT_REJECTED"),
        @JsonSubTypes.Type(value = AppointmentCancelledData.class,         name = "APPOINTMENT_CANCELLED"),
        @JsonSubTypes.Type(value = AppointmentCompletedData.class,         name = "APPOINTMENT_COMPLETED"),
        @JsonSubTypes.Type(value = TelemedicineSessionStartedData.class,   name = "TELEMEDICINE_SESSION_STARTED"),
        @JsonSubTypes.Type(value = FeedbackReceivedData.class,             name = "FEEDBACK_RECEIVED"),
        @JsonSubTypes.Type(value = PaymentSuccessData.class,               name = "PAYMENT_SUCCESS")
})
public sealed interface NotificationData
        permits AppointmentBookedData, AppointmentConfirmedData, AppointmentRejectedData,
                AppointmentCancelledData, AppointmentCompletedData, TelemedicineSessionStartedData,
                FeedbackReceivedData, PaymentSuccessData {
}

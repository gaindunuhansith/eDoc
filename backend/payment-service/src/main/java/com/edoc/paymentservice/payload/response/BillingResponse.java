package com.edoc.paymentservice.payload.response;

public record BillingResponse(
        String fullName,
        String email,
        String phone,
        String address,
        String city,
        String country) {
}

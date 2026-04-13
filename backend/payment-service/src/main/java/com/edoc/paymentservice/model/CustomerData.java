package com.edoc.paymentservice.model;

public record CustomerData(
        String firstName,
        String lastName,
        String email,
        String phone,
        String address,
        String city,
        String country
) {
}

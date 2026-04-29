package com.edoc.paymentservice.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BillingRequest(

        @NotBlank(message = "full name is required")
        @Size(max = 150, message = "full name must not exceed 150 characters")
        String fullName,

        @NotBlank(message = "email is required")
        @Email(message = "email must be a valid address")
        @Size(max = 255, message = "email must not exceed 255 characters")
        String email,

        @NotBlank(message = "phone is required")
        @Size(max = 30, message = "phone must not exceed 30 characters")
        String phone,

        @Size(max = 255, message = "address must not exceed 255 characters")
        String address,

        @Size(max = 100, message = "city must not exceed 100 characters")
        String city,

        @NotBlank(message = "country is required")
        @Size(max = 100, message = "country must not exceed 100 characters")
        String country) {
}

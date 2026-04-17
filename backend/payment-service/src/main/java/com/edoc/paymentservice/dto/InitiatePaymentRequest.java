package com.edoc.paymentservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InitiatePaymentRequest {

    @NotNull(message = "Appointment ID is required")
    private UUID appointmentId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Currency is required")
    @Pattern(regexp = "^[A-Za-z]{3}$", message = "Currency must be a 3-letter ISO code")
    private String currency;


    @NotNull(message = "User ID is required")
    private UUID userId;

    private String firstName;

    private String lastName;

    @Email(message = "Email must be valid")
    private String email;

    private String phone;

    private String address;

    private String city;

    private String country;

    // Optional metadata can be passed through for tracing/custom fields.
    private Map<String, String> metadata;
}
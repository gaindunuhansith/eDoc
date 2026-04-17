package com.edoc.paymentservice.payload.request;

import com.edoc.paymentservice.type.CurrencyType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record InitiatePaymentRequest(
        @NotBlank(message = "appointment is required")
        @Size(max = 200, message = "appointmentId must not exceed 200 characters")
        String appointmentId,

        @NotNull(message = "amount is required")
        @Positive(message = "amount must be positive")
        BigDecimal amount,

        @NotNull(message = "currency is required")
        CurrencyType currency,

        @NotNull(message = "billing details are required")
        @Valid
        BillingRequest billing) {
}


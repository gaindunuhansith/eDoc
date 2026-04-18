package com.edoc.paymentservice.dto;

import com.edoc.paymentservice.type.CurrencyType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record InitiatePaymentRequest(
        @NotNull(message = "appointment is required")
        Long appointmentId,

        @NotNull(message = "amount is required")
        @Positive(message = "amount must be positive")
        BigDecimal amount,

        @NotNull(message = "currency is required")
        CurrencyType currency) {
}

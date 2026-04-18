package com.edoc.paymentservice.dto;

import com.edoc.paymentservice.type.CurrencyType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record InitiatePaymentRequest(
        @NotNull Long appointmentId,
        @NotNull @Positive BigDecimal amount,
        @NotNull CurrencyType currency) {
}

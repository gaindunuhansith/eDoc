package com.edoc.paymentservice.dto;

import com.edoc.paymentservice.type.CurrencyType;
import com.edoc.paymentservice.type.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentHistoryResponse(
        UUID id,
        Long appointmentId,
        Long userId,
        BigDecimal amount,
        CurrencyType currency,
        PaymentStatus status,
        String orderId,
        Instant createdAt) {
}

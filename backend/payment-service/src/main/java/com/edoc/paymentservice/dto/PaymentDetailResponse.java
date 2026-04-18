package com.edoc.paymentservice.dto;

import com.edoc.paymentservice.type.CurrencyType;
import com.edoc.paymentservice.type.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PaymentDetailResponse(
        UUID id,
        Long appointmentId,
        BigDecimal amount,
        CurrencyType currency,
        PaymentStatus status,
        String orderId,
        Instant createdAt,
        List<TransactionLogEntryResponse> transactionLogs) {
}

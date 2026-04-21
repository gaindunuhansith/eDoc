package com.edoc.paymentservice.dto;

import java.time.Instant;
import java.util.UUID;

public record TransactionLogEntryResponse(
        UUID id,
        String event,
        String rawPayload,
        Instant createdAt) {
}

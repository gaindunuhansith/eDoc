package com.edoc.paymentservice.payload.response;

import java.time.Instant;
import java.util.UUID;

public record TransactionLogEntryResponse(
        UUID id,
        String event,
        String rawPayload,
        Instant createdAt) {
}

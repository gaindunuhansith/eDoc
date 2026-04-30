package com.edoc.paymentservice.payload.response;

public record ErrorResponse(
        String code,
        String message,
        String traceId) {
}

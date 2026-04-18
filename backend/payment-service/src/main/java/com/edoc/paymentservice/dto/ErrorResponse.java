package com.edoc.paymentservice.dto;

public record ErrorResponse(
        String code,
        String message,
        String traceId) {
}

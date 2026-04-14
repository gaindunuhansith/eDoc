package com.edoc.paymentservice.model.enums;

public enum PaymentStatus {
    PENDING,
    COMPLETED,
    FAILED,
    REFUNDED

    ;

    public static PaymentStatus fromPayHereCode(String statusCode) {
        return switch (statusCode) {
            case "2" -> COMPLETED;
            case "0" -> PENDING;
            case "-1", "-2", "-3" -> FAILED;
            default -> throw new IllegalArgumentException("Unsupported PayHere status_code: " + statusCode);
        };
    }

    public boolean canTransitionTo(PaymentStatus incoming) {
        if (this == COMPLETED) {
            return false;
        }
        if (this == FAILED && incoming == PENDING) {
            return false;
        }
        return this != incoming;
    }
}

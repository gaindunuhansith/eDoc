package com.edoc.paymentservice.constant;

public final class ErrorCodes {

    private ErrorCodes() {
    }

    public static final String ERR_DUPLICATE_TRANSACTION = "ERR_DUPLICATE_TRANSACTION";
    public static final String ERR_PAYMENT_COMPLETED = "ERR_PAYMENT_COMPLETED";
    public static final String ERR_INVALID_SIGNATURE = "ERR_INVALID_SIGNATURE";
    public static final String ERR_NOT_FOUND = "ERR_NOT_FOUND";
    public static final String ERR_INTERNAL = "ERR_INTERNAL";
    public static final String ERR_VALIDATION = "ERR_VALIDATION";
}

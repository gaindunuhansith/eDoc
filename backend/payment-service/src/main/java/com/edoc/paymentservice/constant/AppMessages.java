package com.edoc.paymentservice.constant;

public final class AppMessages {



    private AppMessages() {
    }

    public static final String DUPLICATE_TRANSACTION = "Duplicate transaction detected";
    public static final String PAYMENT_ALREADY_COMPLETED = "Payment already completed for appointment";
    public static final String INVALID_SIGNATURE = "Invalid webhook signature";
    public static final String PAYMENT_NOT_FOUND = "Payment record not found";
    public static final String INTERNAL_ERROR = "Unexpected internal error";
    public static final String VALIDATION_ERROR = "One or more request fields failed validation";
    public static final String RECONCILE_FLAGGED = "Payment has been flagged for manual reconciliation";
}

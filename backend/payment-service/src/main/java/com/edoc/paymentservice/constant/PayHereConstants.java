package com.edoc.paymentservice.constant;

public final class PayHereConstants {

    private PayHereConstants() {
    }

    public static final String STATUS_SUCCESS = "2";
    public static final String STATUS_PENDING = "0";
    public static final String STATUS_FAILED = "-1";

    public static final String EVENT_WEBHOOK_RECEIVED = "WEBHOOK_RECEIVED";
    public static final String EVENT_PAYMENT_INITIATED = "PAYMENT_INITIATED";
    public static final String EVENT_REST_NOTIFY_SENT = "REST_NOTIFY_SENT";
    public static final String EVENT_REST_NOTIFY_FAILED = "REST_NOTIFY_FAILED";
    public static final String EVENT_RECONCILE_FLAGGED = "RECONCILE_FLAGGED";
}

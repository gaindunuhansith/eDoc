package com.edoc.paymentservice.exception;

public class InvalidNotificationSignatureException extends RuntimeException {

    public InvalidNotificationSignatureException(String message) {
        super(message);
    }
}

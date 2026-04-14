package com.edoc.notificationservice.service;

public record ResendSendResult(boolean success, String messageId, String error) {

    public static ResendSendResult success(String messageId) {
        return new ResendSendResult(true, messageId, null);
    }

    public static ResendSendResult failure(String error) {
        return new ResendSendResult(false, null, error);
    }
}

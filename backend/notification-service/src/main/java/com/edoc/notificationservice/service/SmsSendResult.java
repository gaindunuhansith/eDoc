package com.edoc.notificationservice.service;

public record SmsSendResult(boolean success, String messageId, String error) {

    public static SmsSendResult success(String messageId) {
        return new SmsSendResult(true, messageId, null);
    }

    public static SmsSendResult failure(String error) {
        return new SmsSendResult(false, null, error);
    }
}

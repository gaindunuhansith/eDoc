package com.edoc.paymentservice.util;

import java.util.Map;

public final class ValidationUtils {

    private ValidationUtils() {}

    public static String requireParam(Map<String, String> params, String key) {
        String value = params.get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Missing required notify parameter: " + key);
        }
        return value.trim();
    }
}

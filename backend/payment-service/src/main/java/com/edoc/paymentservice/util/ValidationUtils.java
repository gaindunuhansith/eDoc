package com.edoc.paymentservice.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

public final class ValidationUtils {

    private static final Logger log = LoggerFactory.getLogger(ValidationUtils.class);

    private ValidationUtils() {}

    public static String requireParam(Map<String, String> params, String key) {
        String value = params.get(key);
        if (value == null || value.isBlank()) {
            log.warn("Missing required notify parameter: {}", key);
            throw new IllegalArgumentException("Missing required notify parameter: " + key);
        }
        return value.trim();
    }
}

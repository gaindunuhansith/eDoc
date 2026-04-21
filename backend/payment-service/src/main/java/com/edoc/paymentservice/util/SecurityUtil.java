package com.edoc.paymentservice.util;

import org.slf4j.MDC;

public final class SecurityUtil {

    private SecurityUtil() {
    }

    public static void populateMdc(String orderId, Long userId) {
        if (orderId != null && !orderId.isBlank()) {
            MDC.put("orderId", orderId);
        }
        if (userId != null) {
            MDC.put("userId", String.valueOf(userId));
        }
    }

    public static void clearMdc() {
        MDC.remove("orderId");
        MDC.remove("userId");
    }
}

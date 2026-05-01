package com.edoc.paymentservice.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Locale;

public final class HashUtil {

    private HashUtil() {
    }

    public static String generateInitiationHash(
            String merchantId,
            String orderId,
            BigDecimal amount,
            String currency,
            String merchantSecret) {
        String payload = sanitize(merchantId)
                + sanitize(orderId)
                + formatAmount(amount)
                + sanitize(currency)
                + md5(sanitize(merchantSecret)).toUpperCase(Locale.ROOT);
        return md5(payload).toUpperCase(Locale.ROOT);
    }

    public static boolean verifyWebhookSignature(
            String merchantId,
            String orderId,
            String payhereAmount,
            String payhereCurrency,
            String statusCode,
            String merchantSecret,
            String providedSignature) {
        String payload = sanitize(merchantId)
                + sanitize(orderId)
                + sanitize(payhereAmount)
                + sanitize(payhereCurrency)
                + sanitize(statusCode)
                + md5(sanitize(merchantSecret)).toUpperCase(Locale.ROOT);

        String calculated = md5(payload).toUpperCase(Locale.ROOT);
        return calculated.equals(sanitize(providedSignature).toUpperCase(Locale.ROOT));
    }

    private static String sanitize(String input) {
        return input == null ? "" : input.trim();
    }

    private static String formatAmount(BigDecimal amount) {
        if (amount == null) {
            return "0.00";
        }
        return amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private static String md5(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder();
            for (byte b : hash) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("MD5 algorithm not available", ex);
        }
    }
}

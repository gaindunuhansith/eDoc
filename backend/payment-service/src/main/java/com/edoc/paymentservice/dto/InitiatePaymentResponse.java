package com.edoc.paymentservice.dto;

import java.math.BigDecimal;

public record InitiatePaymentResponse(

        String orderId,
        String merchantId,
        BigDecimal amount,
        String currency,
        String hash,
        String checkoutUrl,
        String notifyUrl) {
}

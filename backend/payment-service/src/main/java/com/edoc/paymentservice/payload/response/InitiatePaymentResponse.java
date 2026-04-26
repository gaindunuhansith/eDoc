package com.edoc.paymentservice.payload.response;

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

package com.edoc.paymentservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "payhere")
public record PayHereProperties(
        String merchantId,
        String merchantSecret,
        String checkoutUrl,
        String returnUrl,
        String cancelUrl,
        String notifyUrl,
        boolean sandbox
) {
}

package com.edoc.paymentservice.service;

import com.edoc.paymentservice.config.PayHereProperties;
import com.edoc.paymentservice.util.HashUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PayHereSignatureService {

    private final PayHereProperties payHereProperties;

    public String generate(String orderId, String amount, String currency, String statusCode) {
        String hashedSecret = HashUtils.md5Upper(payHereProperties.merchantSecret());
        return HashUtils.md5Upper(payHereProperties.merchantId() + orderId + amount + currency + statusCode + hashedSecret);
    }
}

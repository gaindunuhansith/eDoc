package com.edoc.notificationservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.vonage.client.VonageClient;
import com.vonage.client.messages.sms.SmsTextRequest;

@Component
public class VonageSmsClient {

    private final String apiKey;
    private final String apiSecret;
    private final String smsFrom;
    private final VonageClient vonageClient;

    public VonageSmsClient(
            @Value("${vonage.api-key:}") String apiKey,
            @Value("${vonage.api-secret:}") String apiSecret,
            @Value("${vonage.sms-from:Vonage APIs}") String smsFrom) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.smsFrom = smsFrom;
        this.vonageClient = buildClient();
    }

    public SmsSendResult sendSms(String to, String text) {
        if (apiKey == null || apiKey.isBlank()) {
            return SmsSendResult.failure("Vonage API key is missing.");
        }
        if (apiSecret == null || apiSecret.isBlank()) {
            return SmsSendResult.failure("Vonage API secret is missing.");
        }
        if (smsFrom == null || smsFrom.isBlank()) {
            return SmsSendResult.failure("Vonage SMS from is missing.");
        }

        try {
            var response = vonageClient.getMessagesClient().sendMessage(
                    SmsTextRequest.builder()
                            .from(smsFrom)
                            .to(to)
                            .text(text)
                            .build()
            );
            return SmsSendResult.success(response.getMessageUuid());
        } catch (Exception ex) {
            return SmsSendResult.failure("Vonage request failed: " + ex.getMessage());
        }
    }

    private VonageClient buildClient() {
        return VonageClient.builder()
                .apiKey(apiKey)
                .apiSecret(apiSecret)
                .build();
    }
}

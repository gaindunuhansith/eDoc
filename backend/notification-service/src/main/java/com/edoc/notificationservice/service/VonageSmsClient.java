package com.edoc.notificationservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.vonage.client.VonageClient;
import com.vonage.client.sms.MessageStatus;
import com.vonage.client.sms.SmsSubmissionResponse;
import com.vonage.client.sms.SmsSubmissionResponseMessage;
import com.vonage.client.sms.messages.TextMessage;

@Component
// Vonage SMS API client — uses API key + secret (no JWT required).
public class VonageSmsClient {

    private final String apiKey;
    private final String apiSecret;
    private final String smsFrom;
    private final VonageClient vonageClient;

    public VonageSmsClient(
            @Value("${vonage.api-key:}") String apiKey,
            @Value("${vonage.api-secret:}") String apiSecret,
            @Value("${vonage.sms-from:eDoc}") String smsFrom) {
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
            TextMessage message = new TextMessage(smsFrom, to, text);
            SmsSubmissionResponse response = vonageClient.getSmsClient().submitMessage(message);

            if (response == null || response.getMessages() == null || response.getMessages().isEmpty()) {
                return SmsSendResult.failure("Vonage returned an empty response.");
            }

            SmsSubmissionResponseMessage first = response.getMessages().get(0);
            if (first.getStatus() == MessageStatus.OK) {
                return SmsSendResult.success(first.getId());
            }
            return SmsSendResult.failure(
                    "Vonage error [" + first.getStatus() + "]: " + first.getErrorText());

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

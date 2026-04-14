package com.edoc.notificationservice.service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class ResendEmailClient {

    private final String apiKey;
    private final String fromEmail;
    private final String apiUrl;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public ResendEmailClient(
            @Value("${resend.api-key:}") String apiKey,
            @Value("${resend.from-email:}") String fromEmail,
            @Value("${resend.api-url:https://api.resend.com/emails}") String apiUrl,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.apiUrl = apiUrl;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public ResendSendResult sendEmail(String to, String subject, String body) {
        if (apiKey == null || apiKey.isBlank()) {
            return ResendSendResult.failure("Resend API key is missing.");
        }
        if (fromEmail == null || fromEmail.isBlank()) {
            return ResendSendResult.failure("Resend from email is missing.");
        }

        try {
            String payload = objectMapper.writeValueAsString(Map.of(
                    "from", fromEmail,
                    "to", List.of(to),
                    "subject", subject,
                    "text", body
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .timeout(Duration.ofSeconds(20))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                String messageId = extractMessageId(response.body());
                return ResendSendResult.success(messageId);
            }

            return ResendSendResult.failure("Resend error " + response.statusCode() + ": " + response.body());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            return ResendSendResult.failure("Resend request interrupted: " + ex.getMessage());
        } catch (IOException ex) {
            return ResendSendResult.failure("Resend request failed: " + ex.getMessage());
        }
    }

    private String extractMessageId(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return null;
        }
        try {
            JsonNode node = objectMapper.readTree(responseBody);
            if (node.hasNonNull("id")) {
                return node.get("id").asText();
            }
        } catch (IOException ignored) {
            return null;
        }
        return null;
    }
}

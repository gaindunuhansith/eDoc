package com.edoc.notificationservice.service;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
// Resend API client for outbound emails.
public class ResendEmailClient {

    private final String apiKey;
    private final String fromEmail;
    private final String apiUrl;
        private final RestTemplate restTemplate;

    public ResendEmailClient(
            @Value("${resend.api-key:}") String apiKey,
            @Value("${resend.from-email:}") String fromEmail,
            @Value("${resend.api-url:https://api.resend.com/emails}") String apiUrl) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.apiUrl = apiUrl;
        this.restTemplate = buildRestTemplate();
    }

    private RestTemplate buildRestTemplate() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) Duration.ofSeconds(10).toMillis());
        requestFactory.setReadTimeout((int) Duration.ofSeconds(20).toMillis());
        return new RestTemplate(requestFactory);
    }

    public ResendSendResult sendEmail(String to, String subject, String body) {
        if (apiKey == null || apiKey.isBlank()) {
            return ResendSendResult.failure("Resend API key is missing.");
        }
        if (fromEmail == null || fromEmail.isBlank()) {
            return ResendSendResult.failure("Resend from email is missing.");
        }

        try {
            Map<String, Object> payload = Map.of(
                    "from", fromEmail,
                    "to", List.of(to),
                    "subject", subject,
                    "text", body
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            ResponseEntity<Map> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                String messageId = extractMessageId(response.getBody());
                return ResendSendResult.success(messageId);
            }

            return ResendSendResult.failure("Resend error " + response.getStatusCode().value());
        } catch (HttpStatusCodeException ex) {
            return ResendSendResult.failure("Resend error " + ex.getStatusCode().value() + ": " + ex.getResponseBodyAsString());
        } catch (RestClientException ex) {
            return ResendSendResult.failure("Resend request failed: " + ex.getMessage());
        }
    }

    private String extractMessageId(Map<?, ?> responseBody) {
        if (responseBody == null) {
            return null;
        }
        Object id = responseBody.get("id");
        return id == null ? null : String.valueOf(id);
    }
}

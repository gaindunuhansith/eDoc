package com.edoc.telemedicineservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class NotificationServiceClient {

    @Value("${notification.service.url}")
    private String notificationServiceUrl;

    private final WebClient.Builder webClientBuilder;

    public NotificationServiceClient(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    public void sendEmail(String to, String subject, String body, String authorizationHeader) {
        if (to == null || to.isBlank()) {
            System.out.println("Email recipient is null or blank, skipping notification");
            return;
        }
        try {
            WebClient webClient = webClientBuilder.build();
            if (authorizationHeader != null && !authorizationHeader.isBlank()) {
                webClient = webClient.mutate().defaultHeader("Authorization", authorizationHeader).build();
            }
            
            webClient
                    .post()
                    .uri(notificationServiceUrl + "/api/v1/notifications/email")
                    .bodyValue(new EmailNotificationRequest(to, subject, body))
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
            System.out.println("Email notification sent to " + to);
        } catch (Exception ex) {
            System.err.println("Failed to send email notification to " + to + ": " + ex.getMessage());
        }
    }

    public void sendSms(String to, String text, String authorizationHeader) {
        if (to == null || to.isBlank()) {
            System.out.println("SMS recipient is null or blank, skipping notification");
            return;
        }
        try {
            WebClient webClient = webClientBuilder.build();
            if (authorizationHeader != null && !authorizationHeader.isBlank()) {
                webClient = webClient.mutate().defaultHeader("Authorization", authorizationHeader).build();
            }
            
            webClient
                    .post()
                    .uri(notificationServiceUrl + "/api/v1/notifications/sms")
                    .bodyValue(new SmsNotificationRequest(to, text))
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
            System.out.println("SMS notification sent to " + to);
        } catch (Exception ex) {
            System.err.println("Failed to send SMS notification to " + to + ": " + ex.getMessage());
        }
    }

    public record EmailNotificationRequest(String to, String subject, String body) {}

    public record SmsNotificationRequest(String to, String text) {}
}
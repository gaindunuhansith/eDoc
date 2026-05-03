package com.edoc.telemedicineservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Component
public class NotificationServiceClient {

    @Value("${notification.service.url}")
    private String notificationServiceUrl;

    private final WebClient.Builder webClientBuilder;

    public NotificationServiceClient(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    public void sendSessionStartedToPatient(String patientId, String doctorName, String date,
                                            String timeSlot, String authorizationHeader) {
        if (patientId == null || patientId.isBlank()) {
            return;
        }

        sendUnified(
                new NotificationRequest(
                        "TELEMEDICINE_SESSION_STARTED",
                        patientId,
                        null,
                        null,
                        Map.of(
                                "doctorName", doctorName == null ? "Doctor" : doctorName,
                                "date", date == null ? "today" : date,
                                "timeSlot", timeSlot == null ? "scheduled time" : timeSlot
                        )
                ),
                authorizationHeader
        );
    }

    private void sendUnified(NotificationRequest request, String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new IllegalArgumentException("Authorization header is required for inter-service calls");
        }
        try {
            WebClient webClient = webClientBuilder.defaultHeader("Authorization", authorizationHeader).build();

            webClient
                    .post()
                    .uri(notificationServiceUrl + "/api/v1/notifications/send")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception ex) {
            System.err.println("Failed to send telemedicine notification: " + ex.getMessage());
        }
    }

    public record NotificationRequest(
            String type,
            String patientId,
            String doctorId,
            String userId,
            Map<String, Object> data
    ) {}
}
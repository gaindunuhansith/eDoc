package com.edoc.appointmentservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceClient {

    @Value("${notification.service.url}")
    private String notificationServiceUrl;

    private final WebClient.Builder webClientBuilder;

    public void sendToPatient(String type, String patientId, Map<String, Object> data) {
        send(new NotificationRequest(type, patientId, null, null, data));
    }

    public void sendToDoctor(String type, String doctorId, Map<String, Object> data) {
        send(new NotificationRequest(type, null, doctorId, null, data));
    }

    private void send(NotificationRequest request) {
        try {
            webClientBuilder.build()
                    .post()
                    .uri(notificationServiceUrl + "/api/v1/notifications/send")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception ex) {
            log.error("Failed to send notification type={}", request.type(), ex);
        }
    }

    private record NotificationRequest(String type, String patientId, String doctorId, Long userId, Map<String, Object> data) {}
}


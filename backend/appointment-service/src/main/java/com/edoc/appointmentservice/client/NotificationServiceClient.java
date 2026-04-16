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

    public void sendNotification(String type, String email, String phone, Map<String, Object> data) {
        try {
            webClientBuilder.build()
                    .post()
                    .uri(notificationServiceUrl + "/notifications/send")
                    .bodyValue(new NotificationRequest(type, email, phone, data))
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception ex) {
            log.error("Failed to send notification type={} to email={} phone={}", type, email, phone, ex);
        }
    }

    private record NotificationRequest(String type, String email, String phone, Map<String, Object> data) {}
}


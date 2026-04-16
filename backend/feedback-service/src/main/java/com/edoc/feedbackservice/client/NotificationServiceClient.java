package com.edoc.feedbackservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;

@Service
public class NotificationServiceClient {

    private final RestClient restClient;

    @Value("${notification.service.base-url}")
    private String notificationServiceBaseUrl;

    public NotificationServiceClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public void sendNotification(String type, String email, String phone, Map<String, Object> data) {
        NotificationRequest request = new NotificationRequest(type, email, phone, data);
        try {
            restClient.post()
                    .uri(notificationServiceBaseUrl + "/notifications/send")
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException ex) {
            System.err.println("Error sending notification: " + ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            System.err.println("Unexpected error sending notification: " + ex.getMessage());
            throw new RuntimeException("Failed to send notification");
        }
    }

    private record NotificationRequest(String type, String email, String phone, Map<String, Object> data) {}
}

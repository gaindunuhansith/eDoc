package com.edoc.feedbackservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
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

    public void sendToDoctorById(String type, String doctorId, Map<String, Object> data) {
        NotificationRequest request = new NotificationRequest(type, null, doctorId, null, data);
        try {
            restClient.post()
                    .uri(notificationServiceBaseUrl + "/api/v1/notifications/send")
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException ex) {
            System.err.println("Error sending notification: " + ex.getMessage());
        } catch (Exception ex) {
            System.err.println("Unexpected error sending notification: " + ex.getMessage());
        }
    }

    public void sendToUser(String type, Long userId, Map<String, Object> data) {
        NotificationRequest request = new NotificationRequest(type, null, null, userId, data);
        try {
            restClient.post()
                    .uri(notificationServiceBaseUrl + "/api/v1/notifications/send")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException ex) {
            System.err.println("Error sending notification: " + ex.getMessage());
        } catch (Exception ex) {
            System.err.println("Unexpected error sending notification: " + ex.getMessage());
        }
    }

    private record NotificationRequest(String type, String patientId, String doctorId, String userId, Map<String, Object> data) {}
}

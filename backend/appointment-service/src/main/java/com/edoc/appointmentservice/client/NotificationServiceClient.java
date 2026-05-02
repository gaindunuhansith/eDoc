package com.edoc.appointmentservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
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
        String bearerToken = extractBearerToken();
        try {
            WebClient.RequestBodySpec req = webClientBuilder.build()
                    .post()
                    .uri(notificationServiceUrl + "/api/v1/notifications/send");
            if (bearerToken != null) {
                req = req.header("Authorization", bearerToken);
            }
            req.bodyValue(request)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception ex) {
            log.error("Failed to send notification type={}", request.type(), ex);
        }
    }

    // Extract the JWT Bearer token from the current request's SecurityContext so it can be
    // forwarded to the notification-service, which requires authentication on /send.
    private String extractBearerToken() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            return "Bearer " + jwtAuth.getToken().getTokenValue();
        }
        return null;
    }

    private record NotificationRequest(String type, String patientId, String doctorId, String userId, Map<String, Object> data) {}
}


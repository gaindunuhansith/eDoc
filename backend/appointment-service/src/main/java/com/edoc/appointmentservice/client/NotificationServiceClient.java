package com.edoc.appointmentservice.client;

import com.edoc.appointmentservice.dto.EmailNotificationRequest;
import com.edoc.appointmentservice.dto.SmsNotificationRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceClient {

    @Value("${notification.service.url}")
    private String notificationServiceUrl;

    private final WebClient.Builder webClientBuilder;

    public void sendEmail(String to, String subject, String body) {
        if (to == null || to.isBlank()) {
            return;
        }
        try {
            webClientBuilder.build()
                    .post()
                    .uri(notificationServiceUrl + "/notifications/email")
                    .bodyValue(new EmailNotificationRequest(to, subject, body))
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception ex) {
            log.error("Failed to send email notification to {}", to, ex);
        }
    }

    public void sendSms(String to, String text) {
        if (to == null || to.isBlank()) {
            return;
        }
        try {
            webClientBuilder.build()
                    .post()
                    .uri(notificationServiceUrl + "/notifications/sms")
                    .bodyValue(new SmsNotificationRequest(to, text))
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception ex) {
            log.error("Failed to send SMS notification to {}", to, ex);
        }
    }
}

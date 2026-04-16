package com.edoc.feedbackservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Service
public class NotificationServiceClient {

    private final WebClient webClient;

    @Value("${notification.service.url}")
    private String notificationServiceUrl;

    public NotificationServiceClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public Mono<Void> sendEmail(String to, String subject, String body, String authHeader) {
        EmailRequest emailRequest = new EmailRequest(to, subject, body);
        return webClient.post()
                .uri(notificationServiceUrl + "/email")
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .bodyValue(emailRequest)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnError(error -> {
                    if (error instanceof WebClientResponseException e) {
                        System.err.println("Error sending email notification: " + e.getMessage());
                    } else {
                        System.err.println("Unexpected error sending email: " + error.getMessage());
                    }
                });
    }

    public Mono<Void> sendSms(String to, String message, String authHeader) {
        SmsRequest smsRequest = new SmsRequest(to, message);
        return webClient.post()
                .uri(notificationServiceUrl + "/sms")
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .bodyValue(smsRequest)
                .retrieve()
                .bodyToMono(Void.class)
                .doOnError(error -> {
                    if (error instanceof WebClientResponseException e) {
                        System.err.println("Error sending SMS notification: " + e.getMessage());
                    } else {
                        System.err.println("Unexpected error sending SMS: " + error.getMessage());
                    }
                });
    }

    private static class EmailRequest {
        private String to;
        private String subject;
        private String body;

        public EmailRequest(String to, String subject, String body) {
            this.to = to;
            this.subject = subject;
            this.body = body;
        }

        // Getters
        public String getTo() { return to; }
        public String getSubject() { return subject; }
        public String getBody() { return body; }
    }

    private static class SmsRequest {
        private String to;
        private String message;

        public SmsRequest(String to, String message) {
            this.to = to;
            this.message = message;
        }

        // Getters
        public String getTo() { return to; }
        public String getMessage() { return message; }
    }
}
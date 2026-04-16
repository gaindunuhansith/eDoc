package com.edoc.feedbackservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Service
public class NotificationServiceClient {

    private final RestClient restClient;

    @Value("${notification.service.base-url}")
    private String notificationServiceBaseUrl;

    public NotificationServiceClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public void sendEmail(String to, String subject, String body, String authHeader) {
        EmailRequest emailRequest = new EmailRequest(to, subject, body);
        try {
            restClient.post()
                    .uri(notificationServiceBaseUrl + "/api/notifications/email")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .body(emailRequest)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException ex) {
            System.err.println("Error sending email notification: " + ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            System.err.println("Unexpected error sending email: " + ex.getMessage());
            throw new RuntimeException("Failed to send email notification");
        }
    }

    public void sendSms(String to, String message, String authHeader) {
        SmsRequest smsRequest = new SmsRequest(to, message);
        try {
            restClient.post()
                    .uri(notificationServiceBaseUrl + "/api/notifications/sms")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .body(smsRequest)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientResponseException ex) {
            System.err.println("Error sending SMS notification: " + ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            System.err.println("Unexpected error sending SMS: " + ex.getMessage());
            throw new RuntimeException("Failed to send SMS notification");
        }
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
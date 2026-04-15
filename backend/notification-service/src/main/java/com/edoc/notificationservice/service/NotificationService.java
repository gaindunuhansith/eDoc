package com.edoc.notificationservice.service;

import org.springframework.stereotype.Service;

import com.edoc.notificationservice.dto.EmailNotificationRequest;
import com.edoc.notificationservice.dto.NotificationResponse;
import com.edoc.notificationservice.dto.SmsNotificationRequest;
import com.edoc.notificationservice.model.NotificationChannel;
import com.edoc.notificationservice.model.NotificationLog;
import com.edoc.notificationservice.model.NotificationStatus;
import com.edoc.notificationservice.repository.NotificationLogRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import com.edoc.notificationservice.dto.NotificationRequestDTO;
import com.edoc.notificationservice.dto.NotificationType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final ResendEmailClient resendEmailClient;
    private final VonageSmsClient vonageSmsClient;
    private final NotificationLogRepository notificationLogRepository;

    public NotificationService(ResendEmailClient resendEmailClient,
                               VonageSmsClient vonageSmsClient,
                               NotificationLogRepository notificationLogRepository) {
        this.resendEmailClient = resendEmailClient;
        this.vonageSmsClient = vonageSmsClient;
        this.notificationLogRepository = notificationLogRepository;
    }

    public NotificationResponse send(NotificationRequestDTO request) {
        if (request == null || request.type() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Notification type is required.");
        }

        String subject = buildSubject(request.type());
        String message = buildMessage(request.type(), request.data());

        boolean emailRequested = request.email() != null && !request.email().isBlank();
        boolean smsRequested = request.phone() != null && !request.phone().isBlank();

        if (!emailRequested && !smsRequested) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Either email or phone must be provided.");
        }

        NotificationResponse emailResponse = null;
        NotificationResponse smsResponse = null;

        if (emailRequested) {
            emailResponse = sendEmail(new EmailNotificationRequest(request.email(), subject, message));
        }

        if (smsRequested) {
            smsResponse = sendSms(new SmsNotificationRequest(request.phone(), message));
        }

        int successCount = 0;
        int attemptedCount = 0;
        List<String> messageIds = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        if (emailRequested) {
            attemptedCount++;
            if (emailResponse != null && "SUCCESS".equals(emailResponse.status())) {
                successCount++;
            }
            if (emailResponse != null && emailResponse.messageId() != null && !emailResponse.messageId().isBlank()) {
                messageIds.add("EMAIL:" + emailResponse.messageId());
            }
            if (emailResponse != null && emailResponse.error() != null && !emailResponse.error().isBlank()) {
                errors.add("EMAIL:" + emailResponse.error());
            }
        }

        if (smsRequested) {
            attemptedCount++;
            if (smsResponse != null && "SUCCESS".equals(smsResponse.status())) {
                successCount++;
            }
            if (smsResponse != null && smsResponse.messageId() != null && !smsResponse.messageId().isBlank()) {
                messageIds.add("SMS:" + smsResponse.messageId());
            }
            if (smsResponse != null && smsResponse.error() != null && !smsResponse.error().isBlank()) {
                errors.add("SMS:" + smsResponse.error());
            }
        }

        String finalStatus;
        if (successCount == attemptedCount) {
            finalStatus = "SUCCESS";
        } else if (successCount > 0) {
            finalStatus = "PARTIAL_SUCCESS";
        } else {
            finalStatus = "FAILED";
        }

        String combinedMessageId = messageIds.isEmpty() ? null : String.join(";", messageIds);
        String combinedError = errors.isEmpty() ? null : String.join(" | ", errors);
        logger.info("Unified notification processed: type={}, status={}, emailRequested={}, smsRequested={}",
            request.type(), finalStatus, emailRequested, smsRequested);
        return new NotificationResponse(finalStatus, combinedMessageId, combinedError);
    }

    public NotificationResponse sendEmail(EmailNotificationRequest request) {
        // Send email and persist a notification audit log.
        ResendSendResult result = resendEmailClient.sendEmail(request.to(), request.subject(), request.body());

        NotificationLog log = new NotificationLog();
        log.setRecipient(request.to());
        log.setChannel(NotificationChannel.EMAIL);
        log.setSubject(request.subject());
        log.setMessage(request.body());
        log.setStatus(result.success() ? NotificationStatus.SUCCESS : NotificationStatus.FAILED);
        log.setProviderMessageId(result.messageId());
        log.setErrorMessage(result.error());
        notificationLogRepository.save(log);

        if (result.success()) {
            logger.info("Email notification sent successfully to {}", request.to());
        } else {
            logger.warn("Email notification failed for {}: {}", request.to(), result.error());
        }

        return new NotificationResponse(
                result.success() ? "SUCCESS" : "FAILED",
                result.messageId(),
                result.error()
        );
    }

    public NotificationResponse sendSms(SmsNotificationRequest request) {
        // Send SMS and persist a notification audit log.
        SmsSendResult result = vonageSmsClient.sendSms(request.to(), request.text());

        NotificationLog log = new NotificationLog();
        log.setRecipient(request.to());
        log.setChannel(NotificationChannel.SMS);
        log.setMessage(request.text());
        log.setStatus(result.success() ? NotificationStatus.SUCCESS : NotificationStatus.FAILED);
        log.setProviderMessageId(result.messageId());
        log.setErrorMessage(result.error());
        notificationLogRepository.save(log);

        if (result.success()) {
            logger.info("SMS notification sent successfully to {}", request.to());
        } else {
            logger.warn("SMS notification failed for {}: {}", request.to(), result.error());
        }

        return new NotificationResponse(
                result.success() ? "SUCCESS" : "FAILED",
                result.messageId(),
                result.error()
        );
    }

    private String buildSubject(NotificationType type) {
        return switch (type) {
            case APPOINTMENT_BOOKED -> "Appointment Confirmation";
            case PAYMENT_SUCCESS -> "Payment Confirmation";
        };
    }

    private String buildMessage(NotificationType type, Map<String, Object> data) {
        return switch (type) {
            case APPOINTMENT_BOOKED -> "Your appointment with Dr. "
                    + valueOrDefault(data, "doctorName", "your doctor")
                    + " is confirmed";
            case PAYMENT_SUCCESS -> "Your payment of Rs. "
                    + valueOrDefault(data, "amount", "0")
                    + " was successful";
        };
    }

    private String valueOrDefault(Map<String, Object> data, String key, String defaultValue) {
        if (data == null) {
            return defaultValue;
        }
        Object value = data.get(key);
        return value == null ? defaultValue : String.valueOf(value);
    }
}

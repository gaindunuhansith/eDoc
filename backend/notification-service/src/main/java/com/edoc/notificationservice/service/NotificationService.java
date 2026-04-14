package com.edoc.notificationservice.service;

import org.springframework.stereotype.Service;

import com.edoc.notificationservice.dto.EmailNotificationRequest;
import com.edoc.notificationservice.dto.NotificationResponse;
import com.edoc.notificationservice.dto.SmsNotificationRequest;
import com.edoc.notificationservice.model.NotificationChannel;
import com.edoc.notificationservice.model.NotificationLog;
import com.edoc.notificationservice.model.NotificationStatus;
import com.edoc.notificationservice.repository.NotificationLogRepository;

@Service
public class NotificationService {

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

        return new NotificationResponse(
                result.success() ? "SUCCESS" : "FAILED",
                result.messageId(),
                result.error()
        );
    }
}

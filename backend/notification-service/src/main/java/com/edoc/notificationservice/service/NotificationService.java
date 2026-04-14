package com.edoc.notificationservice.service;

import org.springframework.stereotype.Service;

import com.edoc.notificationservice.dto.EmailNotificationRequest;
import com.edoc.notificationservice.dto.NotificationResponse;
import com.edoc.notificationservice.model.NotificationChannel;
import com.edoc.notificationservice.model.NotificationLog;
import com.edoc.notificationservice.model.NotificationStatus;
import com.edoc.notificationservice.repository.NotificationLogRepository;

@Service
public class NotificationService {

    private final ResendEmailClient resendEmailClient;
    private final NotificationLogRepository notificationLogRepository;

    public NotificationService(ResendEmailClient resendEmailClient,
                               NotificationLogRepository notificationLogRepository) {
        this.resendEmailClient = resendEmailClient;
        this.notificationLogRepository = notificationLogRepository;
    }

    public NotificationResponse sendEmail(EmailNotificationRequest request) {
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
}

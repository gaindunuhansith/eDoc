package com.edoc.notificationservice.service;

import com.edoc.notificationservice.dto.EmailRequest;
import com.edoc.notificationservice.dto.NotificationResponse;
import com.edoc.notificationservice.dto.SmsRequest;
import com.edoc.notificationservice.entity.NotificationLog;
import com.edoc.notificationservice.repository.NotificationLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class NotificationService {

    private final NotificationLogRepository notificationLogRepository;

    public NotificationService(NotificationLogRepository notificationLogRepository) {
        this.notificationLogRepository = notificationLogRepository;
    }

    public NotificationResponse sendEmail(EmailRequest request) {
        NotificationLog log = new NotificationLog();
        log.setRecipient(request.getTo());
        log.setChannel(NotificationLog.Channel.EMAIL);
        log.setMessage(request.getMessage());
        log.setStatus(NotificationLog.Status.SENT);
        log.setProviderResponse("stubbed");

        NotificationLog saved = notificationLogRepository.save(log);
        return toResponse(saved);
    }

    public NotificationResponse sendSms(SmsRequest request) {
        NotificationLog log = new NotificationLog();
        log.setRecipient(request.getTo());
        log.setChannel(NotificationLog.Channel.SMS);
        log.setMessage(request.getMessage());
        log.setStatus(NotificationLog.Status.SENT);
        log.setProviderResponse("stubbed");

        NotificationLog saved = notificationLogRepository.save(log);
        return toResponse(saved);
    }

    private NotificationResponse toResponse(NotificationLog log) {
        NotificationResponse response = new NotificationResponse();
        response.setId(log.getId());
        response.setRecipient(log.getRecipient());
        response.setChannel(log.getChannel().name());
        response.setStatus(log.getStatus().name());
        response.setCreatedAt(log.getCreatedAt());
        return response;
    }
}

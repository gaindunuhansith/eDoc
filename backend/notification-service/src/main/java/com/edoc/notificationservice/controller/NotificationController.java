package com.edoc.notificationservice.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edoc.notificationservice.dto.EmailNotificationRequest;
import com.edoc.notificationservice.dto.NotificationResponse;
import com.edoc.notificationservice.dto.SmsNotificationRequest;
import com.edoc.notificationservice.service.NotificationService;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/email")
    // Send a single email notification via the configured provider.
    public ResponseEntity<NotificationResponse> sendEmail(@RequestBody EmailNotificationRequest request) {
        NotificationResponse response = notificationService.sendEmail(request);
        if ("SUCCESS".equals(response.status())) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(response);
    }

    @PostMapping("/sms")
    // Send a single SMS notification via the configured provider.
    public ResponseEntity<NotificationResponse> sendSms(@RequestBody SmsNotificationRequest request) {
        NotificationResponse response = notificationService.sendSms(request);
        if ("SUCCESS".equals(response.status())) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(response);
    }
}

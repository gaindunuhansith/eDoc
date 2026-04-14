package com.edoc.notificationservice.controller;

import com.edoc.notificationservice.dto.EmailRequest;
import com.edoc.notificationservice.dto.NotificationResponse;
import com.edoc.notificationservice.dto.SmsRequest;
import com.edoc.notificationservice.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/email")
    @ResponseStatus(HttpStatus.CREATED)
    public NotificationResponse sendEmail(@Valid @RequestBody EmailRequest request) {
        return notificationService.sendEmail(request);
    }

    @PostMapping("/sms")
    @ResponseStatus(HttpStatus.CREATED)
    public NotificationResponse sendSms(@Valid @RequestBody SmsRequest request) {
        return notificationService.sendSms(request);
    }
}

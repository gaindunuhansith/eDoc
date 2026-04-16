package com.edoc.notificationservice.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.edoc.notificationservice.dto.NotificationRequestDTO;
import com.edoc.notificationservice.dto.NotificationResponse;
import com.edoc.notificationservice.service.NotificationService;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/send")
    // Unified notification endpoint used by other services (appointment/payment/etc.).
    public ResponseEntity<NotificationResponse> send(@RequestBody NotificationRequestDTO request) {
        NotificationResponse response = notificationService.send(request);
        if ("FAILED".equals(response.status())) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(response);
        }
        return ResponseEntity.ok(response);
    }
}

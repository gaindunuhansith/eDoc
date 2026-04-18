package com.edoc.paymentservice.controller;

import com.edoc.paymentservice.dto.PayHereWebhookDTO;
import com.edoc.paymentservice.service.IPaymentService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payments/webhook")
public class WebhookController {

    private final IPaymentService paymentService;

    @PostMapping("/notify")
    public ResponseEntity<Map<String, String>> notify(@ModelAttribute PayHereWebhookDTO webhookDTO) {
        paymentService.processWebhook(webhookDTO);
        return ResponseEntity.ok(Map.of("status", "received"));
    }
}

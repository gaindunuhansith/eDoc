package com.edoc.paymentservice.controller;

import com.edoc.paymentservice.dto.PayHereWebhookDTO;
import com.edoc.paymentservice.service.PaymentService;
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

    private final PaymentService paymentService;

    @PostMapping("/notify")
    public ResponseEntity<String> notify(@ModelAttribute PayHereWebhookDTO webhookDTO) {
        paymentService.processWebhook(webhookDTO);
        return ResponseEntity.ok("OK");
    }
}

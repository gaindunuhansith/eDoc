package com.edoc.paymentservice.controller;

import com.edoc.paymentservice.payload.PayHereWebhookDTO;
import com.edoc.paymentservice.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/v1/payments/webhook")
@Tag(name = "Payment Webhook", description = "Payment provider callback APIs")
public class WebhookController {

    private final PaymentService paymentService;

    @Operation(summary = "Receive payment webhook", description = "Consumes PayHere webhook notifications and updates payment state.")
    @PostMapping(value = "/notify", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> notify(@ModelAttribute PayHereWebhookDTO webhookDTO) {
        log.info("Received payment webhook for orderId={}", webhookDTO.getOrderId());
        paymentService.processWebhook(webhookDTO);
        return ResponseEntity.ok(Map.of("status", "received"));
    }
}

package com.edoc.paymentservice.controller;

import com.edoc.paymentservice.dto.InitiatePaymentRequest;
import com.edoc.paymentservice.dto.InitiatePaymentResponse;
import com.edoc.paymentservice.dto.PaymentDetailResponse;
import com.edoc.paymentservice.dto.PaymentHistoryResponse;
import com.edoc.paymentservice.service.PaymentService;
import com.edoc.paymentservice.util.JwtUtil;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public InitiatePaymentResponse initiate(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody InitiatePaymentRequest request) {
        Long userId = JwtUtil.extractUserId(jwt);
        return paymentService.initiatePayment(request, userId);
    }

    @GetMapping("/history")
    public Page<PaymentHistoryResponse> history(@AuthenticationPrincipal Jwt jwt, Pageable pageable) {
        Long userId = JwtUtil.extractUserId(jwt);
        return paymentService.getPaymentHistory(userId, pageable);
    }

    @GetMapping("/{id}")
    public PaymentDetailResponse detail(@PathVariable UUID id) {
        return paymentService.getPaymentById(id);
    }
}

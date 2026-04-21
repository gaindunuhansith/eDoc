package com.edoc.paymentservice.controller;

import com.edoc.paymentservice.dto.InitiatePaymentRequest;
import com.edoc.paymentservice.dto.InitiatePaymentResponse;
import com.edoc.paymentservice.dto.PaymentDetailResponse;
import com.edoc.paymentservice.dto.PaymentHistoryResponse;
import com.edoc.paymentservice.service.IPaymentService;
import com.edoc.paymentservice.util.JwtUtil;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    private final IPaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<InitiatePaymentResponse> initiate(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody InitiatePaymentRequest request) {
        Long userId = JwtUtil.extractUserId(jwt);
        InitiatePaymentResponse response = paymentService.initiatePayment(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/history")
    public ResponseEntity<Page<PaymentHistoryResponse>> history(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Long userId = JwtUtil.extractUserId(jwt);
        Page<PaymentHistoryResponse> response = paymentService.getPaymentHistory(userId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentDetailResponse> detail(@PathVariable UUID id) {
        PaymentDetailResponse response = paymentService.getPaymentById(id);
        return ResponseEntity.ok(response);
    }
}

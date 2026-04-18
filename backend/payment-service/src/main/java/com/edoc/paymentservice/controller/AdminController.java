package com.edoc.paymentservice.controller;

import com.edoc.paymentservice.dto.PaymentDetailResponse;
import com.edoc.paymentservice.dto.PaymentHistoryResponse;
import com.edoc.paymentservice.service.PaymentService;
import com.edoc.paymentservice.type.PaymentStatus;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/payments")
public class AdminController {

    private final PaymentService paymentService;

    @GetMapping
    public Page<PaymentHistoryResponse> list(Pageable pageable) {
        return paymentService.getAllPayments(pageable);
    }

    @GetMapping("/{id}")
    public PaymentDetailResponse getById(@PathVariable UUID id) {
        return paymentService.getPaymentById(id);
    }

    @GetMapping("/user/{userId}")
    public Page<PaymentHistoryResponse> getByUser(@PathVariable Long userId, Pageable pageable) {
        return paymentService.getPaymentsByUser(userId, pageable);
    }

    @GetMapping("/status/{status}")
    public Page<PaymentHistoryResponse> getByStatus(@PathVariable PaymentStatus status, Pageable pageable) {
        return paymentService.getPaymentsByStatus(status, pageable);
    }

    @PostMapping("/{id}/reconcile")
    public ResponseEntity<Void> reconcile(@PathVariable UUID id) {
        paymentService.flagForReconciliation(id);
        return ResponseEntity.accepted().build();
    }
}

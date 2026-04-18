package com.edoc.paymentservice.controller;

import com.edoc.paymentservice.dto.PaymentDetailResponse;
import com.edoc.paymentservice.dto.PaymentHistoryResponse;
import com.edoc.paymentservice.service.IPaymentService;
import com.edoc.paymentservice.type.PaymentStatus;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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

    private final IPaymentService paymentService;

    @GetMapping
    public ResponseEntity<Page<PaymentHistoryResponse>> getAllPayments(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(paymentService.getAllPayments(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentDetailResponse> getPaymentDetailsById(@PathVariable UUID id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<PaymentHistoryResponse>> getPaymentsByUserId(
            @PathVariable Long userId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(paymentService.getPaymentsByUser(userId, pageable));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<PaymentHistoryResponse>> getPaymentsByPaymentStatus(
            @PathVariable PaymentStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(paymentService.getPaymentsByStatus(status, pageable));
    }

    @PostMapping("/{id}/reconcile")
    public ResponseEntity<Map<String, String>> flagPaymentForReconciliation(@PathVariable UUID id) {
        paymentService.flagForReconciliation(id);
        return ResponseEntity.accepted().body(Map.of("message", "Payment flagged for reconciliation"));
    }
}

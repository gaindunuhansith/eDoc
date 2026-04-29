package com.edoc.paymentservice.controller;

import com.edoc.paymentservice.payload.request.InitiatePaymentRequest;
import com.edoc.paymentservice.payload.response.InitiatePaymentResponse;
import com.edoc.paymentservice.payload.response.PaymentDetailResponse;
import com.edoc.paymentservice.payload.response.PaymentHistoryResponse;
import com.edoc.paymentservice.mapper.PaymentMapper;
import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.service.PaymentService;
import com.edoc.paymentservice.type.PaymentStatus;
import com.edoc.paymentservice.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/v1/payments")
@Tag(name = "Payment Controller", description = "Payment domain APIs")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;

    @Operation(summary = "Initiate payment", description = "Creates or reuses a pending payment for an appointment.")
    @PostMapping(value = "/initiate", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InitiatePaymentResponse> initiate(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody InitiatePaymentRequest request) {
        Long userId = JwtUtil.extractUserId(jwt);
        log.info("Initiating payment request for userId={}, appointmentId={}", userId, request.appointmentId());
        InitiatePaymentResponse response = paymentService.initiatePayment(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Get user payment history", description = "Returns paginated payment history for authenticated user.")
    @GetMapping(value = "/history", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<PaymentHistoryResponse>> history(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Long userId = JwtUtil.extractUserId(jwt);
        log.info("Fetching payment history for userId={}", userId);
        Page<PaymentHistoryResponse> response = paymentService.getPaymentHistory(userId, pageable);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get payment detail", description = "Returns payment details including transaction log entries.")
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentDetailResponse> detail(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        Long userId = JwtUtil.extractUserId(jwt);
        log.info("Fetching payment detail for paymentId={}", id);
        PaymentDetailResponse response = paymentService.getPaymentById(id);
        if (!response.userId().equals(userId)) {
            throw new IllegalArgumentException("Payment not found");
        }
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get all payments", description = "Returns paginated payments across all users.")
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PaymentHistoryResponse>> getAllPayments(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Fetching all payments");
        return ResponseEntity.ok(paymentService.getAllPayments(pageable));
    }

    @Operation(summary = "Get payments by user", description = "Returns paginated payments for a specific user.")
    @GetMapping(value = "/users/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PaymentHistoryResponse>> getPaymentsByUserId(
            @PathVariable Long userId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Fetching payments for userId={}", userId);
        return ResponseEntity.ok(paymentService.getPaymentsByUser(userId, pageable));
    }

    @Operation(summary = "Get payments by status", description = "Returns paginated payments for a specific status.")
    @GetMapping(value = "/status/{status}", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PaymentHistoryResponse>> getPaymentsByPaymentStatus(
            @PathVariable PaymentStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        log.info("Fetching payments for status={}", status);
        return ResponseEntity.ok(paymentService.getPaymentsByStatus(status, pageable));
    }

    @Operation(summary = "Flag payment for reconciliation", description = "Marks a payment for reconciliation workflow.")
    @PostMapping(value = "/{id}/reconcile", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> flagPaymentForReconciliation(@PathVariable UUID id) {
        log.info("Flagging paymentId={} for reconciliation", id);
        paymentService.flagForReconciliation(id);
        return ResponseEntity.accepted().body(Map.of("message", "Payment flagged for reconciliation"));
    }

    @Operation(summary = "Get payment by appointment", description = "Fetches payment summary by appointment identifier.")
    @GetMapping(value = "/appointment/{appointmentId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentHistoryResponse> byAppointment(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long appointmentId) {
        Long userId = JwtUtil.extractUserId(jwt);
        log.info("Fetching payment by appointmentId={}", appointmentId);
        Payment payment = paymentService.getPaymentByAppointmentId(appointmentId);
        if (!payment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Payment not found");
        }
        return ResponseEntity.ok(paymentMapper.toHistoryResponse(payment));
    }

    @Operation(summary = "Get payment by order", description = "Fetches payment summary by external order identifier.")
    @GetMapping(value = "/order/{orderId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentHistoryResponse> byOrder(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String orderId) {
        Long userId = JwtUtil.extractUserId(jwt);
        log.info("Fetching payment by orderId={}", orderId);
        Payment payment = paymentService.getPaymentByOrderId(orderId);
        if (!payment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Payment not found");
        }
        return ResponseEntity.ok(paymentMapper.toHistoryResponse(payment));
    }
}

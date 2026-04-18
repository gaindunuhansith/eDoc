package com.edoc.paymentservice.controller;

import com.edoc.paymentservice.dto.PaymentHistoryResponse;
import com.edoc.paymentservice.mapper.PaymentMapper;
import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.service.IPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/internal/payments")
public class InternalController {

    private final IPaymentService paymentService;
    private final PaymentMapper paymentMapper;

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<PaymentHistoryResponse> byAppointment(@PathVariable Long appointmentId) {
        Payment payment = paymentService.getPaymentByAppointmentId(appointmentId);
        return ResponseEntity.ok(paymentMapper.toHistoryResponse(payment));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentHistoryResponse> byOrder(@PathVariable String orderId) {
        Payment payment = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(paymentMapper.toHistoryResponse(payment));
    }
}

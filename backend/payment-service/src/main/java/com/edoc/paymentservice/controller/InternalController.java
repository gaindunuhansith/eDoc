package com.edoc.paymentservice.controller;

import com.edoc.paymentservice.dto.PaymentHistoryResponse;
import com.edoc.paymentservice.mapper.PaymentMapper;
import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/internal/payments")
public class InternalController {

    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;

    @GetMapping("/appointment/{appointmentId}")
    public PaymentHistoryResponse byAppointment(@PathVariable Long appointmentId) {
        Payment payment = paymentService.getPaymentByAppointmentId(appointmentId);
        return paymentMapper.toHistoryResponse(payment);
    }

    @GetMapping("/order/{orderId}")
    public PaymentHistoryResponse byOrder(@PathVariable String orderId) {
        Payment payment = paymentService.getPaymentByOrderId(orderId);
        return paymentMapper.toHistoryResponse(payment);
    }
}

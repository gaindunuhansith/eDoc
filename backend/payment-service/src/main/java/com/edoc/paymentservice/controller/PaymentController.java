package com.edoc.paymentservice.controller;

import com.edoc.paymentservice.service.IPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    @SuppressWarnings("unused")
    private final IPaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<String> initiatePayment() {
        return ResponseEntity.ok("initiate endpoint is working");
    }

    @GetMapping("/{id}")
    public ResponseEntity<String> getPayment(@PathVariable String id) {
        return ResponseEntity.ok("get payment endpoint is working for id: " + id);
    }

    @PostMapping("/notify")
    public ResponseEntity<String> handleNotification() {
        return ResponseEntity.ok("notify endpoint is working");
    }
}

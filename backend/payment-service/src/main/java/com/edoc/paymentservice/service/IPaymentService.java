package com.edoc.paymentservice.service;

import com.edoc.paymentservice.model.Payment;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public interface IPaymentService {

    Payment createPayment(UUID appointmentId, UUID patientId, BigDecimal amount, String currency);

    String generatePayHereHash(String orderId, BigDecimal amount, String currency);

    Map<String, String> initiatePayment(UUID paymentId);

    void handleNotification(Map<String, String> params);

    Payment getPaymentById(UUID paymentId);
}
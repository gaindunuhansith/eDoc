package com.edoc.paymentservice.service;

import com.edoc.paymentservice.model.CustomerData;
import com.edoc.paymentservice.model.Payment;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface IPaymentService {

    Payment createPayment(UUID appointmentId, UUID userId, BigDecimal amount, String currency);

    String generatePayHereHash(String orderId, BigDecimal amount, String currency);

    Map<String, String> initiatePayment(UUID paymentId, CustomerData customerData);

    void handleNotification(Map<String, String> params);

    Payment getPaymentById(UUID paymentId);

    List<Payment> getAllPayments();
}
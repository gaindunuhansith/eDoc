package com.edoc.paymentservice.service;

import com.edoc.paymentservice.dto.InitiatePaymentRequest;
import com.edoc.paymentservice.dto.InitiatePaymentResponse;
import com.edoc.paymentservice.dto.PayHereWebhookDTO;
import com.edoc.paymentservice.dto.PaymentDetailResponse;
import com.edoc.paymentservice.dto.PaymentHistoryResponse;
import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.type.PaymentStatus;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PaymentService {

    InitiatePaymentResponse initiatePayment(InitiatePaymentRequest request, Long userId);

    void processWebhook(PayHereWebhookDTO webhook);

    Page<PaymentHistoryResponse> getPaymentHistory(Long userId, Pageable pageable);

    PaymentDetailResponse getPaymentById(UUID paymentId);

    Page<PaymentHistoryResponse> getAllPayments(Pageable pageable);

    Page<PaymentHistoryResponse> getPaymentsByUser(Long userId, Pageable pageable);

    Page<PaymentHistoryResponse> getPaymentsByStatus(PaymentStatus status, Pageable pageable);

    void flagForReconciliation(UUID paymentId);

    Payment getPaymentByAppointmentId(Long appointmentId);

    Payment getPaymentByOrderId(String orderId);
}

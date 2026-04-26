package com.edoc.paymentservice.service;

import com.edoc.paymentservice.payload.request.InitiatePaymentRequest;
import com.edoc.paymentservice.payload.response.InitiatePaymentResponse;
import com.edoc.paymentservice.payload.PayHereWebhookDTO;
import com.edoc.paymentservice.payload.response.PaymentDetailResponse;
import com.edoc.paymentservice.payload.response.PaymentHistoryResponse;
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

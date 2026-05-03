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

    InitiatePaymentResponse initiatePayment(InitiatePaymentRequest request, String userId);

    void processWebhook(PayHereWebhookDTO webhook);

    Page<PaymentHistoryResponse> getPaymentHistory(String userId, Pageable pageable);

    PaymentDetailResponse getPaymentById(UUID paymentId);

    Page<PaymentHistoryResponse> getAllPayments(Pageable pageable);

    Page<PaymentHistoryResponse> getPaymentsByUser(String userId, Pageable pageable);

    Page<PaymentHistoryResponse> getPaymentsByStatus(PaymentStatus status, Pageable pageable);

    void flagForReconciliation(UUID paymentId);

    PaymentHistoryResponse getPaymentByAppointmentId(String appointmentId);

    PaymentHistoryResponse getPaymentByOrderId(String orderId);

    Payment getPaymentEntityById(UUID paymentId);
}

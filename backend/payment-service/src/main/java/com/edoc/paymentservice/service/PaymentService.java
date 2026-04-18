package com.edoc.paymentservice.service;

import com.edoc.paymentservice.constant.AppMessages;
import com.edoc.paymentservice.constant.PayHereConstants;
import com.edoc.paymentservice.dto.InitiatePaymentRequest;
import com.edoc.paymentservice.dto.InitiatePaymentResponse;
import com.edoc.paymentservice.dto.PayHereWebhookDTO;
import com.edoc.paymentservice.dto.PaymentDetailResponse;
import com.edoc.paymentservice.dto.PaymentHistoryResponse;
import com.edoc.paymentservice.exception.PaymentSecurityException;
import com.edoc.paymentservice.mapper.PaymentMapper;
import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.model.PaymentTransactionLog;
import com.edoc.paymentservice.repository.PaymentRepository;
import com.edoc.paymentservice.repository.TransactionLogRepository;
import com.edoc.paymentservice.service.bridge.PaymentNotificationService;
import com.edoc.paymentservice.type.PaymentStatus;
import com.edoc.paymentservice.util.HashUtil;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final TransactionLogRepository transactionLogRepository;
    private final PaymentNotificationService paymentNotificationService;
    private final PaymentMapper paymentMapper;

    @Value("${payhere.merchant-id}")
    private String merchantId;

    @Value("${payhere.merchant-secret}")
    private String merchantSecret;

    @Value("${payhere.checkout-url}")
    private String checkoutUrl;

    @Transactional
    public InitiatePaymentResponse initiatePayment(InitiatePaymentRequest request, Long userId) {
        Payment existing = paymentRepository.findByAppointmentId(request.appointmentId()).orElse(null);
        if (existing != null) {
            if (existing.getStatus() == PaymentStatus.PENDING) {
                return buildInitiateResponse(existing);
            }
            if (existing.getStatus() == PaymentStatus.SUCCESS) {
                throw new IllegalStateException(AppMessages.PAYMENT_ALREADY_COMPLETED);
            }
        }

        Payment payment = Payment.builder()
                .appointmentId(request.appointmentId())
                .userId(userId)
                .amount(request.amount())
                .currency(request.currency())
                .status(PaymentStatus.PENDING)
                .orderId(UUID.randomUUID().toString())
                .build();

        Payment saved = paymentRepository.save(payment);
        transactionLogRepository.save(PaymentTransactionLog.builder()
                .payment(saved)
                .event(PayHereConstants.EVENT_PAYMENT_INITIATED)
                .rawPayload("{\"orderId\":\"" + saved.getOrderId() + "\",\"status\":\"PENDING\"}")
                .build());

        return buildInitiateResponse(saved);
    }

    public Payment getPaymentByAppointmentId(Long appointmentId) {
        return paymentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found for appointment"));
    }

    @Transactional
    public void processWebhook(PayHereWebhookDTO webhook) {
        boolean validSignature = HashUtil.verifyWebhookSignature(
                webhook.getMerchantId(),
                webhook.getOrderId(),
                webhook.getPayhereAmount(),
                webhook.getPayhereCurrency(),
                webhook.getStatusCode(),
                merchantSecret,
                webhook.getMd5sig());

        if (!validSignature) {
            throw new PaymentSecurityException(AppMessages.INVALID_SIGNATURE);
        }

        if (webhook.getPaymentId() != null
                && paymentRepository.findByPayhereId(webhook.getPaymentId()).isPresent()) {
            return;
        }

        Payment payment = paymentRepository.findByOrderId(webhook.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Payment not found for order"));

        payment.setPayhereId(webhook.getPaymentId());
        payment.setStatus(resolveStatus(webhook.getStatusCode()));
        Payment saved = paymentRepository.save(payment);

        String rawPayload = "{\"orderId\":\"" + webhook.getOrderId()
                + "\",\"paymentId\":\"" + webhook.getPaymentId()
                + "\",\"statusCode\":\"" + webhook.getStatusCode() + "\"}";

        transactionLogRepository.save(PaymentTransactionLog.builder()
                .payment(saved)
                .event(PayHereConstants.EVENT_WEBHOOK_RECEIVED)
                .rawPayload(rawPayload)
                .build());

        if (saved.getStatus() == PaymentStatus.SUCCESS) {
            paymentNotificationService.notifyPaymentSuccess(saved);
        }
    }

    public Payment getPaymentByOrderId(String orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found for order"));
    }

    public Page<PaymentHistoryResponse> getPaymentHistory(Long userId, Pageable pageable) {
        return paymentRepository.findByUserId(userId, pageable).map(paymentMapper::toHistoryResponse);
    }

    public PaymentDetailResponse getPaymentById(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException(AppMessages.PAYMENT_NOT_FOUND));
        List<PaymentTransactionLog> logs = transactionLogRepository.findByPayment_IdOrderByCreatedAtDesc(paymentId);
        return paymentMapper.toDetailResponse(payment, logs);
    }

    public Page<PaymentHistoryResponse> getAllPayments(Pageable pageable) {
        return paymentRepository.findAll(pageable).map(paymentMapper::toHistoryResponse);
    }

    public Page<PaymentHistoryResponse> getPaymentsByUser(Long userId, Pageable pageable) {
        return paymentRepository.findByUserId(userId, pageable).map(paymentMapper::toHistoryResponse);
    }

    public Page<PaymentHistoryResponse> getPaymentsByStatus(PaymentStatus status, Pageable pageable) {
        return paymentRepository.findByStatus(status, pageable).map(paymentMapper::toHistoryResponse);
    }

    @Transactional
    public void flagForReconciliation(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException(AppMessages.PAYMENT_NOT_FOUND));
        transactionLogRepository.save(PaymentTransactionLog.builder()
                .payment(payment)
                .event(PayHereConstants.EVENT_RECONCILE_FLAGGED)
                .rawPayload("{\"paymentId\":\"" + payment.getId() + "\",\"reason\":\"MANUAL_RECONCILIATION\"}")
                .build());
    }

    private PaymentStatus resolveStatus(String statusCode) {
        return switch (statusCode) {
            case PayHereConstants.STATUS_SUCCESS -> PaymentStatus.SUCCESS;
            case PayHereConstants.STATUS_PENDING -> PaymentStatus.PENDING;
            default -> PaymentStatus.FAILED;
        };
    }

    private InitiatePaymentResponse buildInitiateResponse(Payment payment) {
        String hash = HashUtil.generateInitiationHash(
                merchantId,
                payment.getOrderId(),
                payment.getAmount(),
                payment.getCurrency().name(),
                merchantSecret);

        return new InitiatePaymentResponse(
                payment.getOrderId(),
                merchantId,
                payment.getAmount(),
                payment.getCurrency().name(),
                hash,
                checkoutUrl);
    }
}

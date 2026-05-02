package com.edoc.paymentservice.service.impl;

import com.edoc.paymentservice.constant.AppMessages;
import com.edoc.paymentservice.constant.PaymentConstants;
import com.edoc.paymentservice.payload.request.InitiatePaymentRequest;
import com.edoc.paymentservice.payload.response.InitiatePaymentResponse;
import com.edoc.paymentservice.payload.PayHereWebhookDTO;
import com.edoc.paymentservice.payload.response.PaymentDetailResponse;
import com.edoc.paymentservice.payload.response.PaymentHistoryResponse;
import com.edoc.paymentservice.exception.PaymentSecurityException;
import com.edoc.paymentservice.mapper.PaymentMapper;
import com.edoc.paymentservice.model.BillingDetails;
import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.model.PaymentTransactionLog;
import com.edoc.paymentservice.repository.BillingDetailsRepository;
import com.edoc.paymentservice.repository.PaymentRepository;
import com.edoc.paymentservice.repository.TransactionLogRepository;
import com.edoc.paymentservice.service.PaymentService;
import com.edoc.paymentservice.client.appointment.AppointmentClient;
import com.edoc.paymentservice.client.notification.NotificationClient;
import com.edoc.paymentservice.type.PaymentStatus;
import com.edoc.paymentservice.util.HashUtil;
import com.edoc.paymentservice.util.SecurityUtil;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final TransactionLogRepository transactionLogRepository;
    private final BillingDetailsRepository billingDetailsRepository;
    private final AppointmentClient appointmentClient;
    private final NotificationClient notificationClient;
    private final PaymentMapper paymentMapper;

    @Value("${payhere.merchant-id}")
    private String merchantId;

    @Value("${payhere.merchant-secret}")
    private String merchantSecret;

    @Value("${payhere.checkout-url}")
    private String checkoutUrl;

    @Value("${payhere.notify-url}")
    private String notifyUrl;

    @Override
    @Transactional
    public InitiatePaymentResponse initiatePayment(InitiatePaymentRequest request, String userId) {
        SecurityUtil.populateMdc(null, userId);

        Payment existing = paymentRepository.findByAppointmentId(request.appointmentId()).orElse(null);
        if (existing != null) {
            if (existing.getStatus() == PaymentStatus.PENDING) {
                log.debug("Returning existing pending payment for appointmentId={}", request.appointmentId());
                return buildInitiateResponse(existing);
            }
            if (existing.getStatus() == PaymentStatus.SUCCESS) {
                log.warn("Payment already completed for appointmentId={}", request.appointmentId());
                throw new IllegalStateException(AppMessages.PAYMENT_ALREADY_COMPLETED);
            }
            if (existing.getStatus() == PaymentStatus.FAILED) {
                log.info("Retrying failed payment for appointmentId={}, new orderId assigned", request.appointmentId());
                existing.setOrderId(UUID.randomUUID().toString());
                existing.setAmount(request.amount());
                existing.setCurrency(request.currency());
                existing.setStatus(PaymentStatus.PENDING);
                existing.setPayhereId(null);
                Payment retried = paymentRepository.save(existing);
                billingDetailsRepository.findByPaymentId(retried.getId()).ifPresent(b -> {
                    b.setFullName(request.billing().fullName());
                    b.setEmail(request.billing().email());
                    b.setPhone(request.billing().phone());
                    b.setAddress(request.billing().address());
                    b.setCity(request.billing().city());
                    b.setCountry(request.billing().country());
                    billingDetailsRepository.save(b);
                });
                SecurityUtil.populateMdc(retried.getOrderId(), userId);
                transactionLogRepository.save(PaymentTransactionLog.builder()
                        .payment(retried)
                        .event(PaymentConstants.EVENT_PAYMENT_INITIATED)
                        .rawPayload("{\"orderId\":\"" + retried.getOrderId() + "\",\"status\":\"PENDING\",\"retry\":true}")
                        .build());
                return buildInitiateResponse(retried);
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

        if (!billingDetailsRepository.existsByPaymentId(saved.getId())) {
            billingDetailsRepository.save(BillingDetails.builder()
                    .paymentId(saved.getId())
                    .fullName(request.billing().fullName())
                    .email(request.billing().email())
                    .phone(request.billing().phone())
                    .address(request.billing().address())
                    .city(request.billing().city())
                    .country(request.billing().country())
                    .build());
        }

        SecurityUtil.populateMdc(saved.getOrderId(), userId);
        log.info("Payment initiated: appointmentId={}, orderId={}, amount={}", request.appointmentId(), saved.getOrderId(), request.amount());

        transactionLogRepository.save(PaymentTransactionLog.builder()
                .payment(saved)
                .event(PaymentConstants.EVENT_PAYMENT_INITIATED)
                .rawPayload("{\"orderId\":\"" + saved.getOrderId() + "\",\"status\":\"PENDING\"}")
                .build());

        return buildInitiateResponse(saved);
    }

    @Override
    public PaymentHistoryResponse getPaymentByAppointmentId(Long appointmentId) {
        Payment payment = paymentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found for appointment"));
        return paymentMapper.toHistoryResponse(payment);
    }

    @Override
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
            log.info("Ignoring duplicate webhook for orderId={}, paymentId={}", webhook.getOrderId(), webhook.getPaymentId());
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
                .event(PaymentConstants.EVENT_WEBHOOK_RECEIVED)
                .rawPayload(rawPayload)
                .build());

        if (saved.getStatus() == PaymentStatus.SUCCESS) {
            appointmentClient.notifyPaymentSuccess(saved);
            notificationClient.notifyPaymentSuccess(saved);
        }
        log.info("Webhook processed: orderId={}, status={}", webhook.getOrderId(), saved.getStatus());
    }

    @Override
    public PaymentHistoryResponse getPaymentByOrderId(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found for order"));
        return paymentMapper.toHistoryResponse(payment);
    }

    @Override
    public Payment getPaymentEntityById(UUID paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException(AppMessages.PAYMENT_NOT_FOUND));
    }

    @Override
    public Page<PaymentHistoryResponse> getPaymentHistory(String userId, Pageable pageable) {
        log.debug("Fetching payment history for userId={}", userId);
        return paymentRepository.findByUserId(userId, pageable).map(paymentMapper::toHistoryResponse);
    }

    @Override
    public PaymentDetailResponse getPaymentById(UUID paymentId) {
        log.debug("Fetching payment detail for paymentId={}", paymentId);
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException(AppMessages.PAYMENT_NOT_FOUND));
        List<PaymentTransactionLog> logs = transactionLogRepository.findByPayment_IdOrderByCreatedAtDesc(paymentId);
        BillingDetails billing = billingDetailsRepository.findByPaymentId(paymentId).orElse(null);
        return paymentMapper.toDetailResponse(payment, logs, billing);
    }

    @Override
    public Page<PaymentHistoryResponse> getAllPayments(Pageable pageable) {
        return paymentRepository.findAll(pageable).map(paymentMapper::toHistoryResponse);
    }

    @Override
    public Page<PaymentHistoryResponse> getPaymentsByUser(String userId, Pageable pageable) {
        return paymentRepository.findByUserId(userId, pageable).map(paymentMapper::toHistoryResponse);
    }

    @Override
    public Page<PaymentHistoryResponse> getPaymentsByStatus(PaymentStatus status, Pageable pageable) {
        return paymentRepository.findByStatus(status, pageable).map(paymentMapper::toHistoryResponse);
    }

    @Override
    @Transactional
    public void flagForReconciliation(UUID paymentId) {
        log.info("Flagging payment for reconciliation: paymentId={}", paymentId);
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException(AppMessages.PAYMENT_NOT_FOUND));
        transactionLogRepository.save(PaymentTransactionLog.builder()
                .payment(payment)
                .event(PaymentConstants.EVENT_RECONCILE_FLAGGED)
                .rawPayload("{\"paymentId\":\"" + payment.getId() + "\",\"reason\":\"MANUAL_RECONCILIATION\"}")
                .build());
    }

    private PaymentStatus resolveStatus(String statusCode) {
        return switch (statusCode) {
            case PaymentConstants.STATUS_SUCCESS -> PaymentStatus.SUCCESS;
            case PaymentConstants.STATUS_PENDING -> PaymentStatus.PENDING;
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
                checkoutUrl,
                notifyUrl);
    }
}
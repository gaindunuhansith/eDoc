package com.edoc.paymentservice.service;

import com.edoc.paymentservice.constant.AppMessages;
import com.edoc.paymentservice.constant.PayHereConstants;
import com.edoc.paymentservice.dto.InitiatePaymentRequest;
import com.edoc.paymentservice.dto.InitiatePaymentResponse;
import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.model.PaymentTransactionLog;
import com.edoc.paymentservice.repository.PaymentRepository;
import com.edoc.paymentservice.repository.TransactionLogRepository;
import com.edoc.paymentservice.type.PaymentStatus;
import com.edoc.paymentservice.util.HashUtil;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final TransactionLogRepository transactionLogRepository;

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

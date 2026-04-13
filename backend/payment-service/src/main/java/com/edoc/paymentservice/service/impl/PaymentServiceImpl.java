package com.edoc.paymentservice.service.impl;

import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.model.enums.PaymentStatus;
import com.edoc.paymentservice.repository.PaymentRepository;
import com.edoc.paymentservice.service.IPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements IPaymentService {

    private static final Pattern CURRENCY_CODE_PATTERN = Pattern.compile("^[A-Za-z]{3}$");

    private final PaymentRepository paymentRepository;

    @Value("${payhere.merchant.id}")
    private String merchantId;

    @Value("${payhere.merchant.secret}")
    private String merchantSecret;

    @Override
    @Transactional
    public Payment createPayment(UUID appointmentId, UUID patientId, BigDecimal amount, String currency) {
        validateCreatePaymentInput(appointmentId, patientId, amount, currency);

        Payment payment = new Payment();
        payment.setAppointmentId(appointmentId);
        payment.setPatientId(patientId);
        payment.setAmount(amount);
        payment.setCurrency(currency.trim().toUpperCase(Locale.ROOT));
        payment.setPayhereOrderId(UUID.randomUUID().toString());
        payment.setStatus(PaymentStatus.PENDING);

        return paymentRepository.save(payment);
    }

    @Override
    public String generatePayHereHash(String orderId, BigDecimal amount, String currency) {
        // TODO
        return null;
    }

    @Override
    public Map<String, String> initiatePayment(UUID paymentId) {
        // TODO
        return null;
    }

    @Override
    public void handleNotification(Map<String, String> params) {
        // TODO
    }

    @Override
    public Payment getPaymentById(UUID paymentId) {
        // TODO
        return null;
    }

    private void validateCreatePaymentInput(UUID appointmentId, UUID patientId, BigDecimal amount, String currency) {
        if (appointmentId == null) {
            throw new IllegalArgumentException("appointmentId is required");
        }
        if (patientId == null) {
            throw new IllegalArgumentException("patientId is required");
        }
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("amount must be greater than zero");
        }
        if (currency == null || currency.isBlank()) {
            throw new IllegalArgumentException("currency is required");
        }
        if (!CURRENCY_CODE_PATTERN.matcher(currency.trim()).matches()) {
            throw new IllegalArgumentException("currency must be a valid 3-letter ISO code");
        }
    }
}

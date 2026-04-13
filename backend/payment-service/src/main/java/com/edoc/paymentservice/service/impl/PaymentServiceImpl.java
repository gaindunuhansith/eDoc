package com.edoc.paymentservice.service.impl;

import com.edoc.paymentservice.config.PayHereProperties;
import com.edoc.paymentservice.dto.CheckoutPayloadResponse;
import com.edoc.paymentservice.exception.InvalidNotificationSignatureException;
import com.edoc.paymentservice.exception.PaymentNotFoundException;
import com.edoc.paymentservice.mapper.PaymentMapper;
import com.edoc.paymentservice.model.CustomerData;
import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.model.PaymentLog;
import com.edoc.paymentservice.model.enums.PaymentStatus;
import com.edoc.paymentservice.repository.PaymentLogRepository;
import com.edoc.paymentservice.repository.PaymentRepository;
import com.edoc.paymentservice.service.IPaymentService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements IPaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);
    private static final Pattern CURRENCY_CODE_PATTERN = Pattern.compile("^[A-Za-z]{3}$");
    private static final String STATUS_CODE_SUCCESS = "2";
    private static final String STATUS_CODE_PENDING = "0";

    private final PaymentRepository paymentRepository;
    private final PaymentLogRepository paymentLogRepository;
    private final PaymentMapper paymentMapper;
    private final PayHereProperties payHereProperties;

    @Override
    @Transactional
    public Payment createPayment(UUID appointmentId, UUID patientId, BigDecimal amount, String currency) {
        validateCreatePaymentInput(appointmentId, patientId, amount, currency);

        Payment payment = Payment.builder()
            .appointmentId(appointmentId)
            .patientId(patientId)
            .amount(amount)
            .currency(currency.trim().toUpperCase(Locale.ROOT))
            .payhereOrderId(UUID.randomUUID().toString())
            .status(PaymentStatus.PENDING)
            .build();

        return paymentRepository.save(payment);
    }

    @Override
    public String generatePayHereHash(String orderId, BigDecimal amount, String currency) {
        if (orderId == null || orderId.isBlank()) {
            throw new IllegalArgumentException("orderId is required");
        }
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("amount must be greater than zero");
        }
        if (currency == null || currency.isBlank()) {
            throw new IllegalArgumentException("currency is required");
        }

        String normalizedCurrency = currency.trim().toUpperCase(Locale.ROOT);
        String formattedAmount = amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
        String hashedSecret = md5Upper(payHereProperties.merchantSecret());

        return md5Upper(payHereProperties.merchantId() + orderId.trim() + formattedAmount + normalizedCurrency + hashedSecret);
    }

    @Override
    public Map<String, String> initiatePayment(UUID paymentId, CustomerData customerData) {
        Payment payment = getPaymentById(paymentId);

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new IllegalArgumentException("Only pending payments can be initiated");
        }

        String hash = generatePayHereHash(payment.getPayhereOrderId(), payment.getAmount(), payment.getCurrency());
        CheckoutPayloadResponse checkoutPayloadResponse = paymentMapper.toCheckoutResponse(
                payment,
                customerData,
                hash,
                payHereProperties
        );

        log.info("Prepared checkout payload for paymentId={} orderId={}", payment.getId(), payment.getPayhereOrderId());

        return new LinkedHashMap<>(checkoutPayloadResponse.getFields());
    }

    @Override
    @Transactional
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

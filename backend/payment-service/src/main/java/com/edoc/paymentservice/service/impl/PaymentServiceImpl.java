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

import com.edoc.paymentservice.service.PayHereSignatureService;
import com.edoc.paymentservice.util.HashUtils;
import com.edoc.paymentservice.util.JsonUtils;
import com.edoc.paymentservice.util.ValidationUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
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
    private static final String MD5SIG_PARAM = "md5sig";

    private final PaymentRepository paymentRepository;
    private final PaymentLogRepository paymentLogRepository;
    private final PaymentMapper paymentMapper;
    private final PayHereProperties payHereProperties;
    private final PayHereSignatureService payHereSignatureService;

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
        String hashedSecret = HashUtils.md5Upper(payHereProperties.merchantSecret());

        return HashUtils.md5Upper(payHereProperties.merchantId() + orderId.trim() + formattedAmount + normalizedCurrency + hashedSecret);
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
        Objects.requireNonNull(params, "params must not be null");
        log.info("Received PayHere notify callback");
        log.debug("PayHere notify payload={}", sanitizeNotifyParams(params));

        String merchantId = ValidationUtils.requireParam(params, "merchant_id");
        String orderId = ValidationUtils.requireParam(params, "order_id");
        String payhereAmount = ValidationUtils.requireParam(params, "payhere_amount");
        String payhereCurrency = ValidationUtils.requireParam(params, "payhere_currency");
        String statusCode = ValidationUtils.requireParam(params, "status_code");
        String md5sig = ValidationUtils.requireParam(params, MD5SIG_PARAM);

        if (!payHereProperties.merchantId().equals(merchantId)) {
            log.warn("Rejected notify callback due to merchant mismatch orderId={} receivedMerchantId={} configuredMerchantId={}",
                    orderId, merchantId, payHereProperties.merchantId());
            throw new InvalidNotificationSignatureException("merchant_id does not match configured merchant");
        }

        // PayHere spec: md5sig = MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + UPPER(MD5(secret)))
        String localSignature = payHereSignatureService.generate(orderId, payhereAmount, payhereCurrency, statusCode);
        if (!localSignature.equalsIgnoreCase(md5sig)) {
            log.warn("Rejected notify callback due to invalid signature orderId={} statusCode={}", orderId, statusCode);
            log.debug("Signature mismatch details orderId={} localSignature={} remoteSignature={}",
                    orderId, localSignature, md5sig);
            throw new InvalidNotificationSignatureException("Invalid PayHere notification signature");
        }
        log.info("PayHere signature verification passed orderId={} statusCode={}", orderId, statusCode);

        Payment payment = paymentRepository.findByPayhereOrderId(orderId)
                .orElseThrow(() -> {
                    log.warn("Payment not found for verified callback orderId={}", orderId);
                    return new PaymentNotFoundException("Payment not found for order_id: " + orderId);
                });

        validateNotificationBusinessData(payment, payhereAmount, payhereCurrency, orderId);

        PaymentStatus incomingStatus = PaymentStatus.fromPayHereCode(statusCode);
        if (payment.getStatus().canTransitionTo(incomingStatus)) {
            payment.setStatus(incomingStatus);
            paymentRepository.save(payment);
            log.info("Updated payment status paymentId={} orderId={} status={}", payment.getId(), orderId, incomingStatus);
        } else {
            log.info("Ignored out-of-order payment update paymentId={} orderId={} currentStatus={} incomingStatus={}",
                    payment.getId(), orderId, payment.getStatus(), incomingStatus);
        }

        PaymentLog paymentLog = PaymentLog.builder()
                .paymentId(payment.getId())
                .eventType("WEBHOOK_RECEIVED")
                .rawResponse(JsonUtils.toJson(params))
                .build();
        paymentLogRepository.save(paymentLog);
        log.info("Stored callback payload for paymentId={} orderId={}", payment.getId(), orderId);
    }

    @Override
    public Payment getPaymentById(UUID paymentId) {
        if (paymentId == null) {
            throw new IllegalArgumentException("paymentId is required");
        }

        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found for id: " + paymentId));
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

    private void validateNotificationBusinessData(Payment payment, String payhereAmount, String payhereCurrency, String orderId) {
        String expectedCurrency = payment.getCurrency() == null ? "" : payment.getCurrency().trim().toUpperCase(Locale.ROOT);
        String incomingCurrency = payhereCurrency.trim().toUpperCase(Locale.ROOT);
        if (!expectedCurrency.equals(incomingCurrency)) {
            log.warn("Rejected notify callback due to currency mismatch paymentId={} orderId={} expectedCurrency={} incomingCurrency={}",
                    payment.getId(), orderId, expectedCurrency, incomingCurrency);
            throw new IllegalArgumentException("Payment currency does not match callback currency");
        }

        BigDecimal incomingAmount;
        try {
            incomingAmount = new BigDecimal(payhereAmount);
        } catch (NumberFormatException ex) {
            log.warn("Rejected notify callback due to invalid amount format paymentId={} orderId={} amount={}",
                    payment.getId(), orderId, payhereAmount);
            throw new IllegalArgumentException("Invalid payhere_amount format");
        }

        if (payment.getAmount() == null || incomingAmount.compareTo(payment.getAmount()) != 0) {
            log.warn("Rejected notify callback due to amount mismatch paymentId={} orderId={} expectedAmount={} incomingAmount={}",
                    payment.getId(), orderId, payment.getAmount(), incomingAmount);
            throw new IllegalArgumentException("Payment amount does not match callback amount");
        }
    }

    private Map<String, String> sanitizeNotifyParams(Map<String, String> params) {
        Map<String, String> sanitized = new HashMap<>(params);
        sanitized.computeIfPresent(MD5SIG_PARAM, (key, value) -> "[REDACTED]");
        return sanitized;
    }

    
}

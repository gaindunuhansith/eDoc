package com.edoc.paymentservice.controller;

import com.edoc.paymentservice.config.PayHereProperties;
import com.edoc.paymentservice.dto.CheckoutPayloadResponse;
import com.edoc.paymentservice.dto.InitiatePaymentRequest;
import com.edoc.paymentservice.dto.NotificationRequest;
import com.edoc.paymentservice.dto.PaymentResponse;
import com.edoc.paymentservice.mapper.PaymentMapper;
import com.edoc.paymentservice.model.CustomerData;
import com.edoc.paymentservice.model.Payment;
import jakarta.validation.Valid;
import com.edoc.paymentservice.service.IPaymentService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final IPaymentService paymentService;
    private final PaymentMapper paymentMapper;
    private final PayHereProperties payHereProperties;

    @PostMapping("/initiate")
    public ResponseEntity<CheckoutPayloadResponse> initiatePayment(@Valid @RequestBody InitiatePaymentRequest request) {
        Payment payment = paymentService.createPayment(
                request.getAppointmentId(),
                request.getUserId(),
                request.getAmount(),
                request.getCurrency()
        );

        CustomerData customerData = new CustomerData(
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPhone(),
                request.getAddress(),
                request.getCity(),
                request.getCountry()
        );

        Map<String, String> fields = paymentService.initiatePayment(payment.getId(), customerData);
        return ResponseEntity.ok(
            CheckoutPayloadResponse.builder()
                .actionUrl(payHereProperties.checkoutUrl())
                .fields(fields)
                .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable UUID id) {
        Payment payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(paymentMapper.toStatusResponse(payment));
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        List<PaymentResponse> payments = paymentService.getAllPayments()
                .stream()
                .map(paymentMapper::toStatusResponse)
                .toList();
        return ResponseEntity.ok(payments);
    }

    @PostMapping(value = "/notify", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<String> handleNotification(@Valid @ModelAttribute NotificationRequest request) {
        Map<String, String> params = toNotificationParams(request);
        log.info("Incoming notify callback orderId={} paymentId={} statusCode={}",
            request.getOrderId(), request.getPaymentId(), request.getStatusCode());
        log.debug("Incoming notify payload keys={}", params.keySet());
        paymentService.handleNotification(params);
        log.info("Notify callback processed orderId={} paymentId={} statusCode={}",
            request.getOrderId(), request.getPaymentId(), request.getStatusCode());
        return ResponseEntity.ok("OK");
    }

    private Map<String, String> toNotificationParams(NotificationRequest request) {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("merchant_id", request.getMerchantId());
        params.put("order_id", request.getOrderId());
        params.put("payment_id", request.getPaymentId());
        params.put("payhere_amount", request.getPayhereAmount());
        params.put("payhere_currency", request.getPayhereCurrency());
        params.put("status_code", request.getStatusCode());
        params.put("md5sig", request.getMd5sig());
        params.put("custom_1", request.getCustom1());
        params.put("custom_2", request.getCustom2());
        params.put("method", request.getMethod());
        params.put("status_message", request.getStatusMessage());
        return params;
    }
}

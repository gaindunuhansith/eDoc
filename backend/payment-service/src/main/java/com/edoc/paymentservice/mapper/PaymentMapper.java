package com.edoc.paymentservice.mapper;

import com.edoc.paymentservice.config.PayHereProperties;
import com.edoc.paymentservice.dto.CheckoutPayloadResponse;
import com.edoc.paymentservice.dto.PaymentResponse;
import com.edoc.paymentservice.entity.Payment;
import com.edoc.paymentservice.model.CustomerData;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Component
public class PaymentMapper {

    private static final String DEFAULT_CURRENCY = "LKR";
    private static final String DEFAULT_ITEM_NAME = "Appointment Payment";

    public PaymentResponse toStatusResponse(Payment payment) {
        Objects.requireNonNull(payment, "payment must not be null");

        return new PaymentResponse(
                payment.getId(),
                payment.getPayhereOrderId(),
                payment.getAmount(),
                normalizeCurrency(payment.getCurrency()),
                payment.getStatus(),
                payment.getCreatedAt(),
                null
        );
    }

    public CheckoutPayloadResponse toCheckoutResponse(
            Payment payment,
            CustomerData customerData,
            String hash,
            PayHereProperties config
    ) {
        Objects.requireNonNull(payment, "payment must not be null");
        Objects.requireNonNull(config, "config must not be null");

        CustomerData safeCustomer = customerData == null
                ? new CustomerData("", "", "", "", "", "", "Sri Lanka")
                : customerData;

        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("merchant_id", config.merchantId());
        fields.put("return_url", config.returnUrl());
        fields.put("cancel_url", config.cancelUrl());
        fields.put("notify_url", config.notifyUrl());
        fields.put("order_id", payment.getPayhereOrderId());
        fields.put("items", DEFAULT_ITEM_NAME);
        fields.put("currency", normalizeCurrency(payment.getCurrency()));
        fields.put("amount", formatAmount(payment.getAmount()));
        fields.put("first_name", defaultString(safeCustomer.firstName()));
        fields.put("last_name", defaultString(safeCustomer.lastName()));
        fields.put("email", defaultString(safeCustomer.email()));
        fields.put("phone", defaultString(safeCustomer.phone()));
        fields.put("address", defaultString(safeCustomer.address()));
        fields.put("city", defaultString(safeCustomer.city()));
        fields.put("country", defaultCountry(safeCustomer.country()));
        fields.put("custom_1", payment.getId() == null ? "" : payment.getId().toString());
        fields.put("custom_2", payment.getAppointmentId() == null ? "" : payment.getAppointmentId().toString());
        fields.put("hash", defaultString(hash));

        return new CheckoutPayloadResponse(config.checkoutUrl(), fields);
    }

    private String formatAmount(BigDecimal amount) {
        if (amount == null) {
            return "0.00";
        }
        return amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private String normalizeCurrency(String currency) {
        if (currency == null || currency.isBlank()) {
            return DEFAULT_CURRENCY;
        }
        return currency.trim().toUpperCase(Locale.ROOT);
    }

    private String defaultString(String value) {
        return value == null ? "" : value;
    }

    private String defaultCountry(String country) {
        return (country == null || country.isBlank()) ? "Sri Lanka" : country;
    }
}

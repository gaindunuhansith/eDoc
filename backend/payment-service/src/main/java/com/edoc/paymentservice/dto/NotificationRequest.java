package com.edoc.paymentservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {

    @NotBlank(message = "Merchant ID is required")
    @JsonProperty("merchant_id")
    private String merchantId;

    @NotBlank(message = "Order ID is required")
    @JsonProperty("order_id")
    private String orderId;

    @NotBlank(message = "PayHere amount is required")
    @JsonProperty("payhere_amount")
    private String payhereAmount;

    @NotBlank(message = "PayHere currency is required")
    @JsonProperty("payhere_currency")
    private String payhereCurrency;

    @NotBlank(message = "Status code is required")
    @JsonProperty("status_code")
    private String statusCode;

    @NotBlank(message = "Signature is required")
    @JsonProperty("md5sig")
    private String md5sig;
}
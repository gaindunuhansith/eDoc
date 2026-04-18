package com.edoc.paymentservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayHereWebhookDTO {

    @JsonProperty("merchant_id")
    private String merchantId;

    @JsonProperty("order_id")
    private String orderId;

    @JsonProperty("payment_id")
    private String paymentId;

    @JsonProperty("payhere_amount")
    private String payhereAmount;

    @JsonProperty("payhere_currency")
    private String payhereCurrency;

    @JsonProperty("status_code")
    private String statusCode;

    @JsonProperty("md5sig")
    private String md5sig;
}

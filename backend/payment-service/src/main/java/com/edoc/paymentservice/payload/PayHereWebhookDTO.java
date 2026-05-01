package com.edoc.paymentservice.payload;

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

    @JsonProperty("status_Message")
    private String statusMessage;

    @JsonProperty("method")
    private String method;

    @JsonProperty("md5sig")
    private String md5sig;

    @JsonProperty("custom_1")
    private String custom1;

    @JsonProperty("custom_2")
    private String custom2;

}

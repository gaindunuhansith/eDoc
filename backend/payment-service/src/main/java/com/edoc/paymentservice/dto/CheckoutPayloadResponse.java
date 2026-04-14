package com.edoc.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutPayloadResponse {

    private String actionUrl;
    private Map<String, String> fields;
}

package com.edoc.paymentservice.dto;

import com.edoc.paymentservice.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private UUID id;
    private UUID appointmentId;
    private UUID patientId;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private String payhereOrderId;
    private LocalDateTime createdAt;
}
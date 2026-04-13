package com.edoc.paymentservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "payment_logs")
public class PaymentLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_id", nullable = false)
    private java.util.UUID paymentId;

    @Column(name = "raw_response", columnDefinition = "jsonb")
    private String rawResponse; // Full webhook payload from PayHere for debugging

    @Column(name = "event_type", nullable = false)
    private String eventType; // AUTHORIZATION, CAPTURE, WEBHOOK_RECEIVED

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
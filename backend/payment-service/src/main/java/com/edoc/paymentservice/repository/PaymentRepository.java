package com.edoc.paymentservice.repository;

import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.type.PaymentStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByAppointmentId(Long appointmentId);

    Optional<Payment> findByPayhereId(String payhereId);

    Optional<Payment> findByOrderId(String orderId);

    Page<Payment> findByUserId(Long userId, Pageable pageable);

    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);
}

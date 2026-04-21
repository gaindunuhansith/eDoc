package com.edoc.paymentservice.repository;

import com.edoc.paymentservice.model.PaymentTransactionLog;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionLogRepository extends JpaRepository<PaymentTransactionLog, UUID> {

    List<PaymentTransactionLog> findByPayment_IdOrderByCreatedAtDesc(UUID paymentId);
}

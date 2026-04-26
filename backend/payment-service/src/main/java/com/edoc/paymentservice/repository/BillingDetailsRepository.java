package com.edoc.paymentservice.repository;

import com.edoc.paymentservice.model.BillingDetails;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillingDetailsRepository extends JpaRepository<BillingDetails, UUID> {

    Optional<BillingDetails> findByPaymentId(UUID paymentId);

    boolean existsByPaymentId(UUID paymentId);
}

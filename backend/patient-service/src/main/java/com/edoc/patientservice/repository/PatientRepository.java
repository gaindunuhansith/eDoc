package com.edoc.patientservice.repository;

import com.edoc.patientservice.entity.Patient;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

// Patient persistence and lookup queries.
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    Optional<Patient> findByUserId(String userId);

    boolean existsByUserId(String userId);

    Optional<Patient> findByIdAndDeleted(UUID id, boolean deleted);

    boolean existsByIdAndDeleted(UUID id, boolean deleted);
}

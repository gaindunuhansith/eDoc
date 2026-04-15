package com.edoc.patientservice.repository;

import com.edoc.patientservice.entity.Patient;
import com.edoc.patientservice.entity.PatientStatus;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

// Patient persistence and lookup queries.
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByEmail(String email);

    Optional<Patient> findByIdAndStatus(Long id, PatientStatus status);

    boolean existsByIdAndStatus(Long id, PatientStatus status);
}

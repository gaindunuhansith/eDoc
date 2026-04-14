package com.edoc.patientservice.repository;

import com.edoc.patientservice.entity.MedicalHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

// Persistence for patient medical history entries.
public interface MedicalHistoryRepository extends JpaRepository<MedicalHistory, Long> {
    List<MedicalHistory> findByPatientId(Long patientId);
}

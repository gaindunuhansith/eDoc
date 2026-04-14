package com.edoc.patientservice.repository;

import com.edoc.patientservice.entity.MedicalHistory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalHistoryRepository extends JpaRepository<MedicalHistory, Long> {
    List<MedicalHistory> findByPatientId(Long patientId);
}

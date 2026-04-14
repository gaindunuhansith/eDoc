package com.edoc.patientservice.repository;

import com.edoc.patientservice.entity.MedicalReport;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {
    List<MedicalReport> findByPatientId(Long patientId);
}

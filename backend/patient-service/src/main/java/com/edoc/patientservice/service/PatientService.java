package com.edoc.patientservice.service;

import com.edoc.patientservice.entity.MedicalReport;
import com.edoc.patientservice.entity.Patient;
import com.edoc.patientservice.repository.MedicalReportRepository;
import com.edoc.patientservice.repository.PatientRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;
    private final MedicalReportRepository medicalReportRepository;

    public PatientService(PatientRepository patientRepository, MedicalReportRepository medicalReportRepository) {
        this.patientRepository = patientRepository;
        this.medicalReportRepository = medicalReportRepository;
    }

    public Patient registerPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    @Transactional(readOnly = true)
    public Patient getPatient(Long id) {
        return findPatientOrThrow(id);
    }

    public Patient updatePatient(Long id, Patient updates) {
        Patient existing = findPatientOrThrow(id);

        if (updates.getFirstName() != null) {
            existing.setFirstName(updates.getFirstName());
        }
        if (updates.getLastName() != null) {
            existing.setLastName(updates.getLastName());
        }
        if (updates.getEmail() != null) {
            existing.setEmail(updates.getEmail());
        }
        if (updates.getPhone() != null) {
            existing.setPhone(updates.getPhone());
        }
        if (updates.getDateOfBirth() != null) {
            existing.setDateOfBirth(updates.getDateOfBirth());
        }
        if (updates.getAddress() != null) {
            existing.setAddress(updates.getAddress());
        }

        return patientRepository.save(existing);
    }

    public MedicalReport addMedicalReport(Long patientId, MedicalReport report) {
        Patient patient = findPatientOrThrow(patientId);
        report.setPatient(patient);
        return medicalReportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public List<MedicalReport> getMedicalReports(Long patientId) {
        findPatientOrThrow(patientId);
        return medicalReportRepository.findByPatientId(patientId);
    }

    private Patient findPatientOrThrow(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
    }
}

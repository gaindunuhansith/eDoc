package com.edoc.patientservice.service;

import com.edoc.patientservice.dto.patient.PatientRequestDTO;
import com.edoc.patientservice.dto.patient.PatientResponseDTO;
import com.edoc.patientservice.entity.Patient;
import com.edoc.patientservice.mapper.PatientMapper;
import com.edoc.patientservice.repository.PatientRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    public PatientService(PatientRepository patientRepository, PatientMapper patientMapper) {
        this.patientRepository = patientRepository;
        this.patientMapper = patientMapper;
    }

    public PatientResponseDTO registerPatient(PatientRequestDTO request) {
        // Create a new patient record from the registration payload.
        Patient patient = patientMapper.toEntity(request);
        return patientMapper.toResponse(patientRepository.save(patient));
    }

    @Transactional(readOnly = true)
    public PatientResponseDTO getPatient(Long id) {
        // Return a patient profile by id.
        return patientMapper.toResponse(findPatientOrThrow(id));
    }

    public PatientResponseDTO updatePatient(Long id, PatientRequestDTO request) {
        // Replace profile fields with the provided payload.
        Patient existing = findPatientOrThrow(id);
        patientMapper.applyUpdates(existing, request);
        return patientMapper.toResponse(patientRepository.save(existing));
    }

    private Patient findPatientOrThrow(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
    }
}

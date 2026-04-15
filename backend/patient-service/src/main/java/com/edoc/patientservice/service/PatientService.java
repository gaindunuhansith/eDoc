package com.edoc.patientservice.service;

import com.edoc.patientservice.dto.patient.PatientRequestDTO;
import com.edoc.patientservice.dto.patient.PatientResponseDTO;
import com.edoc.patientservice.dto.patient.PatientStatusResponseDTO;
import com.edoc.patientservice.dto.patient.PatientStatusUpdateRequestDTO;
import com.edoc.patientservice.entity.Patient;
import com.edoc.patientservice.entity.PatientStatus;
import com.edoc.patientservice.mapper.PatientMapper;
import com.edoc.patientservice.repository.PatientRepository;
import java.time.Instant;
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
        patient.setStatus(PatientStatus.ACTIVE);
        return patientMapper.toResponse(patientRepository.save(patient));
    }

    @Transactional(readOnly = true)
    public PatientResponseDTO getPatient(Long id) {
        // Return a patient profile by id.
        return patientMapper.toResponse(findPatientOrThrow(id));
    }

    @Transactional(readOnly = true)
    public PatientStatusResponseDTO getPatientStatus(Long id) {
        Patient patient = findPatientOrThrow(id);
        PatientStatusResponseDTO response = new PatientStatusResponseDTO();
        response.setId(patient.getId());
        response.setStatus(patient.getStatus());
        return response;
    }

    public PatientResponseDTO updatePatient(Long id, PatientRequestDTO request) {
        // Replace profile fields with the provided payload.
        Patient existing = findPatientOrThrow(id);
        assertActiveForWrite(existing);
        patientMapper.applyUpdates(existing, request);
        return patientMapper.toResponse(patientRepository.save(existing));
    }

    public PatientResponseDTO changePatientStatus(Long id, PatientStatusUpdateRequestDTO request, Long actorId) {
        Patient patient = findPatientOrThrow(id);

        if (patient.getStatus() == request.getStatus()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Patient already has requested status");
        }

        if (request.getStatus() == PatientStatus.INACTIVE) {
            if (request.getReason() == null || request.getReason().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deactivation reason is required");
            }
            patient.setStatus(PatientStatus.INACTIVE);
            patient.setDeactivatedAt(Instant.now());
            patient.setDeactivatedBy(actorId);
            patient.setDeactivationReason(request.getReason().trim());
        } else {
            patient.setStatus(PatientStatus.ACTIVE);
            patient.setDeactivatedAt(null);
            patient.setDeactivatedBy(null);
            patient.setDeactivationReason(null);
        }

        return patientMapper.toResponse(patientRepository.save(patient));
    }

    public PatientResponseDTO changeCurrentPatientStatus(Long currentPatientId, PatientStatusUpdateRequestDTO request) {
        Long actorId = request.getActedBy() != null ? request.getActedBy() : currentPatientId;
        return changePatientStatus(currentPatientId, request, actorId);
    }

    private void assertActiveForWrite(Patient patient) {
        if (patient.getStatus() != PatientStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Patient is inactive");
        }
    }

    private Patient findPatientOrThrow(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
    }
}

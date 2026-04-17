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

    public PatientResponseDTO registerPatient(PatientRequestDTO request, String userId) {
        // Prevent duplicate profiles for the same user-service account.
        if (patientRepository.existsByUserId(userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Patient profile already exists for this user");
        }
        Patient patient = patientMapper.toEntity(request);
        patient.setUserId(userId);
        patient.setStatus(PatientStatus.ACTIVE);
        return patientMapper.toResponse(patientRepository.save(patient));
    }

    @Transactional(readOnly = true)
    public PatientResponseDTO getPatientByUserId(String userId) {
        // Return a patient profile by user-service userId.
        return patientMapper.toResponse(findByUserIdOrThrow(userId));
    }

    @Transactional(readOnly = true)
    public PatientResponseDTO getPatient(Long id) {
        // Return a patient profile by internal patient id (used by internal endpoints).
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

    public PatientResponseDTO updatePatientByUserId(String userId, PatientRequestDTO request) {
        // Replace profile fields for the authenticated user's patient record.
        Patient existing = findByUserIdOrThrow(userId);
        assertActiveForWrite(existing);
        patientMapper.applyUpdates(existing, request);
        return patientMapper.toResponse(patientRepository.save(existing));
    }

    public PatientResponseDTO changePatientStatusByUserId(String userId, PatientStatusUpdateRequestDTO request) {
        Patient patient = findByUserIdOrThrow(userId);
        Long actorId = request.getActedBy();
        return applyStatusChange(patient, request, actorId);
    }

    public PatientResponseDTO changePatientStatus(Long id, PatientStatusUpdateRequestDTO request, Long actorId) {
        Patient patient = findPatientOrThrow(id);
        return applyStatusChange(patient, request, actorId);
    }

    private PatientResponseDTO applyStatusChange(Patient patient, PatientStatusUpdateRequestDTO request, Long actorId) {
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

    private void assertActiveForWrite(Patient patient) {
        if (patient.getStatus() != PatientStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Patient is inactive");
        }
    }

    private Patient findByUserIdOrThrow(String userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient profile not found"));
    }

    private Patient findPatientOrThrow(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
    }
}

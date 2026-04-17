package com.edoc.patientservice.service;

import com.edoc.patientservice.client.UserServiceClient;
import com.edoc.patientservice.dto.patient.PatientRequestDTO;
import com.edoc.patientservice.dto.patient.PatientResponseDTO;
import com.edoc.patientservice.dto.patient.PatientStatusResponseDTO;
import com.edoc.patientservice.dto.patient.PatientStatusUpdateRequestDTO;
import com.edoc.patientservice.entity.Patient;
import com.edoc.patientservice.mapper.PatientMapper;
import com.edoc.patientservice.repository.PatientRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;
    private final UserServiceClient userServiceClient;

    public PatientService(PatientRepository patientRepository,
                          PatientMapper patientMapper,
                          UserServiceClient userServiceClient) {
        this.patientRepository = patientRepository;
        this.patientMapper = patientMapper;
        this.userServiceClient = userServiceClient;
    }

    public PatientResponseDTO registerPatient(PatientRequestDTO request, String userId) {
        // Prevent duplicate profiles for the same user-service account.
        if (patientRepository.existsByUserId(userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Patient profile already exists for this user");
        }
        Patient patient = patientMapper.toEntity(request);
        patient.setUserId(userId);
        patient.setDeleted(false);
        return patientMapper.toResponse(patientRepository.save(patient));
    }

    @Transactional(readOnly = true)
    public PatientResponseDTO getPatientByUserId(String userId) {
        // Return a patient profile by user-service userId.
        return patientMapper.toResponse(findByUserIdOrThrow(userId));
    }

    @Transactional(readOnly = true)
    public PatientResponseDTO getPatient(UUID id) {
        // Return a patient profile by internal patient id (used by internal endpoints).
        return patientMapper.toResponse(findPatientOrThrow(id));
    }

    @Transactional(readOnly = true)
    public PatientStatusResponseDTO getPatientStatus(UUID id) {
        Patient patient = findPatientOrThrow(id);
        PatientStatusResponseDTO response = new PatientStatusResponseDTO();
        response.setId(patient.getId());
        response.setDeleted(patient.isDeleted());
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
        // Actor is the patient themselves — derive from the resolved entity, never trust the request body.
        UUID actorId = patient.getId();
        return applyStatusChange(patient, request, actorId);
    }

    public PatientResponseDTO changePatientStatus(UUID id, PatientStatusUpdateRequestDTO request, UUID actorId) {
        Patient patient = findPatientOrThrow(id);
        return applyStatusChange(patient, request, actorId);
    }

    // ─── Admin operations ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PatientResponseDTO> getAllPatients(String authHeader) {
        List<PatientResponseDTO> patients = patientRepository.findAll().stream()
                .map(patientMapper::toResponse)
                .collect(Collectors.toList());

        // Enrich with names from user-service (best-effort — missing entries are silently skipped).
        List<String> userIds = patients.stream().map(PatientResponseDTO::getUserId).collect(Collectors.toList());
        Map<String, UserServiceClient.UserSummary> summaries = userServiceClient.getUserSummaries(userIds, authHeader);
        patients.forEach(p -> {
            UserServiceClient.UserSummary summary = summaries.get(p.getUserId());
            if (summary != null) {
                p.setUserName(summary.name());
                p.setUserEmail(summary.email());
            }
        });
        return patients;
    }

    @Transactional(readOnly = true)
    public PatientResponseDTO getAdminPatient(UUID id, String authHeader) {
        PatientResponseDTO dto = patientMapper.toResponse(findPatientOrThrow(id));
        Map<String, UserServiceClient.UserSummary> summaries =
                userServiceClient.getUserSummaries(List.of(dto.getUserId()), authHeader);
        UserServiceClient.UserSummary summary = summaries.get(dto.getUserId());
        if (summary != null) {
            dto.setUserName(summary.name());
            dto.setUserEmail(summary.email());
        }
        return dto;
    }

    public PatientResponseDTO changePatientStatusAdmin(UUID id, PatientStatusUpdateRequestDTO request) {
        Patient patient = findPatientOrThrow(id);
        // Admin actors do not have a patient-service record — actorId is null for admin-initiated changes.
        return applyStatusChange(patient, request, null);
    }

    private PatientResponseDTO applyStatusChange(Patient patient, PatientStatusUpdateRequestDTO request, UUID actorId) {
        if (patient.isDeleted() == request.isDeleted()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Patient already has requested status");
        }

        if (request.isDeleted()) {
            if (request.getReason() == null || request.getReason().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deletion reason is required");
            }
            patient.setDeleted(true);
            patient.setDeletedAt(Instant.now());
            patient.setDeletedBy(actorId);
            patient.setDeletionReason(request.getReason().trim());
        } else {
            patient.setDeleted(false);
            patient.setDeletedAt(null);
            patient.setDeletedBy(null);
            patient.setDeletionReason(null);
        }

        return patientMapper.toResponse(patientRepository.save(patient));
    }

    private void assertActiveForWrite(Patient patient) {
        if (patient.isDeleted()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Patient is inactive");
        }
    }

    private Patient findByUserIdOrThrow(String userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient profile not found"));
    }

    private Patient findPatientOrThrow(UUID id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
    }
}

package com.edoc.patientservice.service;

import com.edoc.patientservice.dto.history.MedicalHistoryRequestDTO;
import com.edoc.patientservice.dto.history.MedicalHistoryResponseDTO;
import com.edoc.patientservice.entity.MedicalHistory;
import com.edoc.patientservice.entity.Patient;
import com.edoc.patientservice.mapper.MedicalHistoryMapper;
import com.edoc.patientservice.repository.MedicalHistoryRepository;
import com.edoc.patientservice.repository.PatientRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class MedicalHistoryService {

    private final MedicalHistoryRepository medicalHistoryRepository;
    private final PatientRepository patientRepository;
    private final MedicalHistoryMapper medicalHistoryMapper;

    public MedicalHistoryService(MedicalHistoryRepository medicalHistoryRepository,
                                 PatientRepository patientRepository,
                                 MedicalHistoryMapper medicalHistoryMapper) {
        this.medicalHistoryRepository = medicalHistoryRepository;
        this.patientRepository = patientRepository;
        this.medicalHistoryMapper = medicalHistoryMapper;
    }

    @Transactional(readOnly = true)
    public List<MedicalHistoryResponseDTO> getHistoryForPatient(Long patientId) {
        // Ensure the patient exists before returning history.
        findPatientOrThrow(patientId);
        return medicalHistoryRepository.findByPatientId(patientId).stream()
                .map(medicalHistoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    public MedicalHistoryResponseDTO addHistoryInternal(Long patientId, MedicalHistoryRequestDTO request) {
        // Create a history entry for internal systems.
        Patient patient = findPatientOrThrow(patientId);
        MedicalHistory history = medicalHistoryMapper.toEntity(request);
        history.setPatient(patient);
        return medicalHistoryMapper.toResponse(medicalHistoryRepository.save(history));
    }

    @Transactional(readOnly = true)
    public List<MedicalHistoryResponseDTO> getHistoryInternal(Long patientId) {
        // Internal endpoint for staff services to read history.
        return getHistoryForPatient(patientId);
    }

    private Patient findPatientOrThrow(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Patient not found"));
    }
}

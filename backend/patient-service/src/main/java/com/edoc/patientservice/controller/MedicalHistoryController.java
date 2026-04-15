package com.edoc.patientservice.controller;

import com.edoc.patientservice.dto.history.MedicalHistoryRequestDTO;
import com.edoc.patientservice.dto.history.MedicalHistoryResponseDTO;
import com.edoc.patientservice.service.CurrentPatientProvider;
import com.edoc.patientservice.service.MedicalHistoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MedicalHistoryController {

    private final MedicalHistoryService medicalHistoryService;
    private final CurrentPatientProvider currentPatientProvider;

    public MedicalHistoryController(MedicalHistoryService medicalHistoryService,
                                    CurrentPatientProvider currentPatientProvider) {
        this.medicalHistoryService = medicalHistoryService;
        this.currentPatientProvider = currentPatientProvider;
    }

    @GetMapping("/patients/me/history")
    // List medical history entries for the authenticated patient.
    public List<MedicalHistoryResponseDTO> getMyHistory() {
        return medicalHistoryService.getHistoryForPatient(currentPatientProvider.getCurrentPatientId());
    }

    @PostMapping("/internal/patients/{id}/history")
    @ResponseStatus(HttpStatus.CREATED)
    // Internal endpoint to add history entries for a patient.
    public MedicalHistoryResponseDTO addHistoryInternal(@PathVariable Long id,
                                                        @Valid @RequestBody MedicalHistoryRequestDTO request) {
        return medicalHistoryService.addHistoryInternal(id, request);
    }

    @GetMapping("/internal/patients/{id}/history")
    // Internal endpoint to read history entries for a patient.
    public List<MedicalHistoryResponseDTO> getHistoryInternal(@PathVariable Long id) {
        return medicalHistoryService.getHistoryInternal(id);
    }
}

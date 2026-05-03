package com.edoc.patientservice.controller;

import com.edoc.patientservice.dto.patient.PatientRequestDTO;
import com.edoc.patientservice.dto.patient.PatientResponseDTO;
import com.edoc.patientservice.dto.patient.PatientStatusResponseDTO;
import com.edoc.patientservice.dto.patient.PatientStatusUpdateRequestDTO;
import com.edoc.patientservice.service.CurrentPatientProvider;
import com.edoc.patientservice.service.PatientService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class PatientController {

    private final PatientService patientService;
    private final CurrentPatientProvider currentPatientProvider;

    public PatientController(PatientService patientService, CurrentPatientProvider currentPatientProvider) {
        this.patientService = patientService;
        this.currentPatientProvider = currentPatientProvider;
    }

    @PostMapping("/patients/register")
    @ResponseStatus(HttpStatus.CREATED)
    // Register a new patient profile linked to the authenticated user-service account.
    public PatientResponseDTO registerPatient(@Valid @RequestBody PatientRequestDTO request) {
        return patientService.registerPatient(request, currentPatientProvider.getCurrentUserId());
    }

    @GetMapping("/patients/me")
    // Read the current patient's profile using the authenticated user-service identity.
    public PatientResponseDTO getCurrentPatient() {
        return patientService.getPatientByUserId(currentPatientProvider.getCurrentUserId());
    }

    @PutMapping("/patients/me")
    // Update the current patient's profile.
    public PatientResponseDTO updateCurrentPatient(@Valid @RequestBody PatientRequestDTO request) {
        return patientService.updatePatientByUserId(currentPatientProvider.getCurrentUserId(), request);
    }

    @PatchMapping("/patients/me/status")
    // Change the current patient's account status and keep deactivation audit data.
    public PatientResponseDTO updateCurrentPatientStatus(@Valid @RequestBody PatientStatusUpdateRequestDTO request) {
        return patientService.changePatientStatusByUserId(currentPatientProvider.getCurrentUserId(), request);
    }

    @GetMapping("/internal/patients/{id}")
    // Internal lookup for other services by internal patient id.
    public PatientResponseDTO getPatientInternal(@PathVariable UUID id) {
        return patientService.getPatient(id);
    }

    @GetMapping("/internal/patients/by-user/{userId}")
    // Internal lookup by user-service UUID string (used by doctor-service).
    public PatientResponseDTO getPatientByUserIdInternal(@PathVariable String userId) {
        return patientService.getPatientByUserId(userId);
    }

    @GetMapping("/internal/patients/{id}/status")
    // Internal lightweight status lookup for booking and authorization checks.
    public PatientStatusResponseDTO getPatientStatusInternal(@PathVariable UUID id) {
        return patientService.getPatientStatus(id);
    }

    @PatchMapping("/internal/patients/{id}/status")
    // Internal status updates for admin/staff workflows.
    public PatientResponseDTO updatePatientStatusInternal(@PathVariable UUID id,
                                                          @Valid @RequestBody PatientStatusUpdateRequestDTO request) {
        return patientService.changePatientStatus(id, request, request.getActedBy());
    }

    @DeleteMapping("/internal/patients/by-user/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    // Called by user-service on PATIENT account deletion — soft-deletes the linked profile.
    public void softDeletePatientByUserId(@PathVariable String userId) {
        PatientStatusUpdateRequestDTO req = new PatientStatusUpdateRequestDTO();
        req.setDeleted(true);
        req.setReason("Account deleted via user-service cascade");
        patientService.changePatientStatusByUserId(userId, req);
    }
}

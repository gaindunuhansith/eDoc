package com.edoc.patientservice.controller;

import com.edoc.patientservice.dto.patient.PatientRequestDTO;
import com.edoc.patientservice.dto.patient.PatientResponseDTO;
import com.edoc.patientservice.dto.patient.PatientStatusResponseDTO;
import com.edoc.patientservice.dto.patient.PatientStatusUpdateRequestDTO;
import com.edoc.patientservice.service.CurrentPatientProvider;
import com.edoc.patientservice.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PatientController {

    private final PatientService patientService;
    private final CurrentPatientProvider currentPatientProvider;

    public PatientController(PatientService patientService, CurrentPatientProvider currentPatientProvider) {
        this.patientService = patientService;
        this.currentPatientProvider = currentPatientProvider;
    }

    @PostMapping("/patients/register")
    @ResponseStatus(HttpStatus.CREATED)
    // Register a new patient account with profile details.
    public PatientResponseDTO registerPatient(@Valid @RequestBody PatientRequestDTO request) {
        return patientService.registerPatient(request);
    }

    @GetMapping("/patients/me")
    // Read the current patient's profile using the authenticated identity.
    public PatientResponseDTO getCurrentPatient() {
        return patientService.getPatient(currentPatientProvider.getCurrentPatientId());
    }

    @PutMapping("/patients/me")
    // Update the current patient's profile.
    public PatientResponseDTO updateCurrentPatient(@Valid @RequestBody PatientRequestDTO request) {
        return patientService.updatePatient(currentPatientProvider.getCurrentPatientId(), request);
    }

    @PatchMapping("/patients/me/status")
    // Change the current patient's account status and keep deactivation audit data.
    public PatientResponseDTO updateCurrentPatientStatus(@Valid @RequestBody PatientStatusUpdateRequestDTO request) {
        return patientService.changeCurrentPatientStatus(currentPatientProvider.getCurrentPatientId(), request);
    }

    @GetMapping("/internal/patients/{id}")
    // Internal lookup for other services by patient id.
    public PatientResponseDTO getPatientInternal(@PathVariable Long id) {
        return patientService.getPatient(id);
    }

    @GetMapping("/internal/patients/{id}/status")
    // Internal lightweight status lookup for booking and authorization checks.
    public PatientStatusResponseDTO getPatientStatusInternal(@PathVariable Long id) {
        return patientService.getPatientStatus(id);
    }

    @PatchMapping("/internal/patients/{id}/status")
    // Internal status updates for admin/staff workflows.
    public PatientResponseDTO updatePatientStatusInternal(@PathVariable Long id,
                                                          @Valid @RequestBody PatientStatusUpdateRequestDTO request) {
        return patientService.changePatientStatus(id, request, request.getActedBy());
    }
}

package com.edoc.patientservice.controller;

import com.edoc.patientservice.dto.prescription.PrescriptionResponseDTO;
import com.edoc.patientservice.service.CurrentPatientProvider;
import com.edoc.patientservice.service.PrescriptionService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final CurrentPatientProvider currentPatientProvider;

    public PrescriptionController(PrescriptionService prescriptionService,
                                  CurrentPatientProvider currentPatientProvider) {
        this.prescriptionService = prescriptionService;
        this.currentPatientProvider = currentPatientProvider;
    }

    @GetMapping("/patients/me/prescriptions")
    // Patient-facing endpoint aggregating prescriptions from doctor-service.
    public List<PrescriptionResponseDTO> getMyPrescriptions(HttpServletRequest request) {
        return prescriptionService.getPrescriptionsForPatient(
                currentPatientProvider.getCurrentUserId(),
                request.getHeader("Authorization"));
    }

    @GetMapping("/internal/patients/{id}/prescriptions")
    // Internal endpoint for cross-service prescription reads by patient id.
    public List<PrescriptionResponseDTO> getPrescriptionsInternal(@PathVariable UUID id,
                                                                   HttpServletRequest request) {
        return prescriptionService.getPrescriptionsInternal(id, request.getHeader("Authorization"));
    }

    @GetMapping("/patients/{userId}/prescriptions")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    // Doctor/admin endpoint to view a specific patient's prescriptions by their user-service UUID.
    public List<PrescriptionResponseDTO> getPatientPrescriptions(@PathVariable String userId,
                                                                  HttpServletRequest request) {
        return prescriptionService.getPrescriptionsForPatient(userId, request.getHeader("Authorization"));
    }
}
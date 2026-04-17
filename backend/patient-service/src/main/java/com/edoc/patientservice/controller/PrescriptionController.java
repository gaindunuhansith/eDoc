package com.edoc.patientservice.controller;

import com.edoc.patientservice.dto.prescription.PrescriptionResponseDTO;
import com.edoc.patientservice.service.CurrentPatientProvider;
import com.edoc.patientservice.service.PrescriptionService;
import java.util.List;
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
    public List<PrescriptionResponseDTO> getMyPrescriptions() {
        return prescriptionService.getPrescriptionsForPatient(currentPatientProvider.getCurrentPatientId());
    }

    @GetMapping("/internal/patients/{id}/prescriptions")
    // Internal endpoint for cross-service prescription reads by patient id.
    public List<PrescriptionResponseDTO> getPrescriptionsInternal(@PathVariable Long id) {
        return prescriptionService.getPrescriptionsInternal(id);
    }
}
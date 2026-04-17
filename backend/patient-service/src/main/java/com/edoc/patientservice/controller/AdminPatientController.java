package com.edoc.patientservice.controller;

import com.edoc.patientservice.dto.patient.PatientResponseDTO;
import com.edoc.patientservice.dto.patient.PatientStatusUpdateRequestDTO;
import com.edoc.patientservice.service.PatientService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/patients/admin")
public class AdminPatientController {

    private final PatientService patientService;

    public AdminPatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/all")
    // List every patient profile. Secured to ADMIN role in SecurityConfig.
    public List<PatientResponseDTO> getAllPatients(HttpServletRequest request) {
        return patientService.getAllPatients(request.getHeader("Authorization"));
    }

    @GetMapping("/{id}")
    // Fetch a single patient by internal patient id.
    public PatientResponseDTO getPatient(@PathVariable UUID id, HttpServletRequest request) {
        return patientService.getAdminPatient(id, request.getHeader("Authorization"));
    }

    @PatchMapping("/{id}/status")
    // Change a patient's status on behalf of an admin. actedBy is derived server-side (null for admin actors).
    public PatientResponseDTO changePatientStatus(@PathVariable UUID id,
                                                  @Valid @RequestBody PatientStatusUpdateRequestDTO request) {
        return patientService.changePatientStatusAdmin(id, request);
    }
}

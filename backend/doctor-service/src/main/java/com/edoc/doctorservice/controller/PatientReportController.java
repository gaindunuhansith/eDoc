package com.edoc.doctorservice.controller;

import com.edoc.doctorservice.client.PatientServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PatientReportController {

    private final PatientServiceClient patientServiceClient;

    // GET /api/doctors/{doctorId}/patients/{patientId}/reports
    // Doctor views all uploaded reports of a specific patient
    @GetMapping("/{doctorId}/patients/{patientId}/reports")
    public ResponseEntity<List<Map>> getPatientReports(
            @PathVariable String doctorId,
            @PathVariable String patientId) {
        return ResponseEntity.ok(patientServiceClient.getPatientReports(patientId));
    }

    // GET /api/doctors/{doctorId}/patients/{patientId}
    // Doctor views basic patient profile
    @GetMapping("/{doctorId}/patients/{patientId}")
    public ResponseEntity<Map> getPatientProfile(
            @PathVariable String doctorId,
            @PathVariable String patientId) {
        return ResponseEntity.ok(patientServiceClient.getPatientById(patientId));
    }
}

package com.edoc.doctorservice.controller;

import com.edoc.doctorservice.client.PatientServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
public class PatientReportController {

    private final PatientServiceClient patientServiceClient;

    // GET /api/v1/doctors/{doctorId}/patients/{patientId}/reports
    // Doctor views all uploaded reports of a specific patient
    @GetMapping("/{doctorId}/patients/{patientId}/reports")
    public ResponseEntity<List<Map<String, Object>>> getPatientReports(
            @PathVariable String doctorId,
            @PathVariable String patientId) {
        return ResponseEntity.ok(patientServiceClient.getPatientReports(patientId));
    }

    // GET /api/v1/doctors/{doctorId}/patients/{patientId}/reports/{reportId}/file
    // Doctor downloads/views the actual file of a specific patient report
    @GetMapping("/{doctorId}/patients/{patientId}/reports/{reportId}/file")
    public ResponseEntity<byte[]> getPatientReportFile(
            @PathVariable String doctorId,
            @PathVariable String patientId,
            @PathVariable Long reportId) {
        ResponseEntity<byte[]> upstream = patientServiceClient.getPatientReportFile(patientId, reportId);
        // Forward content-type and content-disposition from the upstream response
        HttpHeaders headers = new HttpHeaders();
        if (upstream.getHeaders().getContentType() != null) {
            headers.setContentType(upstream.getHeaders().getContentType());
        }
        String disposition = upstream.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION);
        if (disposition != null) {
            headers.set(HttpHeaders.CONTENT_DISPOSITION, disposition);
        }
        return ResponseEntity.status(upstream.getStatusCode()).headers(headers).body(upstream.getBody());
    }

    // GET /api/v1/doctors/{doctorId}/patients/{patientId}
    // Doctor views basic patient profile
    @GetMapping("/{doctorId}/patients/{patientId}")
    public ResponseEntity<Map<String, Object>> getPatientProfile(
            @PathVariable String doctorId,
            @PathVariable String patientId) {
        return ResponseEntity.ok(patientServiceClient.getPatientById(patientId));
    }
}

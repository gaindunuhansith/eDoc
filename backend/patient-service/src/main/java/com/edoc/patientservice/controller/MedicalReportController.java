package com.edoc.patientservice.controller;

import com.edoc.patientservice.dto.report.MedicalReportRequestDTO;
import com.edoc.patientservice.dto.report.MedicalReportResponseDTO;
import com.edoc.patientservice.service.CurrentPatientProvider;
import com.edoc.patientservice.service.MedicalReportService;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class MedicalReportController {

    private final MedicalReportService medicalReportService;
    private final CurrentPatientProvider currentPatientProvider;

    public MedicalReportController(MedicalReportService medicalReportService,
                                   CurrentPatientProvider currentPatientProvider) {
        this.medicalReportService = medicalReportService;
        this.currentPatientProvider = currentPatientProvider;
    }

    @PostMapping("/patients/me/reports")
    @ResponseStatus(HttpStatus.CREATED)
    // Upload a medical report file for the authenticated patient.
    public MedicalReportResponseDTO uploadReport(@RequestPart("file") MultipartFile file,
                                                 @RequestPart(value = "metadata", required = false)
                                                 MedicalReportRequestDTO request) {
        return medicalReportService.uploadReport(currentPatientProvider.getCurrentPatientId(), file, request);
    }

    @GetMapping("/patients/me/reports")
    // List all reports for the authenticated patient.
    public List<MedicalReportResponseDTO> getMyReports() {
        return medicalReportService.getReportsForPatient(currentPatientProvider.getCurrentPatientId());
    }

    @GetMapping("/patients/me/reports/{id}")
    // Get a single report by id for the authenticated patient.
    public MedicalReportResponseDTO getMyReport(@PathVariable Long id) {
        return medicalReportService.getReportForPatient(currentPatientProvider.getCurrentPatientId(), id);
    }

    @GetMapping("/patients/me/reports/{id}/file")
    // Download the original report file for the authenticated patient.
    public ResponseEntity<Resource> downloadMyReport(@PathVariable Long id) {
        return medicalReportService.getReportFileForPatient(currentPatientProvider.getCurrentPatientId(), id);
    }

    @GetMapping("/internal/patients/{id}/reports")
    // Internal lookup for another service to read reports.
    public List<MedicalReportResponseDTO> getReportsInternal(@PathVariable Long id) {
        return medicalReportService.getReportsForPatientInternal(id);
    }
}

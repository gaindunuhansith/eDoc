package com.edoc.patientservice.controller;

import com.edoc.patientservice.dto.report.MedicalReportRequestDTO;
import com.edoc.patientservice.dto.report.MedicalReportResponseDTO;
import com.edoc.patientservice.service.CurrentPatientProvider;
import com.edoc.patientservice.service.MedicalReportService;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

@RestController
public class MedicalReportController {

    private final MedicalReportService medicalReportService;
    private final CurrentPatientProvider currentPatientProvider;
    private final ObjectMapper objectMapper;

    public MedicalReportController(MedicalReportService medicalReportService,
                                   CurrentPatientProvider currentPatientProvider,
                                   ObjectMapper objectMapper) {
        this.medicalReportService = medicalReportService;
        this.currentPatientProvider = currentPatientProvider;
        this.objectMapper = objectMapper;
    }

    @PostMapping(value = "/patients/me/reports", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    // Upload a medical report file for the authenticated patient.
    // This endpoint supports plain form-data fields (reportName, notes) and optional JSON metadata.
    public MedicalReportResponseDTO uploadReport(@RequestParam("file") MultipartFile file,
                                                 @RequestParam(value = "reportName", required = false) String reportName,
                                                 @RequestParam(value = "notes", required = false) String notes,
                                                 @RequestPart(value = "metadata", required = false) String metadataJson) {
        MedicalReportRequestDTO dto = buildMetadata(reportName, notes, metadataJson);
        return medicalReportService.uploadReport(currentPatientProvider.getCurrentPatientId(), file, dto);
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

    @GetMapping("/patients/me/reports/{id}/download")
    // Alias of /file to keep client URLs flexible without duplicating logic.
    public ResponseEntity<Resource> downloadMyReportAlias(@PathVariable Long id) {
        return medicalReportService.getReportFileForPatient(currentPatientProvider.getCurrentPatientId(), id);
    }

    @GetMapping("/internal/patients/{id}/reports")
    // Internal lookup for another service to read reports.
    public List<MedicalReportResponseDTO> getReportsInternal(@PathVariable Long id) {
        return medicalReportService.getReportsForPatientInternal(id);
    }

    @GetMapping("/internal/patients/{patientId}/reports/{reportId}/file")
    // Internal file access endpoint for doctor-service and other backend services.
    public ResponseEntity<Resource> downloadReportInternal(@PathVariable Long patientId,
                                                           @PathVariable Long reportId) {
        return medicalReportService.getReportFileInternal(patientId, reportId);
    }

    @GetMapping("/internal/patients/{patientId}/reports/{reportId}/download")
    // Alias of the internal /file endpoint used by doctor-service integrations.
    public ResponseEntity<Resource> downloadReportInternalAlias(@PathVariable Long patientId,
                                                                @PathVariable Long reportId) {
        return medicalReportService.getReportFileInternal(patientId, reportId);
    }

    private MedicalReportRequestDTO buildMetadata(String reportName, String notes, String metadataJson) {
        if (metadataJson != null && !metadataJson.isBlank()) {
            try {
                return objectMapper.readValue(metadataJson, MedicalReportRequestDTO.class);
            } catch (Exception ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid metadata format", ex);
            }
        }

        if ((reportName == null || reportName.isBlank()) && (notes == null || notes.isBlank())) {
            return null;
        }

        MedicalReportRequestDTO dto = new MedicalReportRequestDTO();
        dto.setReportName(reportName);
        dto.setNotes(notes);
        return dto;
    }
}

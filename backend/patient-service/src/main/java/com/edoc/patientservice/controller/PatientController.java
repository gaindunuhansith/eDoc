package com.edoc.patientservice.controller;

import com.edoc.patientservice.dto.MedicalReportRequest;
import com.edoc.patientservice.dto.MedicalReportResponse;
import com.edoc.patientservice.dto.PatientCreateRequest;
import com.edoc.patientservice.dto.PatientResponse;
import com.edoc.patientservice.dto.PatientUpdateRequest;
import com.edoc.patientservice.dto.PrescriptionResponse;
import com.edoc.patientservice.entity.MedicalReport;
import com.edoc.patientservice.entity.Patient;
import com.edoc.patientservice.service.PatientService;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public PatientResponse registerPatient(@Valid @RequestBody PatientCreateRequest request) {
        Patient patient = new Patient();
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setAddress(request.getAddress());

        return toPatientResponse(patientService.registerPatient(patient));
    }

    @GetMapping("/{id}")
    public PatientResponse getPatient(@PathVariable Long id) {
        return toPatientResponse(patientService.getPatient(id));
    }

    @PutMapping("/{id}")
    public PatientResponse updatePatient(@PathVariable Long id, @Valid @RequestBody PatientUpdateRequest request) {
        Patient updates = new Patient();
        updates.setFirstName(request.getFirstName());
        updates.setLastName(request.getLastName());
        updates.setEmail(request.getEmail());
        updates.setPhone(request.getPhone());
        updates.setDateOfBirth(request.getDateOfBirth());
        updates.setAddress(request.getAddress());

        return toPatientResponse(patientService.updatePatient(id, updates));
    }

    @PostMapping("/{id}/reports")
    @ResponseStatus(HttpStatus.CREATED)
    public MedicalReportResponse addMedicalReport(@PathVariable Long id, @Valid @RequestBody MedicalReportRequest request) {
        MedicalReport report = new MedicalReport();
        report.setReportName(request.getReportName());
        report.setReportUrl(request.getReportUrl());
        report.setNotes(request.getNotes());

        return toMedicalReportResponse(patientService.addMedicalReport(id, report));
    }

    @GetMapping("/{id}/reports")
    public List<MedicalReportResponse> getMedicalReports(@PathVariable Long id) {
        return patientService.getMedicalReports(id).stream()
                .map(this::toMedicalReportResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}/prescriptions")
    public List<PrescriptionResponse> getPrescriptions(@PathVariable Long id) {
        return patientService.getPrescriptions(id);
    }

    private PatientResponse toPatientResponse(Patient patient) {
        PatientResponse response = new PatientResponse();
        response.setId(patient.getId());
        response.setFirstName(patient.getFirstName());
        response.setLastName(patient.getLastName());
        response.setEmail(patient.getEmail());
        response.setPhone(patient.getPhone());
        response.setDateOfBirth(patient.getDateOfBirth());
        response.setAddress(patient.getAddress());
        response.setCreatedAt(patient.getCreatedAt());
        return response;
    }

    private MedicalReportResponse toMedicalReportResponse(MedicalReport report) {
        MedicalReportResponse response = new MedicalReportResponse();
        response.setId(report.getId());
        if (report.getPatient() != null) {
            response.setPatientId(report.getPatient().getId());
        }
        response.setReportName(report.getReportName());
        response.setReportUrl(report.getReportUrl());
        response.setNotes(report.getNotes());
        response.setCreatedAt(report.getCreatedAt());
        return response;
    }
}

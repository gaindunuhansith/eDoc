package com.edoc.patientservice.mapper;

import com.edoc.patientservice.dto.report.MedicalReportResponseDTO;
import com.edoc.patientservice.entity.MedicalReport;
import org.springframework.stereotype.Component;

// Maps medical report entities to DTOs.
@Component
public class MedicalReportMapper {

    public MedicalReportResponseDTO toResponse(MedicalReport report) {
        MedicalReportResponseDTO response = new MedicalReportResponseDTO();
        response.setId(report.getId());
        if (report.getPatient() != null) {
            response.setPatientId(report.getPatient().getId());
        }
        response.setReportName(report.getReportName());
        // Do not expose server file paths in API responses.
        response.setNotes(report.getNotes());
        response.setCreatedAt(report.getCreatedAt());
        return response;
    }
}

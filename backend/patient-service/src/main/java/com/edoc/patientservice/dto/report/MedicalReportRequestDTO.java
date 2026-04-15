package com.edoc.patientservice.dto.report;

import jakarta.validation.constraints.Size;

// Metadata sent alongside a medical report file upload.
public class MedicalReportRequestDTO {

    @Size(max = 200)
    private String reportName;

    @Size(max = 2000)
    private String notes;

    public String getReportName() {
        return reportName;
    }

    public void setReportName(String reportName) {
        this.reportName = reportName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

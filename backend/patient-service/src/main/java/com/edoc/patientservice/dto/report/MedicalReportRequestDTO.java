package com.edoc.patientservice.dto.report;

import jakarta.validation.constraints.Size;

// Metadata sent alongside a medical report file upload.
public class MedicalReportRequestDTO {

    @Size(max = 200)
    private String reportName;

    @Size(max = 2000)
    private String notes;

    @Size(max = 100)
    private String reportType;

    @Size(max = 100)
    private String doctorId;

    @Size(max = 100)
    private String appointmentId;

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

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public String getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(String appointmentId) {
        this.appointmentId = appointmentId;
    }
}

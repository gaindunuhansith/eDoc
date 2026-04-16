package com.edoc.patientservice.dto.history;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

// Payload for creating a medical history entry.
public class MedicalHistoryRequestDTO {

    @NotBlank
    @Size(max = 200)
    private String condition;

    @Size(max = 200)
    private String diagnosis;

    private LocalDate visitDate;

    @Size(max = 4000)
    private String notes;

    // Cross-service reference IDs
    @Size(max = 100)
    private String doctorId;

    @Size(max = 100)
    private String appointmentId;

    @Size(max = 200)
    private String doctorNameSnapshot;

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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

    public String getDoctorNameSnapshot() {
        return doctorNameSnapshot;
    }

    public void setDoctorNameSnapshot(String doctorNameSnapshot) {
        this.doctorNameSnapshot = doctorNameSnapshot;
    }
}

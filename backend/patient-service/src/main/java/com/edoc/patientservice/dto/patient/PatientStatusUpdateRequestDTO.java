package com.edoc.patientservice.dto.patient;

import com.edoc.patientservice.entity.PatientStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// Payload to change patient account status with optional audit actor and reason.
public class PatientStatusUpdateRequestDTO {

    @NotNull
    private PatientStatus status;

    @Size(max = 500)
    private String reason;

    private Long actedBy;

    public PatientStatus getStatus() {
        return status;
    }

    public void setStatus(PatientStatus status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Long getActedBy() {
        return actedBy;
    }

    public void setActedBy(Long actedBy) {
        this.actedBy = actedBy;
    }
}
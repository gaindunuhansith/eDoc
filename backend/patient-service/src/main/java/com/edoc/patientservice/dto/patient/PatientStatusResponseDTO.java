package com.edoc.patientservice.dto.patient;

import com.edoc.patientservice.entity.PatientStatus;

// Minimal internal response used by other services to validate patient lifecycle state.
public class PatientStatusResponseDTO {

    private Long id;
    private PatientStatus status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PatientStatus getStatus() {
        return status;
    }

    public void setStatus(PatientStatus status) {
        this.status = status;
    }
}
package com.edoc.patientservice.dto.patient;

import java.util.UUID;

// Minimal internal response used by other services to validate patient lifecycle state.
public class PatientStatusResponseDTO {

    private UUID id;
    private boolean deleted;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }
}
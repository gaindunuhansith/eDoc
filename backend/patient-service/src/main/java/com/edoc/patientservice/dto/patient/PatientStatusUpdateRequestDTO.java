package com.edoc.patientservice.dto.patient;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

// Payload to change patient soft-deletion state with optional audit actor and reason.
// actedBy should be the acting party's internal patient-service UUID.
// For self-service endpoints (PATCH /patients/me/status) the service ignores this field
// and derives the actor from the authenticated JWT — do not pass it from the client.
public class PatientStatusUpdateRequestDTO {

    @NotNull
    private Boolean deleted;

    @Size(max = 500)
    private String reason;

    private UUID actedBy;

    public Boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public UUID getActedBy() {
        return actedBy;
    }

    public void setActedBy(UUID actedBy) {
        this.actedBy = actedBy;
    }
}
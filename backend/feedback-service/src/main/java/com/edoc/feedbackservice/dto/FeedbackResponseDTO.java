package com.edoc.feedbackservice.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class FeedbackResponseDTO {

    private UUID id;
    private UUID patientId;
    private String doctorId;
    private String appointmentId;
    private int rating;
    private String comment;
    private LocalDateTime timestamp;
    private LocalDateTime editableUntil;

    public FeedbackResponseDTO() {}

    public FeedbackResponseDTO(UUID id, UUID patientId, String doctorId, String appointmentId, int rating, String comment, LocalDateTime timestamp) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.appointmentId = appointmentId;
        this.rating = rating;
        this.comment = comment;
        this.timestamp = timestamp;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getAppointmentId() { return appointmentId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public LocalDateTime getEditableUntil() { return editableUntil; }
    public void setEditableUntil(LocalDateTime editableUntil) { this.editableUntil = editableUntil; }
}

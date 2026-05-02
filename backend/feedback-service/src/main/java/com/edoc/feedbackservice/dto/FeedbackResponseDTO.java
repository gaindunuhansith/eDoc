package com.edoc.feedbackservice.dto;

import java.time.LocalDateTime;

public class FeedbackResponseDTO {

    private Long id;
    private Long patientId;
    private String doctorId;
    private String appointmentId;
    private int rating;
    private String comment;
    private String patientName;
    private String doctorName;
    private LocalDateTime timestamp;
    private LocalDateTime editableUntil;
    private String status;

    public FeedbackResponseDTO() {}

    public FeedbackResponseDTO(Long id, Long patientId, String doctorId, String appointmentId, int rating, String comment, LocalDateTime timestamp, String status) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.appointmentId = appointmentId;
        this.rating = rating;
        this.comment = comment;
        this.timestamp = timestamp;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getAppointmentId() { return appointmentId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public LocalDateTime getEditableUntil() { return editableUntil; }
    public void setEditableUntil(LocalDateTime editableUntil) { this.editableUntil = editableUntil; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
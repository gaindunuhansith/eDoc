package com.edoc.feedbackservice.dto;

import java.time.LocalDateTime;

public class FeedbackResponseDTO {

    private Long id;
    private Long patientId;
    private Long doctorId;
    private Long appointmentId;
    private String telemedicineSessionId;
    private Integer rating;
    private String comment;
    private LocalDateTime submittedAt;
    private Boolean isVisible;

    // Constructors
    public FeedbackResponseDTO() {}

    public FeedbackResponseDTO(Long id, Long patientId, Long doctorId, Long appointmentId, String telemedicineSessionId, Integer rating, String comment, LocalDateTime submittedAt, Boolean isVisible) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.appointmentId = appointmentId;
        this.telemedicineSessionId = telemedicineSessionId;
        this.rating = rating;
        this.comment = comment;
        this.submittedAt = submittedAt;
        this.isVisible = isVisible;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getTelemedicineSessionId() {
        return telemedicineSessionId;
    }

    public void setTelemedicineSessionId(String telemedicineSessionId) {
        this.telemedicineSessionId = telemedicineSessionId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Boolean getIsVisible() {
        return isVisible;
    }

    public void setIsVisible(Boolean isVisible) {
        this.isVisible = isVisible;
    }
}
package com.edoc.feedbackservice.dto;

import jakarta.validation.constraints.*;

public class FeedbackRequestDTO {

    @NotNull
    private Long patientId;

    @NotNull
    private Long doctorId;

    private Long appointmentId;

    private String telemedicineSessionId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @Size(max = 500)
    private String comment;

    // Constructors
    public FeedbackRequestDTO() {}

    public FeedbackRequestDTO(Long patientId, Long doctorId, Long appointmentId, String telemedicineSessionId, Integer rating, String comment) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.appointmentId = appointmentId;
        this.telemedicineSessionId = telemedicineSessionId;
        this.rating = rating;
        this.comment = comment;
    }

    // Getters and Setters
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
}
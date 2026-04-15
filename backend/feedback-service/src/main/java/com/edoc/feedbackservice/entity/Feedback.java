package com.edoc.feedbackservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "patient_id")
    private Long patientId;

    @NotNull
    @Column(name = "doctor_id")
    private Long doctorId;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "telemedicine_session_id")
    private String telemedicineSessionId;

    @NotNull
    @Min(1)
    @Max(5)
    @Column(name = "rating")
    private Integer rating;

    @Size(max = 500)
    @Column(name = "comment")
    private String comment;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "is_visible")
    private Boolean isVisible = true;

    // Constructors
    public Feedback() {}

    public Feedback(Long patientId, Long doctorId, Long appointmentId, String telemedicineSessionId, Integer rating, String comment) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.appointmentId = appointmentId;
        this.telemedicineSessionId = telemedicineSessionId;
        this.rating = rating;
        this.comment = comment;
        this.submittedAt = LocalDateTime.now();
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
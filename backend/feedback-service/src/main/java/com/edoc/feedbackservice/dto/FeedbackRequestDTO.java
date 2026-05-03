package com.edoc.feedbackservice.dto;

import jakarta.validation.constraints.*;

public class FeedbackRequestDTO {

    @NotBlank(message = "Appointment ID is required")
    private String appointmentId;

    @NotBlank(message = "Doctor ID is required")
    private String doctorId;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private int rating;

    @Size(max = 500, message = "Comment must not exceed 500 characters")
    private String comment;

    public FeedbackRequestDTO() {}

    public FeedbackRequestDTO(String appointmentId, String doctorId, int rating, String comment) {
        this.appointmentId = appointmentId;
        this.doctorId = doctorId;
        this.rating = rating;
        this.comment = comment;
    }

    public String getAppointmentId() { return appointmentId; }
    public void setAppointmentId(String appointmentId) { this.appointmentId = appointmentId; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
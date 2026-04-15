package com.edoc.feedbackservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponseDTO {

    private Long id;
    private Long patientId;
    private Long doctorId;
    private Long appointmentId;
    private int rating;
    private String comment;
    private LocalDateTime timestamp;
    private String status;
}
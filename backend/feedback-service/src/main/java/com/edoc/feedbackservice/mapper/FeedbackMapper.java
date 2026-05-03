package com.edoc.feedbackservice.mapper;

import com.edoc.feedbackservice.dto.FeedbackRequestDTO;
import com.edoc.feedbackservice.dto.FeedbackResponseDTO;
import com.edoc.feedbackservice.entity.Feedback;
import org.springframework.stereotype.Component;

@Component
public class FeedbackMapper {

    public Feedback toEntity(FeedbackRequestDTO dto, Long patientId) {
        Feedback feedback = new Feedback();
        feedback.setPatientId(patientId);
        feedback.setDoctorId(dto.getDoctorId());
        feedback.setAppointmentId(dto.getAppointmentId());
        feedback.setRating(dto.getRating());
        feedback.setComment(dto.getComment());
        feedback.setTimestamp(java.time.LocalDateTime.now());
        feedback.setEditableUntil(java.time.LocalDateTime.now().plusHours(24));
        return feedback;
    }

    public FeedbackResponseDTO toResponseDTO(Feedback feedback) {
        FeedbackResponseDTO dto = new FeedbackResponseDTO(
                feedback.getId(),
                feedback.getPatientId(),
                feedback.getDoctorId(),
                feedback.getAppointmentId(),
                feedback.getRating(),
                feedback.getComment(),
                feedback.getTimestamp()
        );
        dto.setEditableUntil(feedback.getEditableUntil());
        return dto;
    }
}
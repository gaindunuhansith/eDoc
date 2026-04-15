package com.edoc.feedbackservice.service;

import com.edoc.feedbackservice.dto.FeedbackRequestDTO;
import com.edoc.feedbackservice.dto.FeedbackResponseDTO;
import com.edoc.feedbackservice.entity.Feedback;
import com.edoc.feedbackservice.exception.FeedbackNotFoundException;
import com.edoc.feedbackservice.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    public FeedbackResponseDTO submitFeedback(FeedbackRequestDTO request) {
        Feedback feedback = new Feedback(
                request.getPatientId(),
                request.getDoctorId(),
                request.getAppointmentId(),
                request.getTelemedicineSessionId(),
                request.getRating(),
                request.getComment()
        );
        feedback = feedbackRepository.save(feedback);
        return mapToResponseDTO(feedback);
    }

    public List<FeedbackResponseDTO> getFeedbackForDoctor(Long doctorId) {
        List<Feedback> feedbacks = feedbackRepository.findByDoctorIdAndIsVisibleTrue(doctorId);
        return feedbacks.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    public List<FeedbackResponseDTO> getAllFeedback() {
        List<Feedback> feedbacks = feedbackRepository.findByIsVisibleTrue();
        return feedbacks.stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    public FeedbackResponseDTO getFeedbackById(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new FeedbackNotFoundException("Feedback not found with id: " + id));
        return mapToResponseDTO(feedback);
    }

    public FeedbackResponseDTO updateVisibility(Long id, Boolean isVisible) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new FeedbackNotFoundException("Feedback not found with id: " + id));
        feedback.setIsVisible(isVisible);
        feedback = feedbackRepository.save(feedback);
        return mapToResponseDTO(feedback);
    }

    public void deleteFeedback(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new FeedbackNotFoundException("Feedback not found with id: " + id);
        }
        feedbackRepository.deleteById(id);
    }

    private FeedbackResponseDTO mapToResponseDTO(Feedback feedback) {
        return new FeedbackResponseDTO(
                feedback.getId(),
                feedback.getPatientId(),
                feedback.getDoctorId(),
                feedback.getAppointmentId(),
                feedback.getTelemedicineSessionId(),
                feedback.getRating(),
                feedback.getComment(),
                feedback.getSubmittedAt(),
                feedback.getIsVisible()
        );
    }
}
package com.edoc.feedbackservice.service;

import com.edoc.feedbackservice.dto.FeedbackRequestDTO;
import com.edoc.feedbackservice.dto.FeedbackResponseDTO;
import com.edoc.feedbackservice.entity.Feedback;
import com.edoc.feedbackservice.exception.FeedbackNotFoundException;
import com.edoc.feedbackservice.mapper.FeedbackMapper;
import com.edoc.feedbackservice.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final FeedbackMapper feedbackMapper;

    @Autowired
    public FeedbackService(FeedbackRepository feedbackRepository, FeedbackMapper feedbackMapper) {
        this.feedbackRepository = feedbackRepository;
        this.feedbackMapper = feedbackMapper;
    }

    public FeedbackResponseDTO submitFeedback(FeedbackRequestDTO request, Long patientId) {
        Feedback feedback = feedbackMapper.toEntity(request, patientId);
        Feedback saved = feedbackRepository.save(feedback);
        return feedbackMapper.toResponseDTO(saved);
    }

    public List<FeedbackResponseDTO> getFeedbackForDoctor(Long doctorId) {
        return feedbackRepository.findByDoctorId(doctorId)
                .stream()
                .map(feedbackMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<FeedbackResponseDTO> getFeedbackForPatient(Long patientId) {
        return feedbackRepository.findByPatientId(patientId)
                .stream()
                .map(feedbackMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<FeedbackResponseDTO> getFeedbackForAppointment(Long appointmentId) {
        return feedbackRepository.findByAppointmentId(appointmentId)
                .stream()
                .map(feedbackMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public FeedbackResponseDTO getFeedbackById(Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new FeedbackNotFoundException("Feedback not found"));
        return feedbackMapper.toResponseDTO(feedback);
    }

    public FeedbackResponseDTO updateFeedback(Long id, FeedbackRequestDTO request) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new FeedbackNotFoundException("Feedback not found"));
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());
        Feedback updated = feedbackRepository.save(feedback);
        return feedbackMapper.toResponseDTO(updated);
    }

    public void deleteFeedback(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new FeedbackNotFoundException("Feedback not found");
        }
        feedbackRepository.deleteById(id);
    }
}
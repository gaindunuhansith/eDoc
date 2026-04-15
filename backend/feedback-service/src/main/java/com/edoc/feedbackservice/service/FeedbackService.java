package com.edoc.feedbackservice.service;

import com.edoc.feedbackservice.dto.FeedbackRequestDTO;
import com.edoc.feedbackservice.dto.FeedbackResponseDTO;
import com.edoc.feedbackservice.entity.Feedback;
import com.edoc.feedbackservice.exception.FeedbackNotFoundException;
import com.edoc.feedbackservice.mapper.FeedbackMapper;
import com.edoc.feedbackservice.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final FeedbackMapper feedbackMapper;
    private final RestTemplate restTemplate;

    // Assume these are injected from config
    private final String appointmentServiceUrl = "http://localhost:8081";
    private final String doctorServiceUrl = "http://localhost:8082";
    private final String patientServiceUrl = "http://localhost:8084";
    private final String notificationServiceUrl = "http://localhost:8083";

    @Autowired
    public FeedbackService(FeedbackRepository feedbackRepository, FeedbackMapper feedbackMapper, RestTemplate restTemplate) {
        this.feedbackRepository = feedbackRepository;
        this.feedbackMapper = feedbackMapper;
        this.restTemplate = restTemplate;
    }

    public FeedbackResponseDTO submitFeedback(FeedbackRequestDTO request, Long patientId) {
        // Validate appointment exists (call appointment-service)
        // For now, assume valid; in real, call restTemplate.getForObject(appointmentServiceUrl + "/api/appointments/" + request.getAppointmentId(), ...)

        // Get doctorId from appointment
        Long doctorId = getDoctorIdFromAppointment(request.getAppointmentId());

        Feedback feedback = feedbackMapper.toEntity(request, patientId, doctorId);
        Feedback saved = feedbackRepository.save(feedback);

        // Notify doctor via notification-service
        sendNotification(doctorId, "New feedback received");

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

    private Long getDoctorIdFromAppointment(Long appointmentId) {
        // Mock: in real, call appointment-service
        return 1L; // Placeholder
    }

    private void sendNotification(Long doctorId, String message) {
        // Call notification-service
        // restTemplate.postForObject(notificationServiceUrl + "/api/notifications", ...);
    }
}
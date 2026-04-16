package com.edoc.feedbackservice.service;

import com.edoc.feedbackservice.client.AppointmentServiceClient;
import com.edoc.feedbackservice.client.NotificationServiceClient;
import com.edoc.feedbackservice.client.UserServiceClient;
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
    private final AppointmentServiceClient appointmentServiceClient;
    private final NotificationServiceClient notificationServiceClient;
    private final UserServiceClient userServiceClient;

    @Autowired
    public FeedbackService(FeedbackRepository feedbackRepository, FeedbackMapper feedbackMapper,
                          AppointmentServiceClient appointmentServiceClient,
                          NotificationServiceClient notificationServiceClient,
                          UserServiceClient userServiceClient) {
        this.feedbackRepository = feedbackRepository;
        this.feedbackMapper = feedbackMapper;
        this.appointmentServiceClient = appointmentServiceClient;
        this.notificationServiceClient = notificationServiceClient;
        this.userServiceClient = userServiceClient;
    }

    public FeedbackResponseDTO submitFeedback(FeedbackRequestDTO request, Long patientId, String authHeader) {
        // Validate appointment exists and patient is authorized
        AppointmentServiceClient.AppointmentDTO appointment = appointmentServiceClient.getAppointment(request.getAppointmentId(), authHeader);

        if (appointment == null) {
            throw new RuntimeException("Appointment not found");
        }

        if (!appointment.getPatientId().equals(patientId)) {
            throw new RuntimeException("Patient not authorized for this appointment");
        }

        // Save feedback
        Feedback feedback = feedbackMapper.toEntity(request, patientId);
        Feedback saved = feedbackRepository.save(feedback);

        // Send notification to doctor asynchronously
        sendFeedbackNotification(saved, authHeader);

        return feedbackMapper.toResponseDTO(saved);
    }

    private void sendFeedbackNotification(Feedback feedback, String authHeader) {
        try {
            // Get doctor details
            UserServiceClient.UserDTO doctor = userServiceClient.getUserById(feedback.getDoctorId(), authHeader);

            String subject = "New Feedback Received";
            String body = String.format("Dear Dr. %s %s,\n\nYou have received new feedback from a patient.\nRating: %d/5\nComment: %s\n\nBest regards,\neDoc Team",
                    doctor.getFirstName(), doctor.getLastName(), feedback.getRating(), feedback.getComment());

            notificationServiceClient.sendEmail(doctor.getEmail(), subject, body, authHeader);
        } catch (Exception error) {
            System.err.println("Failed to send feedback notification: " + error.getMessage());
        }
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
package com.edoc.feedbackservice.service;

import com.edoc.feedbackservice.client.AppointmentServiceClient;
import com.edoc.feedbackservice.client.DoctorServiceClient;
import com.edoc.feedbackservice.client.NotificationServiceClient;
import com.edoc.feedbackservice.client.PatientServiceClient;
import com.edoc.feedbackservice.dto.FeedbackRequestDTO;
import com.edoc.feedbackservice.dto.FeedbackResponseDTO;
import com.edoc.feedbackservice.dto.UpdateFeedbackRequestDTO;
import com.edoc.feedbackservice.entity.Feedback;
import com.edoc.feedbackservice.exception.FeedbackNotFoundException;
import com.edoc.feedbackservice.mapper.FeedbackMapper;
import com.edoc.feedbackservice.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final FeedbackMapper feedbackMapper;
    private final AppointmentServiceClient appointmentServiceClient;
    private final NotificationServiceClient notificationServiceClient;
    private final PatientServiceClient patientServiceClient;
    private final DoctorServiceClient doctorServiceClient;

    @Autowired
    public FeedbackService(FeedbackRepository feedbackRepository, FeedbackMapper feedbackMapper,
                          AppointmentServiceClient appointmentServiceClient,
                          NotificationServiceClient notificationServiceClient,
                          PatientServiceClient patientServiceClient,
                          DoctorServiceClient doctorServiceClient) {
        this.feedbackRepository = feedbackRepository;
        this.feedbackMapper = feedbackMapper;
        this.appointmentServiceClient = appointmentServiceClient;
        this.notificationServiceClient = notificationServiceClient;
        this.patientServiceClient = patientServiceClient;
        this.doctorServiceClient = doctorServiceClient;
    }

    @Transactional
    public FeedbackResponseDTO submitFeedback(FeedbackRequestDTO request, String authHeader) {

        UUID patientId = resolveCurrentPatientId(authHeader);

        AppointmentServiceClient.AppointmentDTO appointment = appointmentServiceClient.getAppointment(request.getAppointmentId(), authHeader);

        if (appointment == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found");
        }

        if (!appointment.getPatientId().equals(String.valueOf(patientId))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Patient not authorized for this appointment");
        }

        if (!appointment.getDoctorId().equals(request.getDoctorId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor does not match the appointment");
        }

        if (!"COMPLETED".equalsIgnoreCase(appointment.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Feedback can only be submitted for completed appointments");
        }

        if (feedbackRepository.existsByPatientIdAndAppointmentId(patientId, request.getAppointmentId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Feedback already exists for this appointment");
        }

        Feedback feedback = feedbackMapper.toEntity(request, patientId);
        Feedback saved = feedbackRepository.save(feedback);


        sendFeedbackNotification(saved, authHeader);

        return feedbackMapper.toResponseDTO(saved);
    }

    private UUID resolveCurrentPatientId(String authHeader) {
        PatientServiceClient.PatientDTO patient = patientServiceClient.getMyPatientProfile(authHeader);
        if (patient == null || patient.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated patient profile not found");
        }
        return patient.getId();
    }

    private void sendFeedbackNotification(Feedback feedback, String authHeader) {
        try {
            Map<String, Object> data = new HashMap<>();
            data.put("rating", feedback.getRating());
            data.put("comment", feedback.getComment());
            // Use the doctorId path so notification-service resolves the doctor's contact via doctor-service.
            notificationServiceClient.sendToDoctor("FEEDBACK_RECEIVED", feedback.getDoctorId().toString(), data, authHeader);
        } catch (Exception error) {
            System.err.println("Failed to send feedback notification: " + error.getMessage());
        }
    }

    public List<FeedbackResponseDTO> getAllFeedback() {
        return feedbackRepository.findAll()
                .stream()
                .map(feedbackMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<FeedbackResponseDTO> getFeedbackForDoctor(String doctorId) {
        return feedbackRepository.findByDoctorId(doctorId)
                .stream()
                .map(feedbackMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<FeedbackResponseDTO> getFeedbackForCurrentDoctor(String authHeader) {
        DoctorServiceClient.DoctorDTO doctor = doctorServiceClient.getMyDoctorProfile(authHeader);
        if (doctor == null || doctor.getId() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated doctor profile not found");
        }
        return getFeedbackForDoctor(doctor.getId());
    }

    public List<FeedbackResponseDTO> getFeedbackForPatient(UUID patientId) {
        return feedbackRepository.findByPatientId(patientId)
                .stream()
                .map(feedbackMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<FeedbackResponseDTO> getFeedbackForCurrentPatient(String authHeader) {
        return getFeedbackForPatient(resolveCurrentPatientId(authHeader));
    }

    public List<FeedbackResponseDTO> getFeedbackForAppointment(String appointmentId) {
        return feedbackRepository.findByAppointmentId(appointmentId)
                .stream()
                .map(feedbackMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public FeedbackResponseDTO getFeedbackById(UUID id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new FeedbackNotFoundException("Feedback not found"));
        return feedbackMapper.toResponseDTO(feedback);
    }

    @Transactional
    public FeedbackResponseDTO updateFeedback(UUID id, UpdateFeedbackRequestDTO request, String authHeader) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new FeedbackNotFoundException("Feedback not found"));
        UUID patientId = resolveCurrentPatientId(authHeader);
        if (!feedback.getPatientId().equals(patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own feedback");
        }
        if (feedback.getEditableUntil() == null || LocalDateTime.now().isAfter(feedback.getEditableUntil())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Edit window has expired. Feedback can only be edited within 24 hours of submission.");
        }
        feedback.setRating(request.getRating());
        feedback.setComment(request.getComment());
        Feedback updated = feedbackRepository.save(feedback);
        return feedbackMapper.toResponseDTO(updated);
    }

    @Transactional
    public void deleteFeedback(UUID id, String authHeader) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new FeedbackNotFoundException("Feedback not found"));
        UUID patientId = resolveCurrentPatientId(authHeader);
        if (!feedback.getPatientId().equals(patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own feedback");
        }
        if (feedback.getEditableUntil() == null || LocalDateTime.now().isAfter(feedback.getEditableUntil())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Delete window has expired. Feedback can only be deleted within 24 hours of submission.");
        }
        feedbackRepository.deleteById(id);
    }
}
package com.edoc.feedbackservice.service;

import com.edoc.feedbackservice.client.AppointmentServiceClient;
import com.edoc.feedbackservice.client.NotificationServiceClient;
import com.edoc.feedbackservice.client.PatientServiceClient;
import com.edoc.feedbackservice.dto.FeedbackRequestDTO;
import com.edoc.feedbackservice.dto.FeedbackResponseDTO;
import com.edoc.feedbackservice.entity.Feedback;
import com.edoc.feedbackservice.exception.FeedbackNotFoundException;
import com.edoc.feedbackservice.mapper.FeedbackMapper;
import com.edoc.feedbackservice.repository.FeedbackRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FeedbackServiceTest {

    private static final UUID PATIENT_UUID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID FEEDBACK_UUID = UUID.fromString("00000000-0000-0000-0000-000000000002");

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private FeedbackMapper feedbackMapper;

    @Mock
    private AppointmentServiceClient appointmentServiceClient;

    @Mock
    private NotificationServiceClient notificationServiceClient;

    @Mock
    private PatientServiceClient patientServiceClient;

    @InjectMocks
    private FeedbackService feedbackService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void submitFeedback_shouldSaveAndReturnResponse() {
        FeedbackRequestDTO request = new FeedbackRequestDTO("1", "2", 5, "Good");
        Feedback feedback = new Feedback();
        FeedbackResponseDTO response = new FeedbackResponseDTO();

        // Mock appointment validation
        AppointmentServiceClient.AppointmentDTO appointmentDTO = new AppointmentServiceClient.AppointmentDTO();
        appointmentDTO.setPatientId(PATIENT_UUID.toString());
        appointmentDTO.setDoctorId("2");
        appointmentDTO.setStatus("COMPLETED");
        when(appointmentServiceClient.getAppointment("1", "Bearer token")).thenReturn(appointmentDTO);

        PatientServiceClient.PatientDTO patientDTO = new PatientServiceClient.PatientDTO();
        patientDTO.setId(PATIENT_UUID);
        when(patientServiceClient.getMyPatientProfile("Bearer token")).thenReturn(patientDTO);

        when(feedbackRepository.existsByPatientIdAndAppointmentId(PATIENT_UUID, "1")).thenReturn(false);

        when(feedbackMapper.toEntity(request, PATIENT_UUID)).thenReturn(feedback);
        when(feedbackRepository.save(feedback)).thenReturn(feedback);
        when(feedbackMapper.toResponseDTO(feedback)).thenReturn(response);

        FeedbackResponseDTO result = feedbackService.submitFeedback(request, "Bearer token");

        assertNotNull(result);
        verify(feedbackRepository).save(feedback);
    }

    @Test
    void getFeedbackById_shouldReturnFeedback() {
        Feedback feedback = new Feedback();
        FeedbackResponseDTO response = new FeedbackResponseDTO();

        when(feedbackRepository.findById(FEEDBACK_UUID)).thenReturn(Optional.of(feedback));
        when(feedbackMapper.toResponseDTO(feedback)).thenReturn(response);

        FeedbackResponseDTO result = feedbackService.getFeedbackById(FEEDBACK_UUID);

        assertNotNull(result);
    }

    @Test
    void getFeedbackById_shouldThrowExceptionWhenNotFound() {
        when(feedbackRepository.findById(FEEDBACK_UUID)).thenReturn(Optional.empty());

        assertThrows(FeedbackNotFoundException.class, () -> feedbackService.getFeedbackById(FEEDBACK_UUID));
    }
}
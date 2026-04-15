package com.edoc.feedbackservice.service;

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
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class FeedbackServiceTest {

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private FeedbackMapper feedbackMapper;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private FeedbackService feedbackService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void submitFeedback_shouldSaveAndReturnResponse() {
        FeedbackRequestDTO request = new FeedbackRequestDTO(1L, 5, "Good");
        Feedback feedback = new Feedback();
        FeedbackResponseDTO response = new FeedbackResponseDTO();

        when(feedbackMapper.toEntity(request, 1L, 1L)).thenReturn(feedback);
        when(feedbackRepository.save(feedback)).thenReturn(feedback);
        when(feedbackMapper.toResponseDTO(feedback)).thenReturn(response);

        FeedbackResponseDTO result = feedbackService.submitFeedback(request, 1L);

        assertNotNull(result);
        verify(feedbackRepository).save(feedback);
    }

    @Test
    void getFeedbackById_shouldReturnFeedback() {
        Feedback feedback = new Feedback();
        FeedbackResponseDTO response = new FeedbackResponseDTO();

        when(feedbackRepository.findById(1L)).thenReturn(Optional.of(feedback));
        when(feedbackMapper.toResponseDTO(feedback)).thenReturn(response);

        FeedbackResponseDTO result = feedbackService.getFeedbackById(1L);

        assertNotNull(result);
    }

    @Test
    void getFeedbackById_shouldThrowExceptionWhenNotFound() {
        when(feedbackRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(FeedbackNotFoundException.class, () -> feedbackService.getFeedbackById(1L));
    }
}
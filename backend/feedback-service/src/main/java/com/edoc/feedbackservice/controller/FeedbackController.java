package com.edoc.feedbackservice.controller;

import com.edoc.feedbackservice.dto.FeedbackRequestDTO;
import com.edoc.feedbackservice.dto.FeedbackResponseDTO;
import com.edoc.feedbackservice.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<FeedbackResponseDTO> submitFeedback(@Valid @RequestBody FeedbackRequestDTO request) {
        FeedbackResponseDTO response = feedbackService.submitFeedback(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<FeedbackResponseDTO>> getMyFeedback(@RequestParam Long doctorId) {
        List<FeedbackResponseDTO> feedbacks = feedbackService.getFeedbackForDoctor(doctorId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping
    public ResponseEntity<List<FeedbackResponseDTO>> getAllFeedback() {
        List<FeedbackResponseDTO> feedbacks = feedbackService.getAllFeedback();
        return ResponseEntity.ok(feedbacks);
    }

    @PutMapping("/{id}/visibility")
    public ResponseEntity<FeedbackResponseDTO> updateVisibility(@PathVariable Long id, @RequestParam Boolean isVisible) {
        FeedbackResponseDTO response = feedbackService.updateVisibility(id, isVisible);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/internal/{appointmentId}")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackByAppointment(@PathVariable Long appointmentId) {
        // For internal use, return feedbacks for the appointment
        List<FeedbackResponseDTO> feedbacks = feedbackService.getAllFeedback().stream()
                .filter(f -> appointmentId.equals(f.getAppointmentId()))
                .toList();
        return ResponseEntity.ok(feedbacks);
    }
}
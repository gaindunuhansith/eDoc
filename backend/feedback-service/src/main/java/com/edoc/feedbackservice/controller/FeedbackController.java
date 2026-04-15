package com.edoc.feedbackservice.controller;

import com.edoc.feedbackservice.dto.FeedbackRequestDTO;
import com.edoc.feedbackservice.dto.FeedbackResponseDTO;
import com.edoc.feedbackservice.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Autowired
    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/submit")
    public ResponseEntity<FeedbackResponseDTO> submitFeedback(@Valid @RequestBody FeedbackRequestDTO request,
                                                              @RequestHeader("userId") Long patientId) {
        FeedbackResponseDTO response = feedbackService.submitFeedback(request, patientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackForDoctor(@PathVariable Long doctorId) {
        List<FeedbackResponseDTO> feedbacks = feedbackService.getFeedbackForDoctor(doctorId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackForPatient(@PathVariable Long patientId) {
        List<FeedbackResponseDTO> feedbacks = feedbackService.getFeedbackForPatient(patientId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeedbackResponseDTO> getFeedbackById(@PathVariable Long id) {
        FeedbackResponseDTO feedback = feedbackService.getFeedbackById(id);
        return ResponseEntity.ok(feedback);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<FeedbackResponseDTO> updateFeedback(@PathVariable Long id,
                                                              @Valid @RequestBody FeedbackRequestDTO request) {
        FeedbackResponseDTO updated = feedbackService.updateFeedback(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }
}
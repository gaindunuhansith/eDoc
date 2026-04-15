package com.edoc.feedbackservice.controller;

import com.edoc.feedbackservice.dto.FeedbackRequestDTO;
import com.edoc.feedbackservice.dto.FeedbackResponseDTO;
import com.edoc.feedbackservice.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping("/submit")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<FeedbackResponseDTO> submitFeedback(@Valid @RequestBody FeedbackRequestDTO request,
                                                              @RequestHeader("userId") Long patientId) {
        FeedbackResponseDTO response = feedbackService.submitFeedback(request, patientId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackForDoctor(@PathVariable Long doctorId) {
        List<FeedbackResponseDTO> feedbacks = feedbackService.getFeedbackForDoctor(doctorId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackForPatient(@PathVariable Long patientId) {
        List<FeedbackResponseDTO> feedbacks = feedbackService.getFeedbackForPatient(patientId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT') or hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<FeedbackResponseDTO> getFeedbackById(@PathVariable Long id) {
        FeedbackResponseDTO feedback = feedbackService.getFeedbackById(id);
        return ResponseEntity.ok(feedback);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<FeedbackResponseDTO> updateFeedback(@PathVariable Long id,
                                                              @Valid @RequestBody FeedbackRequestDTO request) {
        FeedbackResponseDTO updated = feedbackService.updateFeedback(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }
}
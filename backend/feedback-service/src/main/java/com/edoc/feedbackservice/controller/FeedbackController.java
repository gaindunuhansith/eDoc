package com.edoc.feedbackservice.controller;

import com.edoc.feedbackservice.dto.FeedbackRequestDTO;
import com.edoc.feedbackservice.dto.FeedbackResponseDTO;
import com.edoc.feedbackservice.dto.UpdateFeedbackRequestDTO;
import com.edoc.feedbackservice.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @Autowired
    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/submit")
    public ResponseEntity<FeedbackResponseDTO> submitFeedback(@Valid @RequestBody FeedbackRequestDTO request,
                                                              @AuthenticationPrincipal Jwt jwt) {
        // patientId is resolved securely from the validated JWT via Spring Security Context
        String authHeader = "Bearer " + jwt.getTokenValue();
        FeedbackResponseDTO response = feedbackService.submitFeedback(request, authHeader);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<FeedbackResponseDTO>> getAllFeedback(@AuthenticationPrincipal Jwt jwt) {
        String authHeader = "Bearer " + jwt.getTokenValue();
        List<FeedbackResponseDTO> feedbacks = feedbackService.getAllFeedback(authHeader);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackForDoctor(@PathVariable String doctorId) {
        List<FeedbackResponseDTO> feedbacks = feedbackService.getFeedbackForDoctor(doctorId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/doctor/me")
    public ResponseEntity<List<FeedbackResponseDTO>> getMyDoctorFeedback(@AuthenticationPrincipal Jwt jwt) {
        // doctorId is resolved securely from the validated JWT via Spring Security Context
        String authHeader = "Bearer " + jwt.getTokenValue();
        List<FeedbackResponseDTO> feedbacks = feedbackService.getFeedbackForCurrentDoctor(authHeader);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackForPatient(@PathVariable UUID patientId) {
        List<FeedbackResponseDTO> feedbacks = feedbackService.getFeedbackForPatient(patientId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/patient/me")
    public ResponseEntity<List<FeedbackResponseDTO>> getMyFeedback(@AuthenticationPrincipal Jwt jwt) {
        // patientId is resolved securely from the validated JWT via Spring Security Context
        String authHeader = "Bearer " + jwt.getTokenValue();
        List<FeedbackResponseDTO> feedbacks = feedbackService.getFeedbackForCurrentPatient(authHeader);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackForAppointment(@PathVariable String appointmentId) {
        List<FeedbackResponseDTO> feedbacks = feedbackService.getFeedbackForAppointment(appointmentId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeedbackResponseDTO> getFeedbackById(@PathVariable UUID id) {
        FeedbackResponseDTO feedback = feedbackService.getFeedbackById(id);
        return ResponseEntity.ok(feedback);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<FeedbackResponseDTO> updateFeedback(@PathVariable UUID id,
                                                              @Valid @RequestBody UpdateFeedbackRequestDTO request,
                                                              @AuthenticationPrincipal Jwt jwt) {
        // patientId is resolved securely from the validated JWT via Spring Security Context
        String authHeader = "Bearer " + jwt.getTokenValue();
        FeedbackResponseDTO updated = feedbackService.updateFeedback(id, request, authHeader);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable UUID id,
                                               @AuthenticationPrincipal Jwt jwt) {
        // patientId is resolved securely from the validated JWT via Spring Security Context
        String authHeader = "Bearer " + jwt.getTokenValue();
        feedbackService.deleteFeedback(id, authHeader);
        return ResponseEntity.noContent().build();
    }
}
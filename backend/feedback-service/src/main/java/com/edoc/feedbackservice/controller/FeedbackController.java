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
                                                              @RequestParam Long patientId,
                                                              @RequestHeader("Authorization") String authHeader) {
        FeedbackResponseDTO response = feedbackService.submitFeedback(request, patientId, authHeader);
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

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackForAppointment(@PathVariable Long appointmentId) {
        List<FeedbackResponseDTO> feedbacks = feedbackService.getFeedbackForAppointment(appointmentId);
        return ResponseEntity.ok(feedbacks);
    }

    // Internal endpoints for cross-service communication
    @GetMapping("/internal/doctor/{doctorId}")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackForDoctorInternal(@PathVariable Long doctorId,
                                                                                   @RequestHeader("Authorization") String authHeader) {
        List<FeedbackResponseDTO> feedbacks = feedbackService.getFeedbackForDoctor(doctorId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/internal/patient/{patientId}")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackForPatientInternal(@PathVariable Long patientId,
                                                                                    @RequestHeader("Authorization") String authHeader) {
        List<FeedbackResponseDTO> feedbacks = feedbackService.getFeedbackForPatient(patientId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/internal/appointment/{appointmentId}")
    public ResponseEntity<List<FeedbackResponseDTO>> getFeedbackForAppointmentInternal(@PathVariable Long appointmentId,
                                                                                        @RequestHeader("Authorization") String authHeader) {
        List<FeedbackResponseDTO> feedbacks = feedbackService.getFeedbackForAppointment(appointmentId);
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
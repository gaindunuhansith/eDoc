package com.edoc.telemedicineservice.controller;

import com.edoc.telemedicineservice.dto.VideoSessionRequest;
import com.edoc.telemedicineservice.model.VideoSession;
import com.edoc.telemedicineservice.service.TelemedicineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/telemedicine")
public class TelemedicineController {

    private final TelemedicineService telemedicineService;

    public TelemedicineController(TelemedicineService telemedicineService) {
        this.telemedicineService = telemedicineService;
    }

    /**
     * Create a video session associated with an appointment.
     */
    @PostMapping("/sessions")
    public ResponseEntity<VideoSession> createSession(@RequestBody VideoSessionRequest request) {
        VideoSession session = telemedicineService.createSession(
                request.getAppointmentId(),
                request.getDoctorId(),
                request.getPatientId()
        );
        return ResponseEntity.ok(session);
    }

    /**
     * Generate an access token for a doctor or patient to join a specific appointment room.
     */
    @GetMapping("/sessions/{appointmentId}/token")
    public ResponseEntity<String> getJoinToken(
            @PathVariable String appointmentId,
            @RequestParam String userId) {
        String token = telemedicineService.generateJoinToken(appointmentId, userId);
        return ResponseEntity.ok(token);
    }

    /**
     * Start the video session (Called when someone enters the room)
     */
    @PutMapping("/sessions/{appointmentId}/start")
    public ResponseEntity<VideoSession> startSession(@PathVariable String appointmentId) {
        VideoSession session = telemedicineService.startSession(appointmentId);
        return ResponseEntity.ok(session);
    }

    /**
     * Complete the video session (Called when the call drops/ends)
     */
    @PutMapping("/sessions/{appointmentId}/complete")
    public ResponseEntity<VideoSession> endSession(@PathVariable String appointmentId) {
        VideoSession session = telemedicineService.endSession(appointmentId);
        return ResponseEntity.ok(session);
    }
}

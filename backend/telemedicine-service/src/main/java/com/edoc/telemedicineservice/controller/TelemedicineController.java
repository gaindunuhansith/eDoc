package com.edoc.telemedicineservice.controller;

import com.edoc.telemedicineservice.dto.VideoSessionRequest;
import com.edoc.telemedicineservice.model.VideoSession;
import com.edoc.telemedicineservice.service.TelemedicineService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/telemedicine")
public class TelemedicineController {

    private final TelemedicineService telemedicineService;

    public TelemedicineController(TelemedicineService telemedicineService) {
        this.telemedicineService = telemedicineService;
    }

    @PostMapping("/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<VideoSession> createSession(@RequestBody VideoSessionRequest request,
                                                     @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        VideoSession session = telemedicineService.createSession(
                request.getAppointmentId(),
                request.getDoctorId(),
                request.getPatientId(),
                authorizationHeader
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }

    @GetMapping("/sessions")
    public ResponseEntity<java.util.List<VideoSession>> getAllSessions(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        java.util.List<VideoSession> sessions = telemedicineService.getAllSessions(authorizationHeader);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/sessions/{appointmentId}")
    public ResponseEntity<VideoSession> getSession(@PathVariable String appointmentId) {
        return ResponseEntity.ok(telemedicineService.getSession(appointmentId));
    }

    @GetMapping("/sessions/{appointmentId}/token")
    public ResponseEntity<String> getJoinToken(
            @PathVariable String appointmentId,
            @RequestParam String userId) {
        String token = telemedicineService.generateJoinToken(appointmentId, userId);
        return ResponseEntity.ok(token);
    }

    @PutMapping("/sessions/{appointmentId}/start")
    public ResponseEntity<VideoSession> startSession(@PathVariable String appointmentId,
                                                    @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        VideoSession session = telemedicineService.startSession(appointmentId, authorizationHeader);
        return ResponseEntity.ok(session);
    }

    @PutMapping("/sessions/{appointmentId}/complete")
    public ResponseEntity<VideoSession> endSession(@PathVariable String appointmentId,
                                                  @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        VideoSession session = telemedicineService.endSession(appointmentId, authorizationHeader);
        return ResponseEntity.ok(session);
    }

    @DeleteMapping("/sessions/{appointmentId}")
    public ResponseEntity<Void> deleteSession(@PathVariable String appointmentId) {
        telemedicineService.deleteSession(appointmentId);
        return ResponseEntity.noContent().build();
    }
}

package com.edoc.telemedicineservice.controller;

import com.edoc.telemedicineservice.dto.VideoSessionRequest;
import com.edoc.telemedicineservice.dto.SessionTokenResponse;
import com.edoc.telemedicineservice.model.VideoSession;
import com.edoc.telemedicineservice.service.TelemedicineService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
                                                     @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
                                                     @AuthenticationPrincipal Jwt jwt) {
        VideoSession session = telemedicineService.createSession(
                request.getAppointmentId(),
                request.getDoctorId(),
                request.getPatientId(),
                authorizationHeader,
                getRole(jwt),
                getUid(jwt)
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }

    @GetMapping("/sessions")
    public ResponseEntity<java.util.List<VideoSession>> getAllSessions(
            @AuthenticationPrincipal Jwt jwt) {
        java.util.List<VideoSession> sessions = telemedicineService.getAllSessions(getRole(jwt), getUid(jwt));
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/sessions/{appointmentId}")
    public ResponseEntity<VideoSession> getSession(@PathVariable String appointmentId,
                                                   @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(telemedicineService.getSession(appointmentId, getRole(jwt), getUid(jwt)));
    }

    @GetMapping("/sessions/{appointmentId}/token")
    public ResponseEntity<SessionTokenResponse> getJoinToken(
            @PathVariable String appointmentId,
            @AuthenticationPrincipal Jwt jwt) {
        SessionTokenResponse tokenResponse = telemedicineService.generateJoinToken(
                appointmentId,
                getRole(jwt),
                getUid(jwt)
        );
        return ResponseEntity.ok(tokenResponse);
    }

    @PutMapping("/sessions/{appointmentId}/start")
    public ResponseEntity<VideoSession> startSession(@PathVariable String appointmentId,
                                                    @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
                                                    @AuthenticationPrincipal Jwt jwt) {
        VideoSession session = telemedicineService.startSession(appointmentId, authorizationHeader, getRole(jwt), getUid(jwt));
        return ResponseEntity.ok(session);
    }

    @PutMapping("/sessions/{appointmentId}/complete")
    public ResponseEntity<VideoSession> endSession(@PathVariable String appointmentId,
                                                  @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
                                                  @AuthenticationPrincipal Jwt jwt) {
        VideoSession session = telemedicineService.endSession(appointmentId, authorizationHeader, getRole(jwt), getUid(jwt));
        return ResponseEntity.ok(session);
    }

    @DeleteMapping("/sessions/{appointmentId}")
    public ResponseEntity<Void> deleteSession(@PathVariable String appointmentId,
                                              @AuthenticationPrincipal Jwt jwt) {
        telemedicineService.deleteSession(appointmentId, getRole(jwt), getUid(jwt));
        return ResponseEntity.noContent().build();
    }

    private String getUid(Jwt jwt) {
        return jwt != null ? jwt.getClaimAsString("uid") : null;
    }

    private String getRole(Jwt jwt) {
        return jwt != null ? jwt.getClaimAsString("role") : null;
    }
}

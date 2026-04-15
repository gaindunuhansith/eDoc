package com.edoc.telemedicineservice.service;

import com.edoc.telemedicineservice.model.SessionStatus;
import com.edoc.telemedicineservice.model.VideoSession;
import com.edoc.telemedicineservice.repository.VideoSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class TelemedicineService {

    private final VideoSessionRepository sessionRepository;
    private final TwilioService twilioService;

    public TelemedicineService(VideoSessionRepository sessionRepository, TwilioService twilioService) {
        this.sessionRepository = sessionRepository;
        this.twilioService = twilioService;
    }

    public VideoSession createSession(String appointmentId, String doctorId, String patientId) {
        validateRequired("appointmentId", appointmentId);
        validateRequired("doctorId", doctorId);
        validateRequired("patientId", patientId);

        Optional<VideoSession> existingSession = sessionRepository.findByAppointmentId(appointmentId);
        if (existingSession.isPresent()) {
            return existingSession.get();
        }

        String roomName = "appointment-" + appointmentId;
        String roomSid = twilioService.createRoom(roomName);

        VideoSession session = new VideoSession(appointmentId, doctorId, patientId);
        session.setTwilioRoomSid(roomSid);
        session.setStatus(SessionStatus.SCHEDULED);

        return sessionRepository.save(session);
    }

    public VideoSession getSession(String appointmentId) {
        validateRequired("appointmentId", appointmentId);
        return findByAppointmentIdOrThrow(appointmentId);
    }

    public String generateJoinToken(String appointmentId, String userId) {
        validateRequired("appointmentId", appointmentId);
        validateRequired("userId", userId);

        VideoSession session = findByAppointmentIdOrThrow(appointmentId);

        if (session.getStatus() == SessionStatus.CANCELLED || session.getStatus() == SessionStatus.COMPLETED) {
            throw new ResponseStatusException(BAD_REQUEST, "Session is not active.");
        }

        String roomName = "appointment-" + appointmentId;
        return twilioService.generateToken(roomName, userId);
    }

    public VideoSession startSession(String appointmentId) {
        VideoSession session = findByAppointmentIdOrThrow(appointmentId);
        session.setStatus(SessionStatus.ONGOING);
        session.setStartTime(LocalDateTime.now());
        return sessionRepository.save(session);
    }

    public VideoSession endSession(String appointmentId) {
        VideoSession session = findByAppointmentIdOrThrow(appointmentId);
        session.setStatus(SessionStatus.COMPLETED);
        session.setEndTime(LocalDateTime.now());
        return sessionRepository.save(session);
    }

    public void deleteSession(String appointmentId) {
        VideoSession session = findByAppointmentIdOrThrow(appointmentId);
        sessionRepository.delete(session);
    }

    private VideoSession findByAppointmentIdOrThrow(String appointmentId) {
        validateRequired("appointmentId", appointmentId);
        return sessionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(
                        NOT_FOUND,
                        "Session not found for appointment: " + appointmentId
                ));
    }

    private void validateRequired(String fieldName, String value) {
        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, fieldName + " is required");
        }
    }
}

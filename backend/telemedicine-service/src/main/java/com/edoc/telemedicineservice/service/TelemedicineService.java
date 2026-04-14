package com.edoc.telemedicineservice.service;

import com.edoc.telemedicineservice.model.SessionStatus;
import com.edoc.telemedicineservice.model.VideoSession;
import com.edoc.telemedicineservice.repository.VideoSessionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class TelemedicineService {

    private final VideoSessionRepository sessionRepository;
    private final TwilioService twilioService;

    public TelemedicineService(VideoSessionRepository sessionRepository, TwilioService twilioService) {
        this.sessionRepository = sessionRepository;
        this.twilioService = twilioService;
    }

    public VideoSession createSession(String appointmentId, String doctorId, String patientId) {
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

    public String generateJoinToken(String appointmentId, String userId) {
        VideoSession session = sessionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Session not found for appointment: " + appointmentId));

        if (session.getStatus() == SessionStatus.CANCELLED || session.getStatus() == SessionStatus.COMPLETED) {
            throw new RuntimeException("Session is not active.");
        }

        String roomName = "appointment-" + appointmentId;
        return twilioService.generateToken(roomName, userId);
    }

    public VideoSession startSession(String appointmentId) {
        VideoSession session = sessionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Session not found."));
        session.setStatus(SessionStatus.ONGOING);
        session.setStartTime(LocalDateTime.now());
        return sessionRepository.save(session);
    }

    public VideoSession endSession(String appointmentId) {
        VideoSession session = sessionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new RuntimeException("Session not found."));
        session.setStatus(SessionStatus.COMPLETED);
        session.setEndTime(LocalDateTime.now());
        return sessionRepository.save(session);
    }
}

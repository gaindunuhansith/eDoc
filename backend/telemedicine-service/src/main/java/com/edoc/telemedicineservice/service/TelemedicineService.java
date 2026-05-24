package com.edoc.telemedicineservice.service;

import com.edoc.telemedicineservice.client.AppointmentServiceClient;
import com.edoc.telemedicineservice.client.NotificationServiceClient;
import com.edoc.telemedicineservice.dto.SessionTokenResponse;
import com.edoc.telemedicineservice.model.SessionStatus;
import com.edoc.telemedicineservice.model.VideoSession;
import com.edoc.telemedicineservice.repository.VideoSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelemedicineService {

    private final VideoSessionRepository sessionRepository;
    private final TwilioService twilioService;
    private final AppointmentServiceClient appointmentClient;
    private final NotificationServiceClient notificationClient;
    private final SimpMessagingTemplate messagingTemplate;

    public VideoSession createSession(String appointmentId,
                                      String doctorId,
                                      String patientId,
                                      String authorizationHeader,
                                      String requesterRole,
                                      String requesterId) {
        validateRequired("appointmentId", appointmentId);
        validateRequired("doctorId", doctorId);
        validateRequired("patientId", patientId);
        requireDoctorOrAdmin(requesterRole, requesterId, doctorId);

        AppointmentServiceClient.AppointmentDTO appointment = appointmentClient.getAppointment(appointmentId, authorizationHeader);
        if (appointment.getStatus() != AppointmentServiceClient.AppointmentStatus.CONFIRMED) {
            throw new ResponseStatusException(BAD_REQUEST, "Appointment must be confirmed to start telemedicine session");
        }

        if (!doctorId.equals(appointment.getDoctorId()) || !patientId.equals(appointment.getPatientId())) {
            throw new ResponseStatusException(BAD_REQUEST, "Doctor or patient ID does not match appointment details");
        }

        Optional<VideoSession> existingSession = sessionRepository.findByAppointmentId(appointmentId);
        if (existingSession.isPresent()) {
            return existingSession.get();
        }

        String roomName = "appointment-" + appointmentId;
        String roomSid = twilioService.createRoom(roomName);

        VideoSession session = new VideoSession();
        session.setAppointmentId(appointmentId);
        session.setDoctorId(doctorId);
        session.setPatientId(patientId);
        session.setRoomName(roomName);
        session.setTwilioRoomSid(roomSid);
        session.setStatus(SessionStatus.SCHEDULED);
        session.setPatientName(appointment.getPatientName());
        session.setDoctorName(appointment.getDoctorName());
        session.setDoctorSpecialty(appointment.getDoctorSpecialty());
        session.setScheduledAt(parseScheduledAt(appointment.getAppointmentDate(), appointment.getTimeSlot()));
        session.setDuration(parseDurationMinutes(appointment.getTimeSlot()));
        session.setNotes(appointment.getReasonForVisit());

        return sessionRepository.save(session);
    }

    public VideoSession getSession(String appointmentId, String requesterRole, String requesterId) {
        validateRequired("appointmentId", appointmentId);
        VideoSession session = findByAppointmentIdOrThrow(appointmentId);
        requireParticipantOrAdmin(session, requesterRole, requesterId);
        return session;
    }

    public List<VideoSession> getAllSessions(String requesterRole, String requesterId) {
        validateRequired("requesterRole", requesterRole);
        validateRequired("requesterId", requesterId);

        return switch (normalizeRole(requesterRole)) {
            case "ADMIN" -> sessionRepository.findAll();
            case "DOCTOR" -> sessionRepository.findByDoctorId(requesterId);
            case "PATIENT" -> sessionRepository.findByPatientId(requesterId);
            default -> throw new ResponseStatusException(FORBIDDEN, "Unsupported role for telemedicine sessions");
        };
    }

    public SessionTokenResponse generateJoinToken(String appointmentId, String requesterRole, String requesterId) {
        validateRequired("appointmentId", appointmentId);
        validateRequired("requesterRole", requesterRole);
        validateRequired("requesterId", requesterId);

        VideoSession session = findByAppointmentIdOrThrow(appointmentId);
        requireParticipantOrAdmin(session, requesterRole, requesterId);

        if (session.getStatus() == SessionStatus.CANCELLED || session.getStatus() == SessionStatus.ENDED) {
            throw new ResponseStatusException(BAD_REQUEST, "Session is not active.");
        }

        String roomName = (session.getRoomName() == null || session.getRoomName().isBlank())
                ? "appointment-" + appointmentId
                : session.getRoomName();
        String token = twilioService.generateToken(roomName, requesterId);
        return new SessionTokenResponse(token, roomName, LocalDateTime.now().plusHours(1));
    }

    public VideoSession startSession(String appointmentId, String authorizationHeader, String requesterRole, String requesterId) {
        VideoSession session = findByAppointmentIdOrThrow(appointmentId);
        requireDoctorOrAdmin(requesterRole, requesterId, session.getDoctorId());

        if (session.getStatus() == SessionStatus.ENDED || session.getStatus() == SessionStatus.CANCELLED) {
            throw new ResponseStatusException(BAD_REQUEST, "Session cannot be started in current state");
        }

        session.setStatus(SessionStatus.ACTIVE);
        session.setStartTime(LocalDateTime.now());

        VideoSession savedSession = sessionRepository.save(session);

        // Send WebSocket notification
        Map<String, String> startMsg = new LinkedHashMap<>();
        startMsg.put("type", "SESSION_STARTED");
        startMsg.put("appointmentId", appointmentId);
        startMsg.put("roomName", savedSession.getRoomName());
        messagingTemplate.convertAndSend("/topic/telemedicine/session/" + appointmentId, startMsg);

        try {
            AppointmentServiceClient.AppointmentDTO appointment = appointmentClient.getAppointment(appointmentId, authorizationHeader);
            notificationClient.sendSessionStartedToPatient(
                    appointment.getPatientId(),
                    appointment.getDoctorName(),
                    appointment.getAppointmentDate(),
                    appointment.getTimeSlot(),
                    authorizationHeader
            );
        } catch (Exception ex) {
            System.err.println("Failed to send session start notifications: " + ex.getMessage());
        }

        return savedSession;
    }

    public VideoSession endSession(String appointmentId, String authorizationHeader, String requesterRole, String requesterId) {
        VideoSession session = findByAppointmentIdOrThrow(appointmentId);
        requireDoctorOrAdmin(requesterRole, requesterId, session.getDoctorId());

        if (session.getStatus() == SessionStatus.ENDED || session.getStatus() == SessionStatus.CANCELLED) {
            throw new ResponseStatusException(BAD_REQUEST, "Session cannot be ended in current state");
        }

        session.setStatus(SessionStatus.ENDED);
        session.setEndTime(LocalDateTime.now());

        VideoSession savedSession = sessionRepository.save(session);

        // Send WebSocket notification
        Map<String, String> endMsg = new LinkedHashMap<>();
        endMsg.put("type", "SESSION_ENDED");
        endMsg.put("appointmentId", appointmentId);
        messagingTemplate.convertAndSend("/topic/telemedicine/session/" + appointmentId, endMsg);

        try {
            appointmentClient.updateAppointmentStatus(appointmentId,
                new AppointmentServiceClient.AppointmentStatusUpdate(
                    AppointmentServiceClient.AppointmentStatus.COMPLETED,
                    "Telemedicine session completed successfully"), authorizationHeader);
        } catch (Exception ex) {
            log.warn("Failed to update appointment status to COMPLETED for appointmentId={}: {}",
                    appointmentId, ex.getMessage());
        }

        return savedSession;
    }

    public void deleteSession(String appointmentId, String requesterRole, String requesterId) {
        VideoSession session = findByAppointmentIdOrThrow(appointmentId);
        requireDoctorOrAdmin(requesterRole, requesterId, session.getDoctorId());
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

    private void requireParticipantOrAdmin(VideoSession session, String requesterRole, String requesterId) {
        String role = normalizeRole(requesterRole);
        if ("ADMIN".equals(role)) {
            return;
        }

        boolean allowed = ("DOCTOR".equals(role) && requesterId.equals(session.getDoctorId()))
                || ("PATIENT".equals(role) && requesterId.equals(session.getPatientId()));

        if (!allowed) {
            throw new ResponseStatusException(FORBIDDEN, "You are not authorized for this telemedicine session");
        }
    }

    private void requireDoctorOrAdmin(String requesterRole, String requesterId, String doctorId) {
        String role = normalizeRole(requesterRole);
        if ("ADMIN".equals(role)) {
            return;
        }

        if (!"DOCTOR".equals(role) || !requesterId.equals(doctorId)) {
            throw new ResponseStatusException(FORBIDDEN, "Only the assigned doctor can perform this action");
        }
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            throw new ResponseStatusException(FORBIDDEN, "Role is required");
        }
        return role.trim().toUpperCase(Locale.ROOT);
    }

    private LocalDateTime parseScheduledAt(String appointmentDate, String timeSlot) {
        try {
            if (appointmentDate == null || appointmentDate.isBlank()) {
                return LocalDateTime.now();
            }

            LocalTime startTime = LocalTime.of(9, 0);
            if (timeSlot != null && !timeSlot.isBlank()) {
                String[] parts = timeSlot.split("-");
                if (parts.length > 0) {
                    startTime = LocalTime.parse(parts[0].trim());
                }
            }

            return LocalDateTime.parse(appointmentDate.trim() + "T" + startTime);
        } catch (DateTimeParseException ex) {
            return LocalDateTime.now();
        }
    }

    private int parseDurationMinutes(String timeSlot) {
        if (timeSlot == null || timeSlot.isBlank()) {
            return 30;
        }

        try {
            String[] parts = timeSlot.split("-");
            if (parts.length != 2) {
                return 30;
            }

            LocalTime start = LocalTime.parse(parts[0].trim());
            LocalTime end = LocalTime.parse(parts[1].trim());
            long minutes = Duration.between(start, end).toMinutes();
            return minutes > 0 ? (int) minutes : 30;
        } catch (DateTimeParseException ex) {
            return 30;
        }
    }
}

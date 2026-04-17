package com.edoc.telemedicineservice.service;

import com.edoc.telemedicineservice.client.AppointmentServiceClient;
import com.edoc.telemedicineservice.client.NotificationServiceClient;
import com.edoc.telemedicineservice.model.SessionStatus;
import com.edoc.telemedicineservice.model.VideoSession;
import com.edoc.telemedicineservice.repository.VideoSessionRepository;
import com.edoc.telemedicineservice.service.TwilioService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
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
    private final AppointmentServiceClient appointmentClient;
    private final NotificationServiceClient notificationClient;
    private final SimpMessagingTemplate messagingTemplate;

    public TelemedicineService(VideoSessionRepository sessionRepository,
                             TwilioService twilioService,
                             AppointmentServiceClient appointmentClient,
                             NotificationServiceClient notificationClient,
                             SimpMessagingTemplate messagingTemplate) {
        this.sessionRepository = sessionRepository;
        this.twilioService = twilioService;
        this.appointmentClient = appointmentClient;
        this.notificationClient = notificationClient;
        this.messagingTemplate = messagingTemplate;
    }

    public VideoSession createSession(String appointmentId, String doctorId, String patientId, String authorizationHeader) {
        validateRequired("appointmentId", appointmentId);
        validateRequired("doctorId", doctorId);
        validateRequired("patientId", patientId);

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

        VideoSession session = new VideoSession(appointmentId, doctorId, patientId);
        session.setTwilioRoomSid(roomSid);
        session.setStatus(SessionStatus.SCHEDULED);

        return sessionRepository.save(session);
    }

    public VideoSession getSession(String appointmentId) {
        validateRequired("appointmentId", appointmentId);
        return findByAppointmentIdOrThrow(appointmentId);
    }

    public java.util.List<VideoSession> getAllSessions(String authorizationHeader) {
        // For now, return all sessions. In a production system, you would filter by user role/permissions
        // based on the authorization header (doctor sees their sessions, patient sees their sessions, admin sees all)
        return sessionRepository.findAll();
    }

    public String generateJoinToken(String appointmentId, String userId) {
        validateRequired("appointmentId", appointmentId);
        validateRequired("userId", userId);

        VideoSession session = findByAppointmentIdOrThrow(appointmentId);

        if (session.getStatus() == SessionStatus.CANCELLED || session.getStatus() == SessionStatus.ENDED) {
            throw new ResponseStatusException(BAD_REQUEST, "Session is not active.");
        }

        String roomName = "appointment-" + appointmentId;
        return twilioService.generateToken(roomName, userId);
    }

    public VideoSession startSession(String appointmentId, String authorizationHeader) {
        VideoSession session = findByAppointmentIdOrThrow(appointmentId);
        session.setStatus(SessionStatus.ACTIVE);
        session.setStartTime(LocalDateTime.now());

        VideoSession savedSession = sessionRepository.save(session);

        // Send WebSocket notification
        messagingTemplate.convertAndSend("/topic/telemedicine/session/" + appointmentId,
            "{\"type\": \"SESSION_STARTED\", \"appointmentId\": \"" + appointmentId + "\", \"roomName\": \"appointment-" + appointmentId + "\"}");

        try {
            AppointmentServiceClient.AppointmentDTO appointment = appointmentClient.getAppointment(appointmentId, authorizationHeader);
            String doctorMessage = "Your telemedicine session with " + appointment.getDoctorName() + " has started.";
            String patientMessage = "Your telemedicine session has started. Please join the video call.";

            notificationClient.sendEmail(appointment.getPatientEmail(),
                "Telemedicine Session Started", patientMessage, authorizationHeader);
            notificationClient.sendEmail(appointment.getDoctorEmail(),
                "Telemedicine Session Started", doctorMessage, authorizationHeader);


            notificationClient.sendSms(appointment.getPatientEmail(), patientMessage, authorizationHeader);
            notificationClient.sendSms(appointment.getDoctorEmail(), doctorMessage, authorizationHeader);
        } catch (Exception ex) {

            System.err.println("Failed to send session start notifications: " + ex.getMessage());
        }

        return savedSession;
    }

    public VideoSession endSession(String appointmentId, String authorizationHeader) {
        VideoSession session = findByAppointmentIdOrThrow(appointmentId);
        session.setStatus(SessionStatus.ENDED);
        session.setEndTime(LocalDateTime.now());

        VideoSession savedSession = sessionRepository.save(session);

        // Send WebSocket notification
        messagingTemplate.convertAndSend("/topic/telemedicine/session/" + appointmentId,
            "{\"type\": \"SESSION_ENDED\", \"appointmentId\": \"" + appointmentId + "\"}");

        try {
            appointmentClient.updateAppointmentStatus(appointmentId,
                new AppointmentServiceClient.AppointmentStatusUpdate(
                    AppointmentServiceClient.AppointmentStatus.COMPLETED,
                    "Telemedicine session completed successfully"), authorizationHeader);
        } catch (Exception ex) {
            System.err.println("Failed to update appointment status: " + ex.getMessage());
        }


        try {
            AppointmentServiceClient.AppointmentDTO appointment = appointmentClient.getAppointment(appointmentId, authorizationHeader);
            String completionMessage = "Your telemedicine session has been completed. Thank you for using eDoc.";

            notificationClient.sendEmail(appointment.getPatientEmail(),
                "Telemedicine Session Completed", completionMessage, authorizationHeader);
            notificationClient.sendEmail(appointment.getDoctorEmail(),
                "Telemedicine Session Completed", completionMessage, authorizationHeader);

            notificationClient.sendSms(appointment.getPatientEmail(), completionMessage, authorizationHeader);
            notificationClient.sendSms(appointment.getDoctorEmail(), completionMessage, authorizationHeader);
        } catch (Exception ex) {
            System.err.println("Failed to send session completion notifications: " + ex.getMessage());
        }

        return savedSession;
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

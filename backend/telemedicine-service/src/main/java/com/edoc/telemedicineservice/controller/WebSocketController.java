package com.edoc.telemedicineservice.controller;

import com.edoc.telemedicineservice.model.VideoSession;
import com.edoc.telemedicineservice.service.TelemedicineService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final TelemedicineService telemedicineService;

    public WebSocketController(SimpMessagingTemplate messagingTemplate, TelemedicineService telemedicineService) {
        this.messagingTemplate = messagingTemplate;
        this.telemedicineService = telemedicineService;
    }

    @MessageMapping("/telemedicine/session/{appointmentId}/join")
    @SendTo("/topic/telemedicine/session/{appointmentId}")
    public String joinSession(@DestinationVariable String appointmentId, @Payload String userId) {
        // Notify all subscribers that a user joined the session
        messagingTemplate.convertAndSend("/topic/telemedicine/session/" + appointmentId,
            "{\"type\": \"PARTICIPANT_JOINED\", \"userId\": \"" + userId + "\", \"appointmentId\": \"" + appointmentId + "\"}");

        return "{\"type\": \"PARTICIPANT_JOINED\", \"userId\": \"" + userId + "\", \"appointmentId\": \"" + appointmentId + "\"}";
    }

    @MessageMapping("/telemedicine/session/{appointmentId}/leave")
    @SendTo("/topic/telemedicine/session/{appointmentId}")
    public String leaveSession(@DestinationVariable String appointmentId, @Payload String userId) {
        // Notify all subscribers that a user left the session
        messagingTemplate.convertAndSend("/topic/telemedicine/session/" + appointmentId,
            "{\"type\": \"PARTICIPANT_LEFT\", \"userId\": \"" + userId + "\", \"appointmentId\": \"" + appointmentId + "\"}");

        return "{\"type\": \"PARTICIPANT_LEFT\", \"userId\": \"" + userId + "\", \"appointmentId\": \"" + appointmentId + "\"}";
    }

    // Method to send session status updates
    public void sendSessionStatusUpdate(String appointmentId, VideoSession session) {
        messagingTemplate.convertAndSend("/topic/telemedicine/session/" + appointmentId,
            "{\"type\": \"SESSION_STATUS_UPDATE\", \"appointmentId\": \"" + appointmentId + "\", \"status\": \"" + session.getStatus() + "\"}");
    }

    // Method to send session started notification
    public void sendSessionStartedNotification(String appointmentId) {
        messagingTemplate.convertAndSend("/topic/telemedicine/session/" + appointmentId,
            "{\"type\": \"SESSION_STARTED\", \"appointmentId\": \"" + appointmentId + "\", \"roomName\": \"appointment-" + appointmentId + "\"}");
    }

    // Method to send session ended notification
    public void sendSessionEndedNotification(String appointmentId) {
        messagingTemplate.convertAndSend("/topic/telemedicine/session/" + appointmentId,
            "{\"type\": \"SESSION_ENDED\", \"appointmentId\": \"" + appointmentId + "\"}");
    }
}
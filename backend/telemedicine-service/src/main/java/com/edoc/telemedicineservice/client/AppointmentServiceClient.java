package com.edoc.telemedicineservice.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class AppointmentServiceClient {

    @Value("${appointment.service.url}")
    private String appointmentServiceUrl;

    private final WebClient.Builder webClientBuilder;

    public AppointmentDTO getAppointment(String appointmentId, String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new IllegalArgumentException("Authorization header is required for inter-service calls");
        }
        try {
            WebClient webClient = webClientBuilder.defaultHeader("Authorization", authorizationHeader).build();
            return webClient
                    .get()
                    .uri(appointmentServiceUrl + "/api/v1/appointments/{appointmentId}", appointmentId)
                    .retrieve()
                    .bodyToMono(AppointmentDTO.class)
                    .block();
        } catch (Exception ex) {
            throw new RuntimeException("Failed to get appointment details", ex);
        }
    }

    public AppointmentDTO updateAppointmentStatus(String appointmentId, AppointmentStatusUpdate update, String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new IllegalArgumentException("Authorization header is required for inter-service calls");
        }
        try {
            WebClient webClient = webClientBuilder.defaultHeader("Authorization", authorizationHeader).build();
            return webClient
                    .patch()
                    .uri(appointmentServiceUrl + "/api/v1/appointments/{appointmentId}/status", appointmentId)
                    .bodyValue(update)
                    .retrieve()
                    .bodyToMono(AppointmentDTO.class)
                    .block();
        } catch (Exception ex) {
            throw new RuntimeException("Failed to update appointment status", ex);
        }
    }

    @Data
    @NoArgsConstructor
    public static class AppointmentDTO {
        private String id;
        private String patientId;
        private String patientName;
        private String doctorId;
        private String doctorName;
        private String doctorSpecialty;
        private String appointmentDate;
        private String timeSlot;
        private String reasonForVisit;
        private AppointmentStatus status;
    }

    public enum AppointmentStatus {
        PENDING, CONFIRMED, REJECTED, COMPLETED, CANCELLED, NO_SHOW
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AppointmentStatusUpdate {
        private AppointmentStatus status;
        private String doctorNotes;
    }
}
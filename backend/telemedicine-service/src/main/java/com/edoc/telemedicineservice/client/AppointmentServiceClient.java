package com.edoc.telemedicineservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class AppointmentServiceClient {

    @Value("${appointment.service.url}")
    private String appointmentServiceUrl;

    private final WebClient.Builder webClientBuilder;

    public AppointmentServiceClient(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

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
            System.err.println("Failed to get appointment " + appointmentId + ": " + ex.getMessage());
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
            System.err.println("Failed to update appointment status for " + appointmentId + ": " + ex.getMessage());
            throw new RuntimeException("Failed to update appointment status", ex);
        }
    }

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

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getPatientId() { return patientId; }
        public void setPatientId(String patientId) { this.patientId = patientId; }

        public String getPatientName() { return patientName; }
        public void setPatientName(String patientName) { this.patientName = patientName; }

        public String getDoctorId() { return doctorId; }
        public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

        public String getDoctorName() { return doctorName; }
        public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

        public String getDoctorSpecialty() { return doctorSpecialty; }
        public void setDoctorSpecialty(String doctorSpecialty) { this.doctorSpecialty = doctorSpecialty; }

        public String getAppointmentDate() { return appointmentDate; }
        public void setAppointmentDate(String appointmentDate) { this.appointmentDate = appointmentDate; }

        public String getTimeSlot() { return timeSlot; }
        public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

        public String getReasonForVisit() { return reasonForVisit; }
        public void setReasonForVisit(String reasonForVisit) { this.reasonForVisit = reasonForVisit; }

        public AppointmentStatus getStatus() { return status; }
        public void setStatus(AppointmentStatus status) { this.status = status; }
    }

    public enum AppointmentStatus {
        PENDING, CONFIRMED, REJECTED, COMPLETED, CANCELLED, NO_SHOW
    }

    public static class AppointmentStatusUpdate {
        private AppointmentStatus status;
        private String doctorNotes;

        public AppointmentStatusUpdate() {}

        public AppointmentStatusUpdate(AppointmentStatus status, String doctorNotes) {
            this.status = status;
            this.doctorNotes = doctorNotes;
        }

        public AppointmentStatus getStatus() { return status; }
        public void setStatus(AppointmentStatus status) { this.status = status; }

        public String getDoctorNotes() { return doctorNotes; }
        public void setDoctorNotes(String doctorNotes) { this.doctorNotes = doctorNotes; }
    }
}
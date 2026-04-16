package com.edoc.feedbackservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Service
public class AppointmentServiceClient {

    private final WebClient webClient;

    @Value("${appointment.service.url}")
    private String appointmentServiceUrl;

    public AppointmentServiceClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public Mono<AppointmentDTO> getAppointment(Long appointmentId, String authHeader) {
        return webClient.get()
                .uri(appointmentServiceUrl + "/{appointmentId}", appointmentId)
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .retrieve()
                .bodyToMono(AppointmentDTO.class)
                .doOnError(error -> {
                    if (error instanceof WebClientResponseException e) {
                        if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                            System.out.println("Appointment not found: " + appointmentId);
                        } else {
                            System.err.println("Error calling appointment service: " + e.getMessage());
                        }
                    } else {
                        System.err.println("Unexpected error calling appointment service: " + error.getMessage());
                    }
                });
    }

    public static class AppointmentDTO {
        private Long id;
        private Long patientId;
        private Long doctorId;
        private String status;

        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getPatientId() { return patientId; }
        public void setPatientId(Long patientId) { this.patientId = patientId; }

        public Long getDoctorId() { return doctorId; }
        public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
package com.edoc.feedbackservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Service
public class AppointmentServiceClient {

    private final RestClient restClient;

    @Value("${appointment.service.base-url}")
    private String appointmentServiceBaseUrl;

    public AppointmentServiceClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public AppointmentDTO getAppointment(Long appointmentId, String authHeader) {
        try {
            return restClient.get()
                    .uri(appointmentServiceBaseUrl + "/api/appointments/{appointmentId}", appointmentId)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .body(AppointmentDTO.class);
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                System.out.println("Appointment not found: " + appointmentId);
            } else {
                System.err.println("Error calling appointment service: " + ex.getMessage());
            }
            throw ex;
        } catch (Exception ex) {
            System.err.println("Unexpected error calling appointment service: " + ex.getMessage());
            throw new RuntimeException("Unable to validate appointment");
        }
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
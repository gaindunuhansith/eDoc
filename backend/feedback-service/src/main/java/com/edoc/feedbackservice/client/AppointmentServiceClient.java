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

    @Value("${appointment.service.url}")
    private String appointmentServiceBaseUrl;

    public AppointmentServiceClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public AppointmentDTO getAppointment(String appointmentId, String authHeader) {
        try {
            return restClient.get()
                    .uri(appointmentServiceBaseUrl + "/api/v1/appointments/{appointmentId}", appointmentId)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .body(AppointmentDTO.class);
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                return null;
            }
            System.err.println("Error calling appointment service: " + ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            System.err.println("Unexpected error calling appointment service: " + ex.getMessage());
            throw new RuntimeException("Unable to validate appointment");
        }
    }

    public static class AppointmentDTO {
        private String id;
        private String patientId;
        private String doctorId;
        private String status;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getPatientId() { return patientId; }
        public void setPatientId(String patientId) { this.patientId = patientId; }

        public String getDoctorId() { return doctorId; }
        public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
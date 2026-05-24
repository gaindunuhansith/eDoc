package com.edoc.feedbackservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class PatientServiceClient {

    private final RestClient restClient;

    @Value("${patient.service.url}")
    private String patientServiceBaseUrl;

    public PatientServiceClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public PatientDTO getMyPatientProfile(String authHeader) {
        try {
            return restClient.get()
                    .uri(patientServiceBaseUrl + "/api/v1/patients/me")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .body(PatientDTO.class);
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                System.out.println("Patient profile not found for authenticated user");
                return null;
            }
            System.err.println("Error calling patient service: " + ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            System.err.println("Unexpected error calling patient service: " + ex.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Patient service is unavailable");
        }
    }

    public PatientDTO getPatientById(UUID patientId, String authHeader) {
        try {
            return restClient.get()
                    .uri(patientServiceBaseUrl + "/api/v1/internal/patients/{id}", patientId)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .body(PatientDTO.class);
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                return null;
            }
            System.err.println("Error fetching patient by id: " + ex.getMessage());
            return null;
        } catch (Exception ex) {
            System.err.println("Unexpected error fetching patient by id: " + ex.getMessage());
            return null;
        }
    }

    public static class PatientDTO {
        private UUID id;
        private String userId;

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
    }
}

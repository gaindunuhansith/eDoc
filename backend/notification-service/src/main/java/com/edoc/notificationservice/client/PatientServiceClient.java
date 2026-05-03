package com.edoc.notificationservice.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.UUID;

@Component
public class PatientServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(PatientServiceClient.class);

    private final RestClient restClient;

    @Value("${patient-service.base-url}")
    private String patientServiceBaseUrl;

    public PatientServiceClient() {
        this.restClient = RestClient.builder().build();
    }

    // Returns the userId (JWT uid) for the given internal patient id, or null if unavailable.
    public String getPatientUserId(String patientId) {
        try {
            UUID.fromString(patientId);
        } catch (IllegalArgumentException e) {
            logger.warn("patientId '{}' is not a valid UUID, skipping patient lookup", patientId);
            return null;
        }
        try {
            PatientBasic response = restClient.get()
                    .uri(patientServiceBaseUrl + "/api/v1/internal/patients/{id}", patientId)
                    .retrieve()
                    .body(PatientBasic.class);
            return response != null ? response.userId() : null;
        } catch (RestClientException ex) {
            logger.warn("Could not fetch patient {}: {}", patientId, ex.getMessage());
            return null;
        }
    }

    private record PatientBasic(String userId) {}
}

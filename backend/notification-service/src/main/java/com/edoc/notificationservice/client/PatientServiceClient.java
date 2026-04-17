package com.edoc.notificationservice.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

@Component
public class PatientServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(PatientServiceClient.class);

    private final RestClient restClient;

    @Value("${patient-service.base-url}")
    private String patientServiceBaseUrl;

    public PatientServiceClient() {
        this.restClient = RestClient.builder().build();
    }

    // Returns a map containing at least "phone" (String) and "userId" (Number).
    public Map<?, ?> getPatientById(String patientId) {
        try {
            return restClient.get()
                    .uri(patientServiceBaseUrl + "/api/v1/internal/patients/{id}", patientId)
                    .retrieve()
                    .body(Map.class);
        } catch (RestClientException ex) {
            logger.warn("Could not fetch patient {}: {}", patientId, ex.getMessage());
            return null;
        }
    }
}

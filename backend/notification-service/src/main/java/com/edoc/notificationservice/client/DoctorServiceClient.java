package com.edoc.notificationservice.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class DoctorServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(DoctorServiceClient.class);

    private final RestClient restClient;

    @Value("${doctor-service.base-url}")
    private String doctorServiceBaseUrl;

    public DoctorServiceClient() {
        this.restClient = RestClient.builder().build();
    }

    // Calls the internal endpoint added in Phase 1 to get the userId linked to this doctor.
    public DoctorContact getDoctorById(String doctorId) {
        try {
            return restClient.get()
                    .uri(doctorServiceBaseUrl + "/api/v1/doctors/internal/{id}", doctorId)
                    .retrieve()
                    .body(DoctorContact.class);
        } catch (RestClientException ex) {
            logger.warn("Could not fetch doctor {}: {}", doctorId, ex.getMessage());
            return null;
        }
    }

    // Only userId is needed — contact details are resolved via user-service.
    public record DoctorContact(String userId) {}
}

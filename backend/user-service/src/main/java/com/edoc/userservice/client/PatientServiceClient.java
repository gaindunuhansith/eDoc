package com.edoc.userservice.client;

import com.edoc.userservice.config.MicroserviceProperties;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
@RequiredArgsConstructor
public class PatientServiceClient {

    private static final Logger log = LoggerFactory.getLogger(PatientServiceClient.class);

    private final RestClient.Builder restClientBuilder;
    private final MicroserviceProperties microserviceProperties;

    public void deleteByUserId(String userId) {
        MicroserviceProperties.ServiceEndpoint patient = microserviceProperties.getPatient();
        try {
            restClientBuilder
                    .baseUrl(patient.getBaseUrl())
                    .build()
                    .delete()
                    .uri(patient.getDeleteByUserIdPath(), userId)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Deleted patient profile via patient-service userId={}", userId);
        } catch (RestClientResponseException ex) {
                log.warn("Patient-service delete failed userId={} status={} body={}",
                    userId, ex.getStatusCode().value(), ex.getResponseBodyAsString(), ex);
            throw ex;
        }
    }
}

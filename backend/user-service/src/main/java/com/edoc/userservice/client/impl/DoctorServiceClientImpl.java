package com.edoc.userservice.client.impl;

import com.edoc.userservice.client.DoctorServiceClient;
import com.edoc.userservice.config.MicroserviceProperties;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
@RequiredArgsConstructor
public class DoctorServiceClientImpl implements DoctorServiceClient {

    private static final Logger log = LoggerFactory.getLogger(DoctorServiceClientImpl.class);

    private final RestClient.Builder restClientBuilder;
    private final MicroserviceProperties microserviceProperties;

    @Override
    public void deleteByUserId(String userId) {
        MicroserviceProperties.ServiceEndpoint doctor = microserviceProperties.getDoctor();
        try {
            restClientBuilder
                    .baseUrl(doctor.getBaseUrl())
                    .build()
                    .delete()
                    .uri(doctor.getDeleteByUserIdPath(), userId)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Deleted doctor profile via doctor-service userId={}", userId);
        } catch (RestClientResponseException ex) {
            log.warn("Doctor-service delete failed userId={} status={} body={}",
                    userId, ex.getStatusCode().value(), ex.getResponseBodyAsString(), ex);
            throw ex;
        }
    }
}

package com.edoc.userservice.client;

import com.edoc.userservice.config.MicroserviceProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class PatientServiceClient {

    private final RestClient.Builder restClientBuilder;
    private final MicroserviceProperties microserviceProperties;

    public void deleteByUserId(String userId) {
        MicroserviceProperties.ServiceEndpoint patient = microserviceProperties.getPatient();

        restClientBuilder
                .baseUrl(patient.getBaseUrl())
                .build()
                .delete()
                .uri(patient.getDeleteByUserIdPath(), userId)
                .retrieve()
                .toBodilessEntity();
    }
}

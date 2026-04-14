package com.edoc.userservice.client;

import com.edoc.userservice.config.MicroserviceProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class DoctorServiceClient {

    private final RestClient.Builder restClientBuilder;
    private final MicroserviceProperties microserviceProperties;

    public void deleteByUserId(String userId) {
        MicroserviceProperties.ServiceEndpoint doctor = microserviceProperties.getDoctor();

        restClientBuilder
                .baseUrl(doctor.getBaseUrl())
                .build()
                .delete()
                .uri(doctor.getDeleteByUserIdPath(), userId)
                .retrieve()
                .toBodilessEntity();
    }
}

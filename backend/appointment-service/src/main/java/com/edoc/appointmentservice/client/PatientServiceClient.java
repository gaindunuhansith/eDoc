package com.edoc.appointmentservice.client;

import java.util.Map;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
@Slf4j
public class PatientServiceClient {

    @Value("${patient.service.url}")
    private String patientServiceUrl;

    private final WebClient.Builder webClientBuilder;

    public Map<String, Object> getPatientById(String patientId) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(patientServiceUrl + "/internal/patients/" + patientId)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception ex) {
            log.error("Error fetching patient with id: {}", patientId, ex);
            throw new RuntimeException("Could not fetch patient details. Patient service may be down.");
        }
    }

    public Map<String, Object> getPatientStatusById(String patientId) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(patientServiceUrl + "/internal/patients/" + patientId + "/status")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception ex) {
            log.error("Error fetching patient status with id: {}", patientId, ex);
            throw new RuntimeException("Could not validate patient status. Patient service may be down.");
        }
    }
}

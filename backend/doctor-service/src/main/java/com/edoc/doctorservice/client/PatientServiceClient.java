package com.edoc.doctorservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class PatientServiceClient {

    @Value("${patient.service.url}")
    private String patientServiceUrl;

    private final WebClient.Builder webClientBuilder;

    // Get all reports uploaded by a specific patient
    // Doctor uses this to view patient history before consultation
    public List<Map> getPatientReports(String patientId) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(patientServiceUrl + "/internal/patients/" + patientId + "/reports")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Map>>() {})
                    .block();
        } catch (Exception e) {
            log.error("Error fetching reports for patient: {}", patientId, e);
            throw new RuntimeException(
                    "Could not fetch patient reports. Patient service may be down."
            );
        }
    }

    // Get basic patient profile info
    public Map getPatientById(String patientId) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(patientServiceUrl + "/internal/patients/" + patientId)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            log.error("Error fetching patient with id: {}", patientId, e);
            throw new RuntimeException(
                    "Could not fetch patient details. Patient service may be down."
            );
        }
    }
}

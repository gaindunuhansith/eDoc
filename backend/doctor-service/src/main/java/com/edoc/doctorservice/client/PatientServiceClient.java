package com.edoc.doctorservice.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

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
    public List<Map<String, Object>> getPatientReports(String patientId) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(patientServiceUrl + "/api/v1/internal/patients/" + patientId + "/reports")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Error fetching reports for patient: {} — HTTP {} {}", patientId, e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException(
                    "Could not fetch patient reports: " + e.getStatusCode()
            );
        } catch (Exception e) {
            log.error("Error fetching reports for patient: {}", patientId, e);
            throw new RuntimeException(
                    "Could not fetch patient reports. Patient service may be down."
            );
        }
    }

    // Download the actual file bytes of a report (for doctor access)
    public ResponseEntity<byte[]> getPatientReportFile(String patientId, String reportId) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(patientServiceUrl + "/api/v1/internal/patients/" + patientId + "/reports/" + reportId + "/file")
                    .retrieve()
                    .toEntity(byte[].class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Error fetching report file for patient {} report {}: {}", patientId, reportId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error fetching report file for patient {} report {}", patientId, reportId, e);
            throw new RuntimeException("Could not fetch report file. Patient service may be down.");
        }
    }

    // Get basic patient profile info
    @SuppressWarnings("unchecked")
    public Map<String, Object> getPatientById(String patientId) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(patientServiceUrl + "/api/v1/internal/patients/" + patientId)
                    .retrieve()
                    .bodyToMono((Class<Map<String, Object>>) (Class<?>) Map.class)
                    .block();
        } catch (WebClientResponseException e) {
            log.error("Error fetching patient: {} — HTTP {} {}", patientId, e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException(
                    "Could not fetch patient details: " + e.getStatusCode()
            );
        } catch (Exception e) {
            log.error("Error fetching patient with id: {}", patientId, e);
            throw new RuntimeException(
                    "Could not fetch patient details. Patient service may be down."
            );
        }
    }
}

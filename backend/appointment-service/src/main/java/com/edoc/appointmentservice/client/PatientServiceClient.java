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
                    .uri(patientServiceUrl + "/api/v1/internal/patients/" + patientId)
                    .retrieve()
                    .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
        } catch (Exception ex) {
            log.error("Error fetching patient with id: {}", patientId, ex);
            throw new RuntimeException("Could not fetch patient details. Patient service may be down.");
        }
    }

    public Map<String, Object> getPatientStatusById(String patientId) {
        try {
            Map<String, Object> raw = webClientBuilder.build()
                    .get()
                    .uri(patientServiceUrl + "/api/v1/internal/patients/" + patientId + "/status")
                    .retrieve()
                    .bodyToMono(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            if (raw == null) return null;

            // Backwards-compatibility: older callers expect a `status` string (e.g. "ACTIVE").
            // New patient-service returns `{ id: UUID, deleted: boolean }`.
            if (!raw.containsKey("status") && raw.containsKey("deleted")) {
                Object deletedObj = raw.get("deleted");
                boolean deleted = false;
                if (deletedObj instanceof Boolean) {
                    deleted = (Boolean) deletedObj;
                } else if (deletedObj != null) {
                    deleted = Boolean.parseBoolean(deletedObj.toString());
                }
                Map<String, Object> translated = new java.util.HashMap<>(raw);
                translated.put("status", deleted ? "INACTIVE" : "ACTIVE");
                return translated;
            }

            return raw;
        } catch (Exception ex) {
            log.error("Error fetching patient status with id: {}", patientId, ex);
            throw new RuntimeException("Could not validate patient status. Patient service may be down.");
        }
    }
}

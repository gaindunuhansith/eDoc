package com.edoc.patientservice.client;

import com.edoc.patientservice.dto.prescription.PrescriptionResponseDTO;
import java.util.Collections;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

// Client wrapper for doctor-service prescription read endpoints.
@Component
public class DoctorPrescriptionClient {

    private final RestClient restClient;
    private final String doctorServiceBaseUrl;

    public DoctorPrescriptionClient(RestClient.Builder restClientBuilder,
                                    @Value("${doctor-service.base-url}") String doctorServiceBaseUrl) {
        this.restClient = restClientBuilder.build();
        this.doctorServiceBaseUrl = doctorServiceBaseUrl;
    }

    public List<PrescriptionResponseDTO> getPrescriptionsByPatient(String patientId) {
        try {
            List<PrescriptionResponseDTO> prescriptions = restClient.get()
                    .uri(doctorServiceBaseUrl + "/api/v1/prescriptions/patient/{patientId}", patientId)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<PrescriptionResponseDTO>>() { });
            return prescriptions == null ? Collections.emptyList() : prescriptions;
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Failed to fetch prescriptions from doctor-service",
                    ex
            );
        }
    }
}
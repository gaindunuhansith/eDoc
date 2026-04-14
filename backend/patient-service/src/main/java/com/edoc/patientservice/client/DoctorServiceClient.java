package com.edoc.patientservice.client;

import com.edoc.patientservice.dto.PrescriptionResponse;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class DoctorServiceClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public DoctorServiceClient(RestTemplate restTemplate,
                               @Value("${doctor-service.base-url}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    public List<PrescriptionResponse> getPrescriptions(Long patientId) {
        String url = String.format("%s/prescriptions?patientId=%d", baseUrl, patientId);
        try {
            PrescriptionResponse[] response = restTemplate.getForObject(url, PrescriptionResponse[].class);
            if (response == null) {
                return Collections.emptyList();
            }
            return Arrays.asList(response);
        } catch (RestClientException ex) {
            throw ex;
        }
    }
}

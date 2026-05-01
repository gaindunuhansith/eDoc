package com.edoc.feedbackservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Service
public class DoctorServiceClient {

    private final RestClient restClient;

    @Value("${doctor.service.base-url}")
    private String doctorServiceBaseUrl;

    public DoctorServiceClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public DoctorDTO getMyDoctorProfile(String authHeader) {
        try {
            return restClient.get()
                    .uri(doctorServiceBaseUrl + "/api/v1/doctors/me")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .body(DoctorDTO.class);
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                System.out.println("Doctor profile not found for authenticated user");
            } else {
                System.err.println("Error calling doctor service: " + ex.getMessage());
            }
            throw ex;
        } catch (Exception ex) {
            System.err.println("Unexpected error calling doctor service: " + ex.getMessage());
            throw new RuntimeException("Unable to resolve current doctor profile");
        }
    }

    public static class DoctorDTO {
        private Long id;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }
    }
}
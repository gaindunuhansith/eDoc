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

    @Value("${doctor.service.url}")
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
                return null;
            }
            System.err.println("Error calling doctor service: " + ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            System.err.println("Unexpected error calling doctor service: " + ex.getMessage());
            throw new RuntimeException("Unable to resolve current doctor profile");
        }
    }

    public DoctorDTO getDoctorById(String doctorId, String authHeader) {
        try {
            return restClient.get()
                    .uri(doctorServiceBaseUrl + "/api/v1/doctors/{id}", doctorId)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .body(DoctorDTO.class);
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                return null;
            }
            System.err.println("Error fetching doctor by id from doctor service: " + ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            System.err.println("Unexpected error fetching doctor by id: " + ex.getMessage());
            return null;
        }
    }

    public static class DoctorDTO {
        private String id;
        private String firstName;
        private String lastName;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getFullName() {
            if (firstName == null && lastName == null) return null;
            return ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
        }
    }
}
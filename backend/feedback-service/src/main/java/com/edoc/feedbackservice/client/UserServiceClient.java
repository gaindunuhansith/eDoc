package com.edoc.feedbackservice.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Service
public class UserServiceClient {

    private final RestClient restClient;

    @Value("${user.service.base-url}")
    private String userServiceBaseUrl;

    public UserServiceClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    public UserDTO getUserById(Long userId, String authHeader) {
        try {
            return restClient.get()
                    .uri(userServiceBaseUrl + "/api/users/{userId}", userId)
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .retrieve()
                    .body(UserDTO.class);
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                System.out.println("User not found: " + userId);
            } else {
                System.err.println("Error calling user service: " + ex.getMessage());
            }
            throw ex;
        } catch (Exception ex) {
            System.err.println("Unexpected error calling user service: " + ex.getMessage());
            throw new RuntimeException("Unable to get user information");
        }
    }

    public static class UserDTO {
        private Long id;
        private String email;
        private String phone;
        private String firstName;
        private String lastName;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
    }
}
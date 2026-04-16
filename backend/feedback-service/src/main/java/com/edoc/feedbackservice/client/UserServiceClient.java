package com.edoc.feedbackservice.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Slf4j
@Service
public class UserServiceClient {

    private final WebClient webClient;

    @Value("${user.service.url}")
    private String userServiceUrl;

    public UserServiceClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public Mono<UserDTO> getUserById(Long userId, String authHeader) {
        return webClient.get()
                .uri(userServiceUrl + "/{userId}", userId)
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .retrieve()
                .bodyToMono(UserDTO.class)
                .doOnError(error -> {
                    if (error instanceof WebClientResponseException e) {
                        if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                            log.warn("User not found: {}", userId);
                        } else {
                            log.error("Error calling user service: {}", e.getMessage());
                        }
                    } else {
                        log.error("Unexpected error calling user service: {}", error.getMessage());
                    }
                });
    }

    public static class UserDTO {
        private Long id;
        private String email;
        private String phone;
        private String firstName;
        private String lastName;

        // Getters and setters
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
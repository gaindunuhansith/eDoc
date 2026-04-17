package com.edoc.notificationservice.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class UserServiceClient {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceClient.class);

    private final RestClient restClient;

    @Value("${user-service.base-url}")
    private String userServiceBaseUrl;

    public UserServiceClient() {
        this.restClient = RestClient.builder().build();
    }

    // authHeader parameter kept for signature compatibility but no longer forwarded —
    // the internal endpoint is permitAll and has no ownership check.
    public UserContact getUserById(String userId, String authHeader) {
        try {
            return restClient.get()
                    .uri(userServiceBaseUrl + "/api/v1/users/internal/{userId}", userId)
                    .retrieve()
                    .body(UserContact.class);
        } catch (RestClientException ex) {
            logger.warn("Could not fetch user {}: {}", userId, ex.getMessage());
            return null;
        }
    }

    public record UserContact(String email, String phoneNumber) {}
}

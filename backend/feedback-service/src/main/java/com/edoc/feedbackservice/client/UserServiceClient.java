package com.edoc.feedbackservice.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserServiceClient {

    private static final Logger log = LoggerFactory.getLogger(UserServiceClient.class);

    private final RestClient restClient;

    @Value("${user.service.url}")
    private String userServiceBaseUrl;

    public UserServiceClient(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    /**
     * Batch-fetches user names from user-service for the given userId strings.
     *
     * @param userIds    list of user-service userId strings
     * @param authHeader Bearer token forwarded from the incoming request
     * @return map of userId → name
     */
    public Map<String, String> getUserNames(List<String> userIds, String authHeader) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        try {
            List<UserResponse> results = restClient.post()
                    .uri(userServiceBaseUrl + "/api/v1/users/batch")
                    .header("Authorization", authHeader)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(userIds)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<UserResponse>>() {});

            if (results == null) return Collections.emptyMap();

            return results.stream()
                    .filter(r -> r.getUserId() != null && r.getName() != null)
                    .collect(Collectors.toMap(UserResponse::getUserId, UserResponse::getName));
        } catch (Exception ex) {
            log.warn("Failed to fetch user names from user-service: {}", ex.getMessage());
            return Collections.emptyMap();
        }
    }

    private static class UserResponse {
        private String userId;
        private String name;

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
}

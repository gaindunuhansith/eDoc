package com.edoc.patientservice.client;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

// Client for resolving user names/emails from user-service using the admin's JWT.
@Component
public class UserServiceClient {

    private static final Logger log = LoggerFactory.getLogger(UserServiceClient.class);

    private final RestClient restClient;
    private final String userServiceBaseUrl;

    public UserServiceClient(RestClient.Builder restClientBuilder,
                             @Value("${user-service.base-url}") String userServiceBaseUrl) {
        this.restClient = restClientBuilder.build();
        this.userServiceBaseUrl = userServiceBaseUrl;
    }

    /**
     * Fetches user summaries for the given userIds by calling POST /api/v1/users/batch
     * with the forwarded admin Authorization header.
     *
     * @param userIds  list of user-service UUID strings
     * @param authHeader  Bearer token from the incoming admin request
     * @return map of userId → UserSummary (name + email)
     */
    public Map<String, UserSummary> getUserSummaries(List<String> userIds, String authHeader) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        try {
            List<UserSummaryRaw> results = restClient.post()
                    .uri(userServiceBaseUrl + "/api/v1/users/batch")
                    .header("Authorization", authHeader)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(userIds)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<UserSummaryRaw>>() { });

            if (results == null) return Collections.emptyMap();

            return results.stream()
                    .collect(Collectors.toMap(UserSummaryRaw::userId, r -> new UserSummary(r.name(), r.email())));
        } catch (Exception ex) {
            log.warn("Failed to fetch user summaries from user-service: {}", ex.getMessage());
            return Collections.emptyMap();
        }
    }

    public record UserSummary(String name, String email) {}

    // Matches the fields returned by user-service UserResponse.
    private record UserSummaryRaw(String userId, String name, String email) {}
}

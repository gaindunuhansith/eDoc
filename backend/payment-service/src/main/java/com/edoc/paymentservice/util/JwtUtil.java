package com.edoc.paymentservice.util;

import java.util.Collections;
import java.util.List;
import org.springframework.security.oauth2.jwt.Jwt;

public final class JwtUtil {

    private JwtUtil() {
    }

    public static Long extractUserId(Jwt jwt) {
        Object userId = jwt.getClaims().get("userId");
        if (userId instanceof Number number) {
            return number.longValue();
        }
        if (userId instanceof String str && !str.isBlank()) {
            return Long.parseLong(str);
        }

        String subject = jwt.getSubject();
        if (subject == null || subject.isBlank()) {
            throw new IllegalArgumentException("JWT missing both userId and subject claims");
        }
        return Long.parseLong(subject);
    }

    @SuppressWarnings("unchecked")
    public static List<String> extractRoles(Jwt jwt) {
        Object roles = jwt.getClaims().get("roles");
        if (roles instanceof List<?> roleList) {
            return (List<String>) roleList;
        }

        Object scope = jwt.getClaims().get("scope");
        if (scope instanceof String scopes && !scopes.isBlank()) {
            return List.of(scopes.split("\\s+"));
        }

        return Collections.emptyList();
    }
}

package com.edoc.userservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
public record JwtProperties(String privateKeyPath, String publicKeyPath, long expiration) {
}

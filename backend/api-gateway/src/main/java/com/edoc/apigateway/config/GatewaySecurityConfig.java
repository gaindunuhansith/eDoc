package com.edoc.apigateway.config;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class GatewaySecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http,
                                                         ReactiveJwtDecoder jwtDecoder) {
        http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .authorizeExchange(auth -> auth
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()
                        .pathMatchers("/api/v1/users/login", "/api/v1/users/register").permitAll()
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtDecoder(jwtDecoder)));

        return http.build();
    }

        @Bean
        public ReactiveJwtDecoder jwtDecoder(@Value("${jwt.public-key}") String publicKey,
                                                                                 ResourceLoader resourceLoader) {
                RSAPublicKey publicKeyObj = loadPublicKey(publicKey, resourceLoader);
                return NimbusReactiveJwtDecoder.withPublicKey(publicKeyObj)
                                .signatureAlgorithm(SignatureAlgorithm.RS256)
                                .build();
        }

        private RSAPublicKey loadPublicKey(String publicKeyOrPath, ResourceLoader resourceLoader) {
                try {
                        String pem;
                        if (publicKeyOrPath == null) {
                                throw new IllegalStateException("jwt.public-key must not be null");
                        }
                        if (publicKeyOrPath.startsWith("file:") || publicKeyOrPath.startsWith("classpath:")) {
                                Resource resource = resourceLoader.getResource(publicKeyOrPath);
                                try (InputStream inputStream = resource.getInputStream()) {
                                        pem = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
                                }
                        } else {
                                // treat the property as raw PEM content
                                pem = publicKeyOrPath;
                        }

                        String normalized = pem
                                        .replace("-----BEGIN PUBLIC KEY-----", "")
                                        .replace("-----END PUBLIC KEY-----", "")
                                        .replaceAll("\\s", "");
                        byte[] keyBytes = Base64.getDecoder().decode(normalized);
                        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
                        return (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(spec);
                } catch (Exception ex) {
                        throw new IllegalStateException("Failed to load JWT public key", ex);
                }
        }
}

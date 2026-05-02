package com.edoc.doctorservice.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Collection;
import java.util.Collections;
import java.util.Locale;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.util.StringUtils;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${jwt.public-key-base64:}")
    private String publicKeyBase64;

    @Value("${spring.security.oauth2.resourceserver.jwt.public-key-location:classpath:public.pem}")
    private String publicKeyLocation;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthConverter)
            throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                response.sendError(HttpStatus.FORBIDDEN.value()))
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/doctors/internal/**").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/doctors/*/availability/book").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/doctors/*/availability/free").permitAll()

                    .requestMatchers(HttpMethod.GET, "/api/v1/doctors/*/availability/**")
                    .hasAnyRole("PATIENT", "DOCTOR", "ADMIN", "APPOINTMENT_SERVICE")
                    .requestMatchers(HttpMethod.POST, "/api/v1/doctors/*/availability/**")
                    .hasAnyRole("DOCTOR", "ADMIN", "APPOINTMENT_SERVICE")
                    .requestMatchers(HttpMethod.PATCH, "/api/v1/doctors/*/availability/**")
                    .hasAnyRole("DOCTOR", "ADMIN", "APPOINTMENT_SERVICE")
                    .requestMatchers(HttpMethod.DELETE, "/api/v1/doctors/*/availability/**")
                    .hasAnyRole("DOCTOR", "ADMIN", "APPOINTMENT_SERVICE")

                        .requestMatchers(HttpMethod.GET, "/api/v1/doctors/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/doctors/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/v1/doctors/register").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/doctors/**").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/doctors/*/verify").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/doctors/*/toggle-availability").hasAnyRole("DOCTOR", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/v1/doctors/*/patients/**").hasAnyRole("DOCTOR", "ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/v1/prescriptions/**").hasAnyRole("DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/prescriptions/patient/**").hasAnyRole("PATIENT", "DOCTOR", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/prescriptions/**").hasAnyRole("PATIENT", "DOCTOR", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/v1/doctors/**")
                        .hasAnyRole("PATIENT", "DOCTOR", "ADMIN", "APPOINTMENT_SERVICE")

                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter))
                );

        return http.build();
    }

    @Bean
    public Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(this::extractAuthorities);
        return converter;
    }

    @Bean
    public JwtDecoder jwtDecoder(ResourceLoader resourceLoader) {
        RSAPublicKey rsaPublicKey;
        if (StringUtils.hasText(publicKeyBase64)) {
            rsaPublicKey = parsePublicKey(publicKeyBase64);
        } else {
            rsaPublicKey = parsePublicKey(readResource(publicKeyLocation, resourceLoader));
        }
        return NimbusJwtDecoder.withPublicKey(rsaPublicKey).build();
    }

    private String readResource(String path, ResourceLoader resourceLoader) {
        try {
            Resource resource = resourceLoader.getResource(path);
            if (!resource.exists()) {
                throw new IllegalStateException("JWT public key is not configured. Set JWT_PUBLIC_KEY_BASE64 or JWT_PUBLIC_KEY_LOCATION.");
            }
            return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to read JWT public key resource", ex);
        }
    }

    private RSAPublicKey parsePublicKey(String keyText) {
        try {
            String normalized = keyText
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s", "");
            byte[] decoded = Base64.getDecoder().decode(normalized);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decoded);
            return (RSAPublicKey) KeyFactory.getInstance("RSA").generatePublic(keySpec);
        } catch (Exception ex) {
            throw new IllegalStateException("Invalid JWT public key format", ex);
        }
    }

    private Collection<GrantedAuthority> extractAuthorities(Jwt jwt) {
        Object roleClaim = jwt.getClaims().get("role");
        if (roleClaim == null) {
            return Collections.emptyList();
        }

        if (roleClaim instanceof String role) {
            if (role.isBlank()) {
                return Collections.emptyList();
            }
            return Collections.singletonList(
                    new SimpleGrantedAuthority("ROLE_" + role.trim().toUpperCase(Locale.ROOT))
            );
        }

        if (roleClaim instanceof Collection<?> roles) {
            return roles.stream()
                    .filter(item -> item != null && !item.toString().isBlank())
                    .map(item -> "ROLE_" + item.toString().trim().toUpperCase(Locale.ROOT))
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toSet());
        }

        return Collections.emptyList();
    }
}

package com.edoc.doctorservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())   // Disable CSRF for REST APIs
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // These endpoints are public - no login needed
                        .requestMatchers("/api/doctors/register").permitAll()
                        .requestMatchers("/api/doctors/specialty/**").permitAll()
                        .requestMatchers("/api/doctors/{id}").permitAll()
                        .requestMatchers("/api/doctors").permitAll()
                        // Everything else requires authentication
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}

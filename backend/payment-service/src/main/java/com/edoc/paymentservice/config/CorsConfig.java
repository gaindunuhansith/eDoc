package com.edoc.paymentservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final String apiGatewayOrigin;

    public CorsConfig(@Value("${app.api-gateway-origin}") String apiGatewayOrigin) {
        this.apiGatewayOrigin = apiGatewayOrigin;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/payments/**")
                .allowedOrigins(apiGatewayOrigin)
                .allowedMethods("GET", "POST", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}

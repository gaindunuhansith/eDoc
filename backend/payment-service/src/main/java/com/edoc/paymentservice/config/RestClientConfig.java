package com.edoc.paymentservice.config;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${app.appointment-service.base-url}")
    private String appointmentBaseUrl;

    @Value("${app.notification-service.base-url}")
    private String notificationBaseUrl;

    @Bean
    public RestClient restClient() {
        return buildClient(appointmentBaseUrl);
    }

    @Bean
    @Qualifier("notificationRestClient")
    public RestClient notificationRestClient() {
        return buildClient(notificationBaseUrl);
    }

    private RestClient buildClient(String baseUrl) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        requestFactory.setReadTimeout((int) Duration.ofSeconds(5).toMillis());

        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}

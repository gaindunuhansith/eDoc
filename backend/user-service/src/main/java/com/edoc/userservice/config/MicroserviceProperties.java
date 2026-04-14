package com.edoc.userservice.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "microservices")
public class MicroserviceProperties {

    private ServiceEndpoint patient = new ServiceEndpoint();
    private ServiceEndpoint doctor = new ServiceEndpoint();

    @Getter
    @Setter
    public static class ServiceEndpoint {
        private String baseUrl;
        private String deleteByUserIdPath;
    }
}

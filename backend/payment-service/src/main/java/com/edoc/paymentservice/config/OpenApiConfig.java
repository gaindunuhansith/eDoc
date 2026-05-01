package com.edoc.paymentservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI paymentServiceOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("eDoc Payment Service API")
                        .version("v1")
                        .description("API documentation for payment operations and webhook processing.")
                        .contact(new Contact().name("eDoc Team"))
                        .license(new License().name("Proprietary")));
    }
}

package com.edoc.apigateway.filter;

import com.edoc.apigateway.config.RateLimitProperties;
import com.edoc.apigateway.ratelimit.RateLimitBucketRegistry;
import java.nio.charset.StandardCharsets;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class IpRateLimitingFilter implements GlobalFilter, Ordered {

    private final RateLimitProperties properties;
    private final RateLimitBucketRegistry bucketRegistry;

    public IpRateLimitingFilter(RateLimitProperties properties, RateLimitBucketRegistry bucketRegistry) {
        this.properties = properties;
        this.bucketRegistry = bucketRegistry;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        if (!properties.isEnabled()) {
            return chain.filter(exchange);
        }

        ServerHttpRequest request = exchange.getRequest();
        String category = categorize(request.getPath().value());
        String clientIp = getClientIp(request);

        if (bucketRegistry.tryConsume(category, clientIp)) {
            return chain.filter(exchange);
        }

        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        exchange.getResponse().getHeaders().set("Retry-After", "1");
        String body = "{\"error\":\"too_many_requests\",\"message\":\"Rate limit exceeded\"}";
        DataBuffer dataBuffer = exchange.getResponse().bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return exchange.getResponse().writeWith(Mono.just(dataBuffer));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }

    private String categorize(String path) {
        if ("/api/v1/users/login".equals(path) || "/api/v1/users/register".equals(path)) {
            return "auth";
        }
        if (path.startsWith("/payments")) {
            return "payments";
        }
        return "default";
    }

    private String getClientIp(ServerHttpRequest request) {
        String headerName = properties.getClientHeader();
        String forwarded = request.getHeaders().getFirst(headerName);
        if (forwarded != null && !forwarded.isBlank()) {
            int commaIndex = forwarded.indexOf(',');
            return (commaIndex > 0 ? forwarded.substring(0, commaIndex) : forwarded).trim();
        }

        if (request.getRemoteAddress() != null && request.getRemoteAddress().getAddress() != null) {
            return request.getRemoteAddress().getAddress().getHostAddress();
        }

        return "unknown";
    }
}

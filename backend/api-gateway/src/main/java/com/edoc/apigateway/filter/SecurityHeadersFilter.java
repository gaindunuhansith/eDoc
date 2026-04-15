package com.edoc.apigateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class SecurityHeadersFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return chain.filter(exchange)
                .then(Mono.fromRunnable(() -> {
                    HttpHeaders headers = exchange.getResponse().getHeaders();
                    headers.putIfAbsent("X-Content-Type-Options", java.util.List.of("nosniff"));
                    headers.putIfAbsent("X-Frame-Options", java.util.List.of("DENY"));
                    headers.putIfAbsent("Referrer-Policy", java.util.List.of("no-referrer"));
                    headers.putIfAbsent(HttpHeaders.CACHE_CONTROL, java.util.List.of("no-store"));
                }));
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}

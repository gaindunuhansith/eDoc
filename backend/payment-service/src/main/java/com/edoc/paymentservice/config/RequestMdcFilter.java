package com.edoc.paymentservice.config;

import com.edoc.paymentservice.util.SecurityUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RequestMdcFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String orderId = request.getHeader("X-Order-Id");
        Long userId = extractUserId(request);

        try {
            SecurityUtil.populateMdc(orderId, userId);
            filterChain.doFilter(request, response);
        } finally {
            SecurityUtil.clearMdc();
        }
    }

    private Long extractUserId(HttpServletRequest request) {
        Authentication authentication = (Authentication) request.getUserPrincipal();
        if (authentication instanceof JwtAuthenticationToken jwtAuthenticationToken) {
            Object claim = jwtAuthenticationToken.getToken().getClaims().get("userId");
            if (claim instanceof Number number) {
                return number.longValue();
            }
            if (claim instanceof String text && !text.isBlank()) {
                return Long.parseLong(text);
            }
        }
        return null;
    }
}

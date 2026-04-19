package com.edoc.userservice.util;

import com.edoc.userservice.service.IUserService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    private final IUserService userService;

    public SecurityUtils(IUserService userService) {
        this.userService = userService;
    }

    public String getCurrentEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            throw new IllegalArgumentException("No authenticated user in context");
        }
        return authentication.getName();
    }

    public boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    public boolean isOwner(String userId) {
        if (userId == null || userId.isBlank()) {
            return false;
        }

        try {
            String email = getCurrentEmail();
            return userService.findByEmailForAuthentication(email).getUserId().equals(userId);
        } catch (Exception ex) {
            return false;
        }
    }
}

package com.edoc.patientservice.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RequestPatientProvider implements CurrentPatientProvider {

    @Override
    public Long getCurrentPatientId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Patient identity is missing.");
        }

        Object uid = jwt.getClaim("uid");
        if (uid == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Patient identity is missing.");
        }

        if (uid instanceof Number number) {
            return number.longValue();
        }

        try {
            return Long.parseLong(uid.toString());
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Patient identity is invalid.");
        }
    }
}

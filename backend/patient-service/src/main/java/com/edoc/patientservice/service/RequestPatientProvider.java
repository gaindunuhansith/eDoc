package com.edoc.patientservice.service;

import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RequestPatientProvider implements CurrentPatientProvider {

    private final HttpServletRequest request;

    public RequestPatientProvider(HttpServletRequest request) {
        this.request = request;
    }

    @Override
    public Long getCurrentPatientId() {
        Principal principal = request.getUserPrincipal();
        String idValue = null;
        if (principal != null && principal.getName() != null && !principal.getName().isBlank()) {
            idValue = principal.getName();
        }

        if (idValue == null) {
            idValue = request.getHeader("X-Patient-Id");
        }

        if (idValue == null || idValue.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Patient identity is missing.");
        }

        try {
            return Long.parseLong(idValue);
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Patient identity is invalid.");
        }
    }
}

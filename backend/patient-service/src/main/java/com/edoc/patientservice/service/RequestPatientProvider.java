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
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Patient identity is missing.");
        }

        try {
            return Long.parseLong(principal.getName());
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Patient identity is invalid.");
        }
    }
}

package com.edoc.patientservice.exception;

import java.time.Instant;
import java.util.Map;

public class ApiErrorResponse {

    private String message;
    private Map<String, String> errors;
    private Instant timestamp;

    public ApiErrorResponse() {
    }

    public ApiErrorResponse(String message, Map<String, String> errors, Instant timestamp) {
        this.message = message;
        this.errors = errors;
        this.timestamp = timestamp;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Map<String, String> getErrors() {
        return errors;
    }

    public void setErrors(Map<String, String> errors) {
        this.errors = errors;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}

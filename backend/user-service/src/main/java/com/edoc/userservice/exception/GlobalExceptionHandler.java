package com.edoc.userservice.exception;

import io.jsonwebtoken.JwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private static final String CODE_USER_NOT_FOUND = "USER_NOT_FOUND";
    private static final String CODE_EMAIL_EXISTS = "EMAIL_ALREADY_EXISTS";
    private static final String CODE_UNAUTHORIZED = "UNAUTHORIZED";
    private static final String CODE_FORBIDDEN = "FORBIDDEN";
    private static final String CODE_BAD_REQUEST = "BAD_REQUEST";
    private static final String CODE_INTERNAL_ERROR = "INTERNAL_SERVER_ERROR";

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUserNotFound(UserNotFoundException ex) {
        log.warn("User not found: {}", ex.getMessage());
        return error(HttpStatus.NOT_FOUND, CODE_USER_NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        log.warn("Email already exists: {}", ex.getMessage());
        return error(HttpStatus.CONFLICT, CODE_EMAIL_EXISTS, ex.getMessage());
    }

    @ExceptionHandler({BadCredentialsException.class, JwtException.class})
    public ResponseEntity<Map<String, String>> handleUnauthorized(Exception ex) {
        log.warn("Unauthorized: {}", ex.getMessage());
        return error(HttpStatus.UNAUTHORIZED, CODE_UNAUTHORIZED, "Invalid credentials or token");
    }

    @ExceptionHandler(UnauthorizedOperationException.class)
    public ResponseEntity<Map<String, String>> handleForbidden(UnauthorizedOperationException ex) {
        log.warn("Forbidden: {}", ex.getMessage());
        return error(HttpStatus.FORBIDDEN, CODE_FORBIDDEN, ex.getMessage());
    }

    @ExceptionHandler({IllegalArgumentException.class, MethodArgumentNotValidException.class})
    public ResponseEntity<Map<String, String>> handleBadRequest(Exception ex) {
        String message;
        if (ex instanceof MethodArgumentNotValidException methodArgumentNotValidException) {
            message = methodArgumentNotValidException.getBindingResult().getFieldErrors().stream()
                    .findFirst()
                    .map(fieldError -> fieldError.getDefaultMessage() == null ? "Validation failed" : fieldError.getDefaultMessage())
                    .orElse("Validation failed");
        } else {
            message = ex.getMessage();
        }

        if (message == null || message.isBlank()) {
            message = "Bad request";
        }

        log.warn("Bad request: {}", message);
        return error(HttpStatus.BAD_REQUEST, CODE_BAD_REQUEST, message);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleUnexpected(Exception ex) {
        log.error("Unexpected server error", ex);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, CODE_INTERNAL_ERROR, "Unexpected server error");
    }

    private ResponseEntity<Map<String, String>> error(HttpStatus status, String code, String message) {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("code", code);
        body.put("error", message);
        return ResponseEntity.status(status).body(body);
    }
}

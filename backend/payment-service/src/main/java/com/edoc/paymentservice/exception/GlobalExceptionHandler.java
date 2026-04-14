package com.edoc.paymentservice.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private static final String CODE_PAYMENT_NOT_FOUND = "PAYMENT_NOT_FOUND";
    private static final String CODE_INVALID_SIGNATURE = "INVALID_NOTIFICATION_SIGNATURE";
    private static final String CODE_BAD_REQUEST = "BAD_REQUEST";
    private static final String CODE_INTERNAL_ERROR = "INTERNAL_SERVER_ERROR";

    @ExceptionHandler(PaymentNotFoundException.class)
    public ResponseEntity<Map<String, String>> handlePaymentNotFound(PaymentNotFoundException ex) {
        log.warn("Payment not found error: {}", ex.getMessage());
        return error(HttpStatus.NOT_FOUND, CODE_PAYMENT_NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(InvalidNotificationSignatureException.class)
    public ResponseEntity<Map<String, String>> handleInvalidSignature(InvalidNotificationSignatureException ex) {
        log.warn("Invalid notification signature: {}", ex.getMessage());
        return error(HttpStatus.BAD_REQUEST, CODE_INVALID_SIGNATURE, ex.getMessage());
    }

    @ExceptionHandler({IllegalArgumentException.class, MethodArgumentNotValidException.class})
    public ResponseEntity<Map<String, String>> handleBadRequest(Exception ex) {
        String message;
        if (ex instanceof MethodArgumentNotValidException methodArgumentNotValidException) {
            message = methodArgumentNotValidException.getBindingResult().getFieldErrors().stream()
                    .findFirst()
                    .map(fieldError -> {
                        String defaultMessage = fieldError.getDefaultMessage();
                        if (defaultMessage == null) {
                            return "Validation failed";
                        }
                        return defaultMessage;
                    })
                    .orElse("Validation failed");
        } else {
            message = ex.getMessage();
        }

        if (message == null) {
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

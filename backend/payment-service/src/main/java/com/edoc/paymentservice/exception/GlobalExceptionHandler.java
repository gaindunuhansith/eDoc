package com.edoc.paymentservice.exception;

import com.edoc.paymentservice.constant.AppMessages;
import com.edoc.paymentservice.constant.ErrorCodes;
import com.edoc.paymentservice.dto.ErrorResponse;
import java.util.NoSuchElementException;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.client.RestClientException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(DataIntegrityViolationException ex) {
        return build(HttpStatus.CONFLICT, ErrorCodes.ERR_DUPLICATE_TRANSACTION, AppMessages.DUPLICATE_TRANSACTION);
    }

    @ExceptionHandler(PaymentSecurityException.class)
    public ResponseEntity<ErrorResponse> handleSecurity(PaymentSecurityException ex) {
        return build(HttpStatus.BAD_REQUEST, ErrorCodes.ERR_INVALID_SIGNATURE, ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
        if (AppMessages.PAYMENT_ALREADY_COMPLETED.equals(ex.getMessage())) {
            return build(HttpStatus.CONFLICT, ErrorCodes.ERR_PAYMENT_COMPLETED, ex.getMessage());
        }
        log.error("Illegal state exception", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCodes.ERR_INTERNAL, AppMessages.INTERNAL_ERROR);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Illegal argument provided: {}", ex.getMessage());
        String message = ex.getMessage() == null ? "Invalid request" : ex.getMessage();
        if (message.toLowerCase().contains("not found")) {
            return build(HttpStatus.NOT_FOUND, ErrorCodes.ERR_NOT_FOUND, message);
        }
        return build(HttpStatus.BAD_REQUEST, ErrorCodes.ERR_VALIDATION, message);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse("Validation failed");
        return build(HttpStatus.BAD_REQUEST, ErrorCodes.ERR_VALIDATION, message);
    }

    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<ErrorResponse> handleDownstream(RestClientException ex) {
        log.warn("Downstream service call failed: {}", ex.getMessage());
        return build(HttpStatus.SERVICE_UNAVAILABLE, ErrorCodes.ERR_DOWNSTREAM, AppMessages.INTERNAL_ERROR);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException ex) {
        return build(HttpStatus.NOT_FOUND, ErrorCodes.ERR_NOT_FOUND, AppMessages.PAYMENT_NOT_FOUND);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntime(RuntimeException ex) {
        log.error("Unexpected runtime exception", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCodes.ERR_INTERNAL, AppMessages.INTERNAL_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleFallback(Exception ex) {
        log.error("Unexpected exception", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCodes.ERR_INTERNAL, AppMessages.INTERNAL_ERROR);
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(new ErrorResponse(code, message, UUID.randomUUID().toString()));
    }
}

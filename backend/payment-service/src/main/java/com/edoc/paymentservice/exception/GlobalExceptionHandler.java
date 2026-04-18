package com.edoc.paymentservice.exception;

import com.edoc.paymentservice.constant.AppMessages;
import com.edoc.paymentservice.constant.ErrorCodes;
import com.edoc.paymentservice.dto.ErrorResponse;
import java.util.NoSuchElementException;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse("Validation failed");
        return build(HttpStatus.BAD_REQUEST, ErrorCodes.ERR_INTERNAL, message);
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException ex) {
        return build(HttpStatus.NOT_FOUND, ErrorCodes.ERR_NOT_FOUND, AppMessages.PAYMENT_NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleFallback(Exception ex) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCodes.ERR_INTERNAL, AppMessages.INTERNAL_ERROR);
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(new ErrorResponse(code, message, UUID.randomUUID().toString()));
    }
}

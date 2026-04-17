package com.edoc.paymentservice.client.appointment.payload;


public record PaymentSuccessRequest(
        String paymentStatus,  
        String paymentId      
) {
}

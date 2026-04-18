package com.edoc.paymentservice.service.bridge;

import com.edoc.paymentservice.model.Payment;

public interface PaymentNotificationService {

    void notifyPaymentSuccess(Payment payment);
}

package com.edoc.paymentservice.client.notification;

import com.edoc.paymentservice.model.Payment;


public interface NotificationClient {

    /**
     * Notify the notification-service that a payment completed successfully.
     *
     * @param payment the completed payment entity
     */
    void notifyPaymentSuccess(Payment payment);
}

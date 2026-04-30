package com.edoc.paymentservice.client.appointment;

import com.edoc.paymentservice.model.Payment;


public interface AppointmentClient {

    /**
     * Notify the appointment-service that a payment completed successfully.
     *
     * @param payment the completed payment entity
     */
    void notifyPaymentSuccess(Payment payment);
}

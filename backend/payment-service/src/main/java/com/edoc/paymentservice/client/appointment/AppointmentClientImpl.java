package com.edoc.paymentservice.client.appointment;

import com.edoc.paymentservice.client.appointment.payload.PaymentSuccessRequest;
import com.edoc.paymentservice.constant.PaymentConstants;
import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.model.PaymentTransactionLog;
import com.edoc.paymentservice.repository.TransactionLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;


@Slf4j
@Component
@RequiredArgsConstructor
public class AppointmentClientImpl implements AppointmentClient {

    private final RestClient restClient;
    private final TransactionLogRepository transactionLogRepository;

    @Value("${app.appointment-service.notify-path:/api/v1/appointments/payments/notify-success}")
    private String notifyPath;

    @Override
    public void notifyPaymentSuccess(Payment payment) {
        PaymentSuccessRequest payload = new PaymentSuccessRequest(
                payment.getId(),
                payment.getAppointmentId(),
                payment.getStatus().name());

        String payloadJson = buildPayloadJson(payment);

        try {
            log.info("Sending payment success notification for paymentId={} to path={}",
                    payment.getId(), notifyPath);

            restClient.post()
                    .uri(notifyPath)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();

            transactionLogRepository.save(PaymentTransactionLog.builder()
                    .payment(payment)
                    .event(PaymentConstants.EVENT_REST_NOTIFY_SENT)
                    .rawPayload(payloadJson)
                    .build());

            log.info("Successfully notified appointment-service for paymentId={}", payment.getId());

        } catch (RestClientException ex) {
            log.warn("Appointment-service notification failed for paymentId={}: {}",
                    payment.getId(), ex.getMessage());

            transactionLogRepository.save(PaymentTransactionLog.builder()
                    .payment(payment)
                    .event(PaymentConstants.EVENT_REST_NOTIFY_FAILED)
                    .rawPayload(payloadJson)
                    .build());

            transactionLogRepository.save(PaymentTransactionLog.builder()
                    .payment(payment)
                    .event(PaymentConstants.EVENT_RECONCILE_FLAGGED)
                    .rawPayload("{\"reason\":\"APPOINTMENT_SERVICE_UNAVAILABLE\"}")
                    .build());
        }
    }

    private String buildPayloadJson(Payment payment) {
        return "{\"paymentId\":\"" + payment.getId()
                + "\",\"appointmentId\":" + payment.getAppointmentId()
                + ",\"status\":\"" + payment.getStatus().name() + "\"}";
    }
}

package com.edoc.paymentservice.service.bridge;

import com.edoc.paymentservice.constant.PayHereConstants;
import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.model.PaymentTransactionLog;
import com.edoc.paymentservice.repository.TransactionLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.notification.provider", havingValue = "rest", matchIfMissing = true)
public class RestClientNotificationServiceImpl implements PaymentNotificationService {

    private final RestClient restClient;
    private final TransactionLogRepository transactionLogRepository;

        @Value("${app.appointment-service.notify-path:/api/v1/appointments/payments/notify-success}")
    private String notifyPath;

    @Override
    public void notifyPaymentSuccess(Payment payment) {
        PaymentSuccessNotification payload = new PaymentSuccessNotification(
                payment.getId(),
                payment.getAppointmentId(),
                payment.getStatus().name());

        try {
            log.info("Sending payment success notification for paymentId={} to path={}", payment.getId(), notifyPath);
            restClient.post()
                    .uri(notifyPath)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();

            String payloadJson = "{\"paymentId\":\"" + payment.getId()
                    + "\",\"appointmentId\":" + payment.getAppointmentId()
                    + ",\"status\":\"" + payment.getStatus().name() + "\"}";
            transactionLogRepository.save(PaymentTransactionLog.builder()
                    .payment(payment)
                    .event(PayHereConstants.EVENT_REST_NOTIFY_SENT)
                    .rawPayload(payloadJson)
                    .build());

            log.info("Successfully notified appointment service for paymentId={}", payment.getId());
        } catch (RestClientException ex) {
            log.warn("Appointment service notification failed for paymentId={}: {}", payment.getId(), ex.getMessage());

            String payloadJson = "{\"paymentId\":\"" + payment.getId()
                    + "\",\"appointmentId\":" + payment.getAppointmentId()
                    + ",\"status\":\"" + payment.getStatus().name() + "\"}";
            transactionLogRepository.save(PaymentTransactionLog.builder()
                    .payment(payment)
                    .event(PayHereConstants.EVENT_REST_NOTIFY_FAILED)
                    .rawPayload(payloadJson)
                    .build());
            transactionLogRepository.save(PaymentTransactionLog.builder()
                    .payment(payment)
                    .event(PayHereConstants.EVENT_RECONCILE_FLAGGED)
                    .rawPayload("{\"reason\":\"APPOINTMENT_SERVICE_UNAVAILABLE\"}")
                    .build());
        }
    }
}

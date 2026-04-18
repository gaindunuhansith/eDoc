package com.edoc.paymentservice.service.bridge;

import com.edoc.paymentservice.constant.PayHereConstants;
import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.model.PaymentTransactionLog;
import com.edoc.paymentservice.repository.TransactionLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class RestClientNotificationServiceImpl implements PaymentNotificationService {

    private final RestClient restClient;
    private final TransactionLogRepository transactionLogRepository;

    @Value("${app.appointment-service.notify-path:/api/v1/internal/payments/notify-success}")
    private String notifyPath;

    @Override
    public void notifyPaymentSuccess(Payment payment) {
        String payload = "{\"paymentId\":\"" + payment.getId()
                + "\",\"appointmentId\":" + payment.getAppointmentId()
                + ",\"status\":\"" + payment.getStatus().name() + "\"}";

        try {
            restClient.post()
                    .uri(notifyPath)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
            transactionLogRepository.save(PaymentTransactionLog.builder()
                    .payment(payment)
                    .event(PayHereConstants.EVENT_REST_NOTIFY_SENT)
                    .rawPayload(payload)
                    .build());
        } catch (Exception ex) {
            log.error("Failed to notify appointment service for paymentId={}", payment.getId(), ex);
            transactionLogRepository.save(PaymentTransactionLog.builder()
                    .payment(payment)
                    .event(PayHereConstants.EVENT_REST_NOTIFY_FAILED)
                    .rawPayload(payload)
                    .build());
            transactionLogRepository.save(PaymentTransactionLog.builder()
                    .payment(payment)
                    .event(PayHereConstants.EVENT_RECONCILE_FLAGGED)
                    .rawPayload("{\"reason\":\"APPOINTMENT_SERVICE_UNAVAILABLE\"}")
                    .build());
        }
    }
}

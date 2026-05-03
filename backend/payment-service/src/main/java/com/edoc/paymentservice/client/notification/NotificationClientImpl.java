package com.edoc.paymentservice.client.notification;

import com.edoc.paymentservice.client.notification.payload.NotificationRequest;
import com.edoc.paymentservice.client.notification.payload.NotificationType;
import com.edoc.paymentservice.constant.PaymentConstants;
import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.model.PaymentTransactionLog;
import com.edoc.paymentservice.repository.TransactionLogRepository;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Slf4j
@Component
public class NotificationClientImpl implements NotificationClient {

    private final RestClient restClient;
    private final TransactionLogRepository transactionLogRepository;

    public NotificationClientImpl(
            @Qualifier("notificationRestClient") RestClient restClient,
            TransactionLogRepository transactionLogRepository) {
        this.restClient = restClient;
        this.transactionLogRepository = transactionLogRepository;
    }

    @Value("${app.notification-service.send-path:/api/v1/notifications/send}")
    private String sendPath;

    @Override
    public void notifyPaymentSuccess(Payment payment) {
        NotificationRequest payload = new NotificationRequest(
                NotificationType.PAYMENT_SUCCESS,
                null,
                null,
                payment.getUserId(),
                Map.of(
                        "amount", payment.getAmount(),
                        "currency", payment.getCurrency(),
                        "appointmentId", payment.getAppointmentId(),
                        "orderId", payment.getOrderId()
                )
        );

        try {
            log.info("Sending payment success notification for paymentId={} to notification-service",
                    payment.getId());

            restClient.post()
                    .uri(sendPath)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();

            transactionLogRepository.save(PaymentTransactionLog.builder()
                    .payment(payment)
                    .event(PaymentConstants.EVENT_NOTIFICATION_SENT)
                    .rawPayload("{\"type\":\"PAYMENT_SUCCESS\",\"userId\":" + payment.getUserId() + "}")
                    .build());

            log.info("Successfully notified notification-service for paymentId={}", payment.getId());

        } catch (RestClientException ex) {
            log.warn("Notification-service failed for paymentId={}: {}",
                    payment.getId(), ex.getMessage());

            transactionLogRepository.save(PaymentTransactionLog.builder()
                    .payment(payment)
                    .event(PaymentConstants.EVENT_NOTIFICATION_FAILED)
                    .rawPayload("{\"error\":\"" + ex.getMessage() + "\"}")
                    .build());
        }
    }
}

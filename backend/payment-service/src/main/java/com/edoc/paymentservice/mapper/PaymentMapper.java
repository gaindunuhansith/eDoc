package com.edoc.paymentservice.mapper;

import com.edoc.paymentservice.dto.PaymentDetailResponse;
import com.edoc.paymentservice.dto.PaymentHistoryResponse;
import com.edoc.paymentservice.dto.TransactionLogEntryResponse;
import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.model.PaymentTransactionLog;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    PaymentHistoryResponse toHistoryResponse(Payment payment);

    default PaymentDetailResponse toDetailResponse(Payment payment, List<PaymentTransactionLog> logs) {
        List<TransactionLogEntryResponse> entries = logs == null
                ? List.of()
                : logs.stream()
                        .map(log -> new TransactionLogEntryResponse(
                                log.getId(),
                                log.getEvent(),
                                log.getRawPayload(),
                                log.getCreatedAt()))
                        .toList();

        return new PaymentDetailResponse(
                payment.getId(),
                payment.getAppointmentId(),
                payment.getUserId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus(),
                payment.getOrderId(),
                payment.getPayhereId(),
                payment.getCreatedAt(),
                payment.getUpdatedAt(),
                entries);
    }
}

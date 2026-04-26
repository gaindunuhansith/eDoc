package com.edoc.paymentservice.mapper;

import com.edoc.paymentservice.payload.response.PaymentDetailResponse;
import com.edoc.paymentservice.payload.response.PaymentHistoryResponse;
import com.edoc.paymentservice.payload.response.TransactionLogEntryResponse;
import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.model.PaymentTransactionLog;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    PaymentHistoryResponse toHistoryResponse(Payment payment);

    TransactionLogEntryResponse toTransactionLogEntryResponse(PaymentTransactionLog transactionLog);

    List<TransactionLogEntryResponse> toTransactionLogEntryResponseList(List<PaymentTransactionLog> logs);

    @Mapping(target = "transactionLogs", source = "logs")
    PaymentDetailResponse toDetailResponse(Payment payment, List<PaymentTransactionLog> logs);
}

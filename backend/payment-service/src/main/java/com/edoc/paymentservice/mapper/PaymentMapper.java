package com.edoc.paymentservice.mapper;

import com.edoc.paymentservice.model.BillingDetails;
import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.model.PaymentTransactionLog;
import com.edoc.paymentservice.payload.response.BillingResponse;
import com.edoc.paymentservice.payload.response.PaymentDetailResponse;
import com.edoc.paymentservice.payload.response.PaymentHistoryResponse;
import com.edoc.paymentservice.payload.response.TransactionLogEntryResponse;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    PaymentHistoryResponse toHistoryResponse(Payment payment);

    TransactionLogEntryResponse toTransactionLogEntryResponse(PaymentTransactionLog transactionLog);

    List<TransactionLogEntryResponse> toTransactionLogEntryResponseList(List<PaymentTransactionLog> logs);

    BillingResponse toBillingResponse(BillingDetails billingDetails);

    @Mapping(target = "transactionLogs", source = "logs")
    @Mapping(target = "billing", source = "billing")
    @Mapping(target = "id", source = "payment.id")
    @Mapping(target = "createdAt", source = "payment.createdAt")
    PaymentDetailResponse toDetailResponse(Payment payment, List<PaymentTransactionLog> logs, BillingDetails billing);
}


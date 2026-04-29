package com.edoc.paymentservice.service;

import java.io.IOException;
import java.util.UUID;

public interface InvoiceService {

    byte[] generateInvoice(UUID paymentId, Long userId, boolean isAdmin) throws IOException;
}

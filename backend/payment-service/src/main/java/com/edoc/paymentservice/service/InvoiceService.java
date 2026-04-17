package com.edoc.paymentservice.service;

import java.io.IOException;
import java.util.UUID;

public interface InvoiceService {

    byte[] generateInvoice(UUID paymentId, String userId, boolean isAdmin) throws IOException;
}

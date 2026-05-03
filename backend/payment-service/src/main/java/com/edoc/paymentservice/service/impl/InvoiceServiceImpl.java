package com.edoc.paymentservice.service.impl;

import com.edoc.paymentservice.constant.PaymentConstants;
import com.edoc.paymentservice.model.BillingDetails;
import com.edoc.paymentservice.model.Payment;
import com.edoc.paymentservice.model.PaymentTransactionLog;
import com.edoc.paymentservice.repository.BillingDetailsRepository;
import com.edoc.paymentservice.repository.TransactionLogRepository;
import com.edoc.paymentservice.service.InvoiceService;
import com.edoc.paymentservice.service.PaymentService;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm 'UTC'")
                    .withZone(ZoneId.of("UTC"));

    private static final DeviceRgb BRAND_BLUE  = new DeviceRgb(30, 90, 180);
    private static final DeviceRgb LIGHT_GRAY  = new DeviceRgb(245, 245, 245);
    private static final DeviceRgb DIVIDER_GRAY = new DeviceRgb(210, 210, 210);

    private final PaymentService paymentService;
    private final BillingDetailsRepository billingDetailsRepository;
    private final TransactionLogRepository transactionLogRepository;

    @Override
    @Transactional
    public byte[] generateInvoice(UUID paymentId, String userId, boolean isAdmin) throws IOException {
        Payment payment = paymentService.getPaymentEntityById(paymentId);

        if (!isAdmin && !payment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Payment not found");
        }

        BillingDetails billing = billingDetailsRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Billing details not found for this payment"));

        byte[] pdf = buildInvoicePdf(payment, billing);

        transactionLogRepository.save(PaymentTransactionLog.builder()
                .payment(payment)
                .event(PaymentConstants.EVENT_INVOICE_GENERATED)
                .rawPayload("{\"requestedByUserId\":\"" + userId + "\",\"paymentId\":\"" + paymentId + "\"}")
                .build());

        log.info("Invoice generated for paymentId={} by userId={}", paymentId, userId);

        return pdf;
    }


    private byte[] buildInvoicePdf(Payment payment, BillingDetails billing) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (PdfDocument pdf = new PdfDocument(new PdfWriter(baos));
             Document doc = new Document(pdf, PageSize.A4)) {

            doc.setMargins(40, 50, 40, 50);

            PdfFont bold   = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont normal = PdfFontFactory.createFont(StandardFonts.HELVETICA);

            Table header = new Table(UnitValue.createPercentArray(new float[]{1}))
                    .setWidth(UnitValue.createPercentValue(100));
            Cell headerCell = new Cell()
                    .add(new Paragraph("eDoc")
                            .setFont(bold).setFontSize(26).setFontColor(ColorConstants.WHITE))
                    .add(new Paragraph("Medical Appointment Invoice")
                            .setFont(normal).setFontSize(11).setFontColor(ColorConstants.WHITE))
                    .setBackgroundColor(BRAND_BLUE)
                    .setPadding(18)
                    .setBorder(Border.NO_BORDER);
            header.addCell(headerCell);
            doc.add(header);

            doc.add(new Paragraph("\n"));

            Table meta = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                    .setWidth(UnitValue.createPercentValue(100));

            meta.addCell(labelCell("Order ID", normal).setBorder(Border.NO_BORDER));
            meta.addCell(valueCell(payment.getOrderId(), bold).setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));

            meta.addCell(labelCell("Date", normal).setBorder(Border.NO_BORDER));
            meta.addCell(valueCell(DATE_FMT.format(payment.getCreatedAt()), normal)
                    .setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));

            meta.addCell(labelCell("Status", normal).setBorder(Border.NO_BORDER));
            meta.addCell(valueCell(payment.getStatus().name(), bold)
                    .setFontColor(statusColor(payment.getStatus().name()))
                    .setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));

            if (payment.getPayhereId() != null) {
                meta.addCell(labelCell("PayHere ID", normal).setBorder(Border.NO_BORDER));
                meta.addCell(valueCell(payment.getPayhereId(), normal)
                        .setTextAlignment(TextAlignment.RIGHT).setBorder(Border.NO_BORDER));
            }
            doc.add(meta);

            doc.add(divider());
            doc.add(new Paragraph("\n").setMarginBottom(4));

            doc.add(new Paragraph("BILL TO")
                    .setFont(bold).setFontSize(9).setFontColor(BRAND_BLUE));

            Table billTo = new Table(UnitValue.createPercentArray(new float[]{1}))
                    .setWidth(UnitValue.createPercentValue(55))
                    .setBackgroundColor(LIGHT_GRAY)
                    .setBorder(Border.NO_BORDER);

            billTo.addCell(new Cell()
                    .add(new Paragraph(billing.getFullName()).setFont(bold).setFontSize(12))
                    .add(new Paragraph(billing.getEmail()).setFont(normal).setFontSize(10))
                    .add(new Paragraph(billing.getPhone()).setFont(normal).setFontSize(10))
                    .add(addressParagraph(billing, normal))
                    .setBorder(Border.NO_BORDER)
                    .setBackgroundColor(LIGHT_GRAY)
                    .setPadding(10));
            doc.add(billTo);

            doc.add(new Paragraph("\n"));

            Table items = new Table(UnitValue.createPercentArray(new float[]{5, 2, 2}))
                    .setWidth(UnitValue.createPercentValue(100));

            String[] headers = {"Description", "Qty", "Amount"};
            for (String h : headers) {
                items.addHeaderCell(new Cell()
                        .add(new Paragraph(h).setFont(bold).setFontSize(10).setFontColor(ColorConstants.WHITE))
                        .setBackgroundColor(BRAND_BLUE)
                        .setBorder(Border.NO_BORDER)
                        .setPaddingTop(6).setPaddingBottom(6).setPaddingLeft(8).setPaddingRight(8));
            }

            String desc = "Appointment #" + payment.getAppointmentId() + " — Medical Consultation";
            String amount = payment.getCurrency().name() + " " +
                    String.format("%,.2f", payment.getAmount());

            items.addCell(lineCell(desc, normal));
            items.addCell(lineCell("1", normal).setTextAlignment(TextAlignment.CENTER));
            items.addCell(lineCell(amount, normal).setTextAlignment(TextAlignment.RIGHT));

            doc.add(items);

            Table total = new Table(UnitValue.createPercentArray(new float[]{5, 4}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setHorizontalAlignment(HorizontalAlignment.RIGHT);

            total.addCell(new Cell()
                    .add(new Paragraph("Total Due").setFont(bold).setFontSize(12)
                            .setFontColor(BRAND_BLUE).setTextAlignment(TextAlignment.RIGHT))
                    .setBorderTop(new SolidBorder(BRAND_BLUE, 1.5f))
                    .setBorderBottom(Border.NO_BORDER).setBorderLeft(Border.NO_BORDER)
                    .setBorderRight(Border.NO_BORDER)
                    .setPadding(8));

            total.addCell(new Cell()
                    .add(new Paragraph(amount).setFont(bold).setFontSize(14)
                            .setFontColor(BRAND_BLUE).setTextAlignment(TextAlignment.RIGHT))
                    .setBorderTop(new SolidBorder(BRAND_BLUE, 1.5f))
                    .setBorderBottom(Border.NO_BORDER).setBorderLeft(Border.NO_BORDER)
                    .setBorderRight(Border.NO_BORDER)
                    .setPadding(8));

            doc.add(total);

            doc.add(divider());
            doc.add(new Paragraph("Thank you for choosing eDoc for your healthcare needs.")
                    .setFont(normal).setFontSize(9).setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER).setMarginTop(8));
        }

        return baos.toByteArray();
    }


    private Cell labelCell(String text, PdfFont font) {
        return new Cell().add(new Paragraph(text).setFont(font).setFontSize(10)
                .setFontColor(ColorConstants.GRAY)).setPaddingTop(2).setPaddingBottom(2);
    }

    private Cell valueCell(String text, PdfFont font) {
        return new Cell().add(new Paragraph(text).setFont(font).setFontSize(10))
                .setPaddingTop(2).setPaddingBottom(2);
    }

    private Cell lineCell(String text, PdfFont font) {
        return new Cell()
                .add(new Paragraph(text).setFont(font).setFontSize(10))
                .setBorderLeft(Border.NO_BORDER).setBorderRight(Border.NO_BORDER)
                .setBorderTop(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(DIVIDER_GRAY, 0.5f))
                .setPaddingTop(6).setPaddingBottom(6).setPaddingLeft(8).setPaddingRight(8);
    }

    private Paragraph addressParagraph(BillingDetails b, PdfFont font) {
        StringBuilder sb = new StringBuilder();
        if (b.getAddress() != null && !b.getAddress().isBlank()) sb.append(b.getAddress()).append(", ");
        if (b.getCity() != null && !b.getCity().isBlank()) sb.append(b.getCity()).append(", ");
        sb.append(b.getCountry());
        return new Paragraph(sb.toString()).setFont(font).setFontSize(10);
    }

    private Table divider() {
        Table line = new Table(UnitValue.createPercentArray(new float[]{1}))
                .setWidth(UnitValue.createPercentValue(100));
        line.addCell(new Cell().setBorderTop(new SolidBorder(DIVIDER_GRAY, 0.8f))
                .setBorderBottom(Border.NO_BORDER).setBorderLeft(Border.NO_BORDER)
                .setBorderRight(Border.NO_BORDER).setPadding(0));
        return line;
    }

    private DeviceRgb statusColor(String status) {
        return switch (status) {
            case "SUCCESS" -> new DeviceRgb(34, 139, 34);
            case "FAILED"  -> new DeviceRgb(200, 30, 30);
            default        -> new DeviceRgb(200, 130, 0);
        };
    }
}

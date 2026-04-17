package com.edoc.notificationservice.service;

import com.edoc.notificationservice.client.DoctorServiceClient;
import com.edoc.notificationservice.client.PatientServiceClient;
import com.edoc.notificationservice.client.UserServiceClient;
import org.springframework.stereotype.Service;

import com.edoc.notificationservice.dto.EmailNotificationRequest;
import com.edoc.notificationservice.dto.NotificationResponse;
import com.edoc.notificationservice.dto.SmsNotificationRequest;
import com.edoc.notificationservice.model.NotificationChannel;
import com.edoc.notificationservice.model.NotificationLog;
import com.edoc.notificationservice.model.NotificationStatus;
import com.edoc.notificationservice.repository.NotificationLogRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import com.edoc.notificationservice.dto.NotificationRequestDTO;
import com.edoc.notificationservice.dto.NotificationType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final ResendEmailClient resendEmailClient;
    private final VonageSmsClient vonageSmsClient;
    private final NotificationLogRepository notificationLogRepository;
    private final PatientServiceClient patientServiceClient;
    private final UserServiceClient userServiceClient;
    private final DoctorServiceClient doctorServiceClient;
    private final UserNotificationService userNotificationService;

    public NotificationService(ResendEmailClient resendEmailClient,
                               VonageSmsClient vonageSmsClient,
                               NotificationLogRepository notificationLogRepository,
                               PatientServiceClient patientServiceClient,
                               UserServiceClient userServiceClient,
                               DoctorServiceClient doctorServiceClient,
                               UserNotificationService userNotificationService) {
        this.resendEmailClient = resendEmailClient;
        this.vonageSmsClient = vonageSmsClient;
        this.notificationLogRepository = notificationLogRepository;
        this.patientServiceClient = patientServiceClient;
        this.userServiceClient = userServiceClient;
        this.doctorServiceClient = doctorServiceClient;
        this.userNotificationService = userNotificationService;
    }

    public NotificationResponse send(NotificationRequestDTO request) {
        if (request == null || request.type() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Notification type is required.");
        }

        // Resolve email and phone from the provided ID
        String email = null;
        String phone = null;
        String inboxUserId = null; // JWT uid (UUID) for the patient inbox

        if (request.patientId() != null) {
            Map<?, ?> patientData = patientServiceClient.getPatientById(request.patientId());
            if (patientData != null) {
                phone = patientData.get("phone") instanceof String s ? s : null;
                Object userIdObj = patientData.get("userId");
                if (userIdObj != null) {
                    inboxUserId = userIdObj.toString();
                    UserServiceClient.UserContact user = userServiceClient.getUserById(inboxUserId);
                    if (user != null) email = user.email();
                }
            }
        } else if (request.doctorId() != null) {
            DoctorServiceClient.DoctorContact doctor = doctorServiceClient.getDoctorById(request.doctorId());
            if (doctor != null) {
                email = doctor.email();
                phone = doctor.phoneNumber();
            }
        } else if (request.userId() != null) {
            UserServiceClient.UserContact user = userServiceClient.getUserById(request.userId().toString());
            if (user != null) email = user.email();
        }

        if ((email == null || email.isBlank()) && (phone == null || phone.isBlank()) && inboxUserId == null) {
            logger.warn("No contact info resolved for notification type={}, patientId={}, doctorId={}, userId={}",
                    request.type(), request.patientId(), request.doctorId(), request.userId());
            return new NotificationResponse("FAILED", null, "No contact information could be resolved.");
        }

        String subject = buildSubject(request.type());
        String message = buildMessage(request.type(), request.data());

        // Persist a user-facing inbox notification for patients regardless of email/SMS outcome.
        if (inboxUserId != null) {
            try {
                userNotificationService.create(inboxUserId, request.type().name(), subject, message);
            } catch (Exception ex) {
                logger.warn("Failed to create inbox notification for userId={}: {}", inboxUserId, ex.getMessage());
            }
        }

        if ((email == null || email.isBlank()) && (phone == null || phone.isBlank())) {
            // Inbox record was created but no email/SMS channel is available.
            return new NotificationResponse("PARTIAL_SUCCESS", null, "Inbox notification created; no email/SMS contact found.");
        }

        boolean emailRequested = email != null && !email.isBlank();
        boolean smsRequested = phone != null && !phone.isBlank();

        NotificationResponse emailResponse = null;
        NotificationResponse smsResponse = null;

        if (emailRequested) {
            emailResponse = sendEmail(new EmailNotificationRequest(email, subject, message));
        }

        if (smsRequested) {
            smsResponse = sendSms(new SmsNotificationRequest(phone, message));
        }

        int successCount = 0;
        int attemptedCount = 0;
        List<String> messageIds = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        if (emailRequested) {
            attemptedCount++;
            if (emailResponse != null && "SUCCESS".equals(emailResponse.status())) {
                successCount++;
            }
            if (emailResponse != null && emailResponse.messageId() != null && !emailResponse.messageId().isBlank()) {
                messageIds.add("EMAIL:" + emailResponse.messageId());
            }
            if (emailResponse != null && emailResponse.error() != null && !emailResponse.error().isBlank()) {
                errors.add("EMAIL:" + emailResponse.error());
            }
        }

        if (smsRequested) {
            attemptedCount++;
            if (smsResponse != null && "SUCCESS".equals(smsResponse.status())) {
                successCount++;
            }
            if (smsResponse != null && smsResponse.messageId() != null && !smsResponse.messageId().isBlank()) {
                messageIds.add("SMS:" + smsResponse.messageId());
            }
            if (smsResponse != null && smsResponse.error() != null && !smsResponse.error().isBlank()) {
                errors.add("SMS:" + smsResponse.error());
            }
        }

        String finalStatus;
        if (successCount == attemptedCount) {
            finalStatus = "SUCCESS";
        } else if (successCount > 0) {
            finalStatus = "PARTIAL_SUCCESS";
        } else {
            finalStatus = "FAILED";
        }

        String combinedMessageId = messageIds.isEmpty() ? null : String.join(";", messageIds);
        String combinedError = errors.isEmpty() ? null : String.join(" | ", errors);
        logger.info("Unified notification processed: type={}, status={}, emailRequested={}, smsRequested={}",
            request.type(), finalStatus, emailRequested, smsRequested);
        return new NotificationResponse(finalStatus, combinedMessageId, combinedError);
    }

    public NotificationResponse sendEmail(EmailNotificationRequest request) {
        // Send email and persist a notification audit log.
        ResendSendResult result = resendEmailClient.sendEmail(request.to(), request.subject(), request.body());

        NotificationLog log = new NotificationLog();
        log.setRecipient(request.to());
        log.setChannel(NotificationChannel.EMAIL);
        log.setSubject(request.subject());
        log.setMessage(request.body());
        log.setStatus(result.success() ? NotificationStatus.SUCCESS : NotificationStatus.FAILED);
        log.setProviderMessageId(result.messageId());
        log.setErrorMessage(result.error());
        notificationLogRepository.save(log);

        if (result.success()) {
            logger.info("Email notification sent successfully to {}", request.to());
        } else {
            logger.warn("Email notification failed for {}: {}", request.to(), result.error());
        }

        return new NotificationResponse(
                result.success() ? "SUCCESS" : "FAILED",
                result.messageId(),
                result.error()
        );
    }

    public NotificationResponse sendSms(SmsNotificationRequest request) {
        // Send SMS and persist a notification audit log.
        SmsSendResult result = vonageSmsClient.sendSms(request.to(), request.text());

        NotificationLog log = new NotificationLog();
        log.setRecipient(request.to());
        log.setChannel(NotificationChannel.SMS);
        log.setMessage(request.text());
        log.setStatus(result.success() ? NotificationStatus.SUCCESS : NotificationStatus.FAILED);
        log.setProviderMessageId(result.messageId());
        log.setErrorMessage(result.error());
        notificationLogRepository.save(log);

        if (result.success()) {
            logger.info("SMS notification sent successfully to {}", request.to());
        } else {
            logger.warn("SMS notification failed for {}: {}", request.to(), result.error());
        }

        return new NotificationResponse(
                result.success() ? "SUCCESS" : "FAILED",
                result.messageId(),
                result.error()
        );
    }

    private String buildSubject(NotificationType type) {
        return switch (type) {
            case APPOINTMENT_BOOKED -> "Appointment Booked";
            case APPOINTMENT_CONFIRMED -> "Appointment Confirmed";
            case APPOINTMENT_REJECTED -> "Appointment Rejected";
            case APPOINTMENT_CANCELLED -> "Appointment Cancelled";
            case APPOINTMENT_COMPLETED -> "Consultation Completed";
            case FEEDBACK_RECEIVED -> "New Feedback Received";
            case PAYMENT_SUCCESS -> "Payment Confirmation";
        };
    }

    private String buildMessage(NotificationType type, Map<String, Object> data) {
        return switch (type) {
            case APPOINTMENT_BOOKED -> "Hello " + valueOrDefault(data, "recipientName", "there")
                    + ", your appointment with Dr. " + valueOrDefault(data, "doctorName", "your doctor")
                    + " on " + valueOrDefault(data, "date", "the scheduled date")
                    + " (" + valueOrDefault(data, "dayOfWeek", "") + ")"
                    + " at " + valueOrDefault(data, "timeSlot", "the scheduled time")
                    + " has been booked.";
            case APPOINTMENT_CONFIRMED -> "Hello " + valueOrDefault(data, "patientName", "there")
                    + ", your appointment on " + valueOrDefault(data, "date", "the scheduled date")
                    + " (" + valueOrDefault(data, "dayOfWeek", "") + ")"
                    + " at " + valueOrDefault(data, "timeSlot", "the scheduled time")
                    + " has been confirmed.";
            case APPOINTMENT_REJECTED -> "Hello " + valueOrDefault(data, "patientName", "there")
                    + ", unfortunately your appointment request with Dr. "
                    + valueOrDefault(data, "doctorName", "your doctor")
                    + " on " + valueOrDefault(data, "date", "the scheduled date")
                    + " (" + valueOrDefault(data, "dayOfWeek", "") + ")"
                    + " at " + valueOrDefault(data, "timeSlot", "the scheduled time")
                    + " has been rejected. Please book a new appointment.";
            case APPOINTMENT_CANCELLED -> "Hello " + valueOrDefault(data, "patientName", "there")
                    + ", your appointment on " + valueOrDefault(data, "date", "the scheduled date")
                    + " (" + valueOrDefault(data, "dayOfWeek", "") + ")"
                    + " at " + valueOrDefault(data, "timeSlot", "the scheduled time")
                    + " has been cancelled.";
            case APPOINTMENT_COMPLETED -> "Hello " + valueOrDefault(data, "recipientName", "there")
                    + ", your consultation on " + valueOrDefault(data, "date", "the scheduled date")
                    + " (" + valueOrDefault(data, "dayOfWeek", "") + ")"
                    + " at " + valueOrDefault(data, "timeSlot", "the scheduled time")
                    + " has been completed.";
            case FEEDBACK_RECEIVED -> "Dear Dr. " + valueOrDefault(data, "doctorName", "Doctor")
                    + ", you have received new feedback from a patient."
                    + " Rating: " + valueOrDefault(data, "rating", "N/A") + "/5."
                    + " Comment: " + valueOrDefault(data, "comment", "No comment provided.");
            case PAYMENT_SUCCESS -> "Your payment of Rs. "
                    + valueOrDefault(data, "amount", "0")
                    + " was successful.";
        };
    }

    private String valueOrDefault(Map<String, Object> data, String key, String defaultValue) {
        if (data == null) {
            return defaultValue;
        }
        Object value = data.get(key);
        return value == null ? defaultValue : String.valueOf(value);
    }
}

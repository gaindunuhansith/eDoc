-- ─────────────────────────────────────────────────────────────────────────────
-- Notification Service Seed Data
-- Database: notification_db (PostgreSQL)
-- DDL mode: create — Hibernate drops and recreates tables on every startup.
-- ─────────────────────────────────────────────────────────────────────────────
--
-- user_notifications: in-app notification inbox for patients and doctors.
--   user_id (VARCHAR) = user-service user_id (e.g. USR-PAT-03, USR-DOC-03)
--
-- notification_logs: delivery log for email/SMS channels.
--   recipient = email address or phone number
--   channel   = EMAIL | SMS
--   status    = SUCCESS | FAILED
--
-- Notification types (stored in the 'type' column):
--   APPOINTMENT_BOOKED, APPOINTMENT_CONFIRMED, APPOINTMENT_REJECTED,
--   APPOINTMENT_CANCELLED, APPOINTMENT_COMPLETED, PAYMENT_SUCCESS,
--   TELEMEDICINE_SESSION_STARTED, FEEDBACK_RECEIVED
--
-- Coverage: 20 representative appointments from the 40 seed appointments.
--   Active (SUCCESS) patient user IDs: USR-PAT-03..USR-PAT-16
--   Doctor user IDs (FEEDBACK_RECEIVED): USR-DOC-03..USR-DOC-15
-- ─────────────────────────────────────────────────────────────────────────────

DELETE FROM notification_logs;
DELETE FROM user_notifications;

-- ─────────────────────────────────────────────────────────────────────────────
-- Reference CTE shared across both inserts
-- ─────────────────────────────────────────────────────────────────────────────
-- Note: PostgreSQL does not support reusing CTEs across separate INSERT
-- statements. We use explicit VALUES to keep the seed self-contained.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── user_notifications ──────────────────────────────────────────────────────

INSERT INTO user_notifications (id, user_id, type, title, message, is_read, created_at)
VALUES

-- ── APT-SEED-1001 (PAT-03 → DOC-001, Cardiology, SUCCESS/COMPLETED) ─────────
(gen_random_uuid(), 'USR-PAT-03', 'APPOINTMENT_BOOKED',
 'Appointment Booked Successfully',
 'Your appointment with Dr. Chathuri Rathnayake (Cardiology) has been booked for slot 09:30-10:00. Appointment ID: APT-SEED-1001.',
 true, NOW() - INTERVAL '80 days'),

(gen_random_uuid(), 'USR-PAT-03', 'PAYMENT_SUCCESS',
 'Payment Confirmed',
 'Your payment of LKR 1,390.00 for appointment APT-SEED-1001 was successful. Order reference: ORD-2026-00001.',
 true, NOW() - INTERVAL '80 days' + INTERVAL '8 minutes'),

(gen_random_uuid(), 'USR-PAT-03', 'APPOINTMENT_COMPLETED',
 'Consultation Completed',
 'Your consultation with Dr. Chathuri Rathnayake has been completed. Your prescription is available on the eDoc platform.',
 true, NOW() - INTERVAL '79 days'),

-- ── APT-SEED-1002 (PAT-04 → DOC-002, Neurology, SUCCESS/COMPLETED) ──────────
(gen_random_uuid(), 'USR-PAT-04', 'APPOINTMENT_BOOKED',
 'Appointment Booked Successfully',
 'Your appointment with Dr. Dinesh Jayasuriya (Neurology) has been booked for slot 10:00-10:30. Appointment ID: APT-SEED-1002.',
 true, NOW() - INTERVAL '78 days'),

(gen_random_uuid(), 'USR-PAT-04', 'PAYMENT_SUCCESS',
 'Payment Confirmed',
 'Your payment of LKR 1,580.00 for appointment APT-SEED-1002 was successful. Order reference: ORD-2026-00002.',
 true, NOW() - INTERVAL '78 days' + INTERVAL '8 minutes'),

(gen_random_uuid(), 'USR-PAT-04', 'APPOINTMENT_COMPLETED',
 'Consultation Completed',
 'Your consultation with Dr. Dinesh Jayasuriya has been completed. Follow-up scheduled in 6 weeks.',
 true, NOW() - INTERVAL '77 days'),

-- ── APT-SEED-1003 (PAT-05 → DOC-003, Orthopedic, VIDEO/SUCCESS/COMPLETED) ───
(gen_random_uuid(), 'USR-PAT-05', 'APPOINTMENT_BOOKED',
 'Telemedicine Appointment Booked',
 'Your video consultation with Dr. Eranga Munasinghe (Orthopedic Surgery) has been booked for slot 10:30-11:00. Appointment ID: APT-SEED-1003.',
 true, NOW() - INTERVAL '76 days'),

(gen_random_uuid(), 'USR-PAT-05', 'PAYMENT_SUCCESS',
 'Payment Confirmed',
 'Your payment of LKR 1,770.00 for video appointment APT-SEED-1003 was successful. Order reference: ORD-2026-00003.',
 true, NOW() - INTERVAL '76 days' + INTERVAL '8 minutes'),

(gen_random_uuid(), 'USR-PAT-05', 'TELEMEDICINE_SESSION_STARTED',
 'Video Session Ready',
 'Your telemedicine session with Dr. Eranga Munasinghe is ready. Join at: https://video.edoc.lk/appointment-APT-SEED-1003',
 true, NOW() - INTERVAL '75 days'),

(gen_random_uuid(), 'USR-PAT-05', 'APPOINTMENT_COMPLETED',
 'Video Consultation Completed',
 'Your video consultation with Dr. Eranga Munasinghe has been completed. Prescription available on eDoc.',
 true, NOW() - INTERVAL '75 days' + INTERVAL '45 minutes'),

-- ── APT-SEED-1004 (PAT-06 → DOC-004, Pediatrics, SUCCESS/COMPLETED) ─────────
(gen_random_uuid(), 'USR-PAT-06', 'APPOINTMENT_BOOKED',
 'Appointment Booked Successfully',
 'Your appointment with Dr. Fathima Rizvi (Pediatrics) has been booked for slot 11:00-11:30. Appointment ID: APT-SEED-1004.',
 true, NOW() - INTERVAL '74 days'),

(gen_random_uuid(), 'USR-PAT-06', 'PAYMENT_SUCCESS',
 'Payment Confirmed',
 'Your payment of LKR 1,960.00 for appointment APT-SEED-1004 was successful. Order reference: ORD-2026-00004.',
 true, NOW() - INTERVAL '74 days' + INTERVAL '8 minutes'),

(gen_random_uuid(), 'USR-PAT-06', 'APPOINTMENT_COMPLETED',
 'Consultation Completed',
 'Your consultation with Dr. Fathima Rizvi has been completed. Child vaccination records updated.',
 true, NOW() - INTERVAL '73 days'),

-- ── APT-SEED-1005 (PAT-07 → DOC-005, Dermatology, VIDEO/PENDING/CONFIRMED) ──
(gen_random_uuid(), 'USR-PAT-07', 'APPOINTMENT_BOOKED',
 'Telemedicine Appointment Booked',
 'Your video consultation with Dr. Gayan Siriwardena (Dermatology) has been booked. Appointment ID: APT-SEED-1005. Payment pending.',
 false, NOW() - INTERVAL '72 days'),

-- ── APT-SEED-1006 (PAT-08 → DOC-006, Gynecology, SUCCESS/COMPLETED) ─────────
(gen_random_uuid(), 'USR-PAT-08', 'APPOINTMENT_BOOKED',
 'Appointment Booked Successfully',
 'Your appointment with Dr. Harshani Abeywickrama (Obstetrics & Gynecology) has been booked. Appointment ID: APT-SEED-1006.',
 true, NOW() - INTERVAL '70 days'),

(gen_random_uuid(), 'USR-PAT-08', 'PAYMENT_SUCCESS',
 'Payment Confirmed',
 'Your payment of LKR 2,340.00 for appointment APT-SEED-1006 was successful. Order reference: ORD-2026-00006.',
 true, NOW() - INTERVAL '70 days' + INTERVAL '8 minutes'),

(gen_random_uuid(), 'USR-PAT-08', 'APPOINTMENT_COMPLETED',
 'Consultation Completed',
 'Your consultation with Dr. Harshani Abeywickrama has been completed. Test results reviewed; prescription issued.',
 true, NOW() - INTERVAL '69 days'),

-- ── APT-SEED-1007 (PAT-09 → DOC-007, FAILED/CANCELLED) ──────────────────────
(gen_random_uuid(), 'USR-PAT-09', 'APPOINTMENT_BOOKED',
 'Telemedicine Appointment Booked',
 'Your video consultation with Dr. Ishan Peiris (Ophthalmology) has been booked. Appointment ID: APT-SEED-1007.',
 true, NOW() - INTERVAL '68 days'),

(gen_random_uuid(), 'USR-PAT-09', 'APPOINTMENT_CANCELLED',
 'Appointment Cancelled — Payment Failed',
 'Your appointment APT-SEED-1007 has been automatically cancelled because the payment could not be processed. Please rebook and try again.',
 true, NOW() - INTERVAL '68 days' + INTERVAL '30 minutes'),

-- ── APT-SEED-1008 (PAT-10 → DOC-008, General Medicine, SUCCESS/COMPLETED) ───
(gen_random_uuid(), 'USR-PAT-10', 'APPOINTMENT_BOOKED',
 'Appointment Booked Successfully',
 'Your appointment with Dr. Janaka Dassanayake (General Medicine) has been booked. Appointment ID: APT-SEED-1008.',
 true, NOW() - INTERVAL '66 days'),

(gen_random_uuid(), 'USR-PAT-10', 'PAYMENT_SUCCESS',
 'Payment Confirmed',
 'Your payment of LKR 2,720.00 for appointment APT-SEED-1008 was successful. Order reference: ORD-2026-00008.',
 true, NOW() - INTERVAL '66 days' + INTERVAL '8 minutes'),

(gen_random_uuid(), 'USR-PAT-10', 'APPOINTMENT_COMPLETED',
 'Consultation Completed',
 'Your consultation with Dr. Janaka Dassanayake has been completed. Diabetes management plan updated; HbA1c review in 3 months.',
 true, NOW() - INTERVAL '65 days'),

-- ── APT-SEED-1009 (PAT-11 → DOC-009, Psychiatry, VIDEO/SUCCESS/COMPLETED) ───
(gen_random_uuid(), 'USR-PAT-11', 'APPOINTMENT_BOOKED',
 'Telemedicine Appointment Booked',
 'Your video consultation with Dr. Kumari Samaraweera (Psychiatry) has been booked. Appointment ID: APT-SEED-1009.',
 true, NOW() - INTERVAL '64 days'),

(gen_random_uuid(), 'USR-PAT-11', 'PAYMENT_SUCCESS',
 'Payment Confirmed',
 'Your payment of LKR 2,910.00 for video appointment APT-SEED-1009 was successful. Order reference: ORD-2026-00009.',
 true, NOW() - INTERVAL '64 days' + INTERVAL '8 minutes'),

(gen_random_uuid(), 'USR-PAT-11', 'TELEMEDICINE_SESSION_STARTED',
 'Video Session Ready',
 'Your telemedicine session with Dr. Kumari Samaraweera is ready. Join at: https://video.edoc.lk/appointment-APT-SEED-1009',
 true, NOW() - INTERVAL '63 days'),

(gen_random_uuid(), 'USR-PAT-11', 'APPOINTMENT_COMPLETED',
 'Video Consultation Completed',
 'Your video consultation with Dr. Kumari Samaraweera has been completed. PHQ-9 score reviewed; medication adjusted.',
 true, NOW() - INTERVAL '63 days' + INTERVAL '60 minutes'),

-- ── APT-SEED-1011 (PAT-13 → DOC-011, Gastroenterology, VIDEO/SUCCESS/COMPLETED)
(gen_random_uuid(), 'USR-PAT-13', 'APPOINTMENT_BOOKED',
 'Telemedicine Appointment Booked',
 'Your video consultation with Dr. Malsha Wijesinghe (Gastroenterology) has been booked. Appointment ID: APT-SEED-1011.',
 true, NOW() - INTERVAL '60 days'),

(gen_random_uuid(), 'USR-PAT-13', 'PAYMENT_SUCCESS',
 'Payment Confirmed',
 'Your payment of LKR 3,290.00 for video appointment APT-SEED-1011 was successful. Order reference: ORD-2026-00011.',
 true, NOW() - INTERVAL '60 days' + INTERVAL '8 minutes'),

(gen_random_uuid(), 'USR-PAT-13', 'TELEMEDICINE_SESSION_STARTED',
 'Video Session Ready',
 'Your telemedicine session with Dr. Malsha Wijesinghe is ready. Join at: https://video.edoc.lk/appointment-APT-SEED-1011',
 true, NOW() - INTERVAL '59 days'),

-- ── APT-SEED-1012 (PAT-14 → DOC-012, Pulmonology, SUCCESS/COMPLETED) ─────────
(gen_random_uuid(), 'USR-PAT-14', 'APPOINTMENT_BOOKED',
 'Appointment Booked Successfully',
 'Your appointment with Dr. Nalaka Hettige (Pulmonology) has been booked. Appointment ID: APT-SEED-1012.',
 true, NOW() - INTERVAL '58 days'),

(gen_random_uuid(), 'USR-PAT-14', 'PAYMENT_SUCCESS',
 'Payment Confirmed',
 'Your payment of LKR 3,480.00 for appointment APT-SEED-1012 was successful. Order reference: ORD-2026-00012.',
 true, NOW() - INTERVAL '58 days' + INTERVAL '8 minutes'),

(gen_random_uuid(), 'USR-PAT-14', 'APPOINTMENT_COMPLETED',
 'Consultation Completed',
 'Your consultation with Dr. Nalaka Hettige has been completed. Spirometry results reviewed; inhaler technique corrected.',
 true, NOW() - INTERVAL '57 days'),

-- ── APT-SEED-1013 (PAT-15 → DOC-013, ENT, VIDEO/SUCCESS/COMPLETED) ───────────
(gen_random_uuid(), 'USR-PAT-15', 'APPOINTMENT_BOOKED',
 'Telemedicine Appointment Booked',
 'Your video consultation with Dr. Oshadi Sampath (ENT) has been booked. Appointment ID: APT-SEED-1013.',
 true, NOW() - INTERVAL '56 days'),

(gen_random_uuid(), 'USR-PAT-15', 'PAYMENT_SUCCESS',
 'Payment Confirmed',
 'Your payment of LKR 3,670.00 for video appointment APT-SEED-1013 was successful. Order reference: ORD-2026-00013.',
 true, NOW() - INTERVAL '56 days' + INTERVAL '8 minutes'),

(gen_random_uuid(), 'USR-PAT-15', 'TELEMEDICINE_SESSION_STARTED',
 'Video Session Ready',
 'Your telemedicine session with Dr. Oshadi Sampath is ready. Join at: https://video.edoc.lk/appointment-APT-SEED-1013',
 true, NOW() - INTERVAL '55 days'),

(gen_random_uuid(), 'USR-PAT-15', 'APPOINTMENT_COMPLETED',
 'Video Consultation Completed',
 'Your video consultation with Dr. Oshadi Sampath has been completed. Nasal endoscopy findings discussed; follow-up CT in 6 months.',
 true, NOW() - INTERVAL '55 days' + INTERVAL '35 minutes'),

-- ── Feedback notifications to doctors ────────────────────────────────────────
(gen_random_uuid(), 'USR-DOC-03', 'FEEDBACK_RECEIVED',
 'New Patient Feedback Received',
 'A patient has submitted feedback for appointment APT-SEED-1001. Rating: 5/5 — "Outstanding consultation." View on your dashboard.',
 false, NOW() - INTERVAL '79 days' + INTERVAL '18 hours'),

(gen_random_uuid(), 'USR-DOC-04', 'FEEDBACK_RECEIVED',
 'New Patient Feedback Received',
 'A patient has submitted feedback for appointment APT-SEED-1002. Rating: 4/5. View on your dashboard.',
 false, NOW() - INTERVAL '77 days' + INTERVAL '18 hours'),

(gen_random_uuid(), 'USR-DOC-05', 'FEEDBACK_RECEIVED',
 'New Patient Feedback Received',
 'A patient has submitted feedback for appointment APT-SEED-1003. Rating: 5/5. View on your dashboard.',
 true, NOW() - INTERVAL '75 days' + INTERVAL '18 hours'),

(gen_random_uuid(), 'USR-DOC-07', 'FEEDBACK_RECEIVED',
 'New Patient Feedback Received',
 'A patient has submitted feedback for appointment APT-SEED-1006. Rating: 5/5. View on your dashboard.',
 true, NOW() - INTERVAL '69 days' + INTERVAL '18 hours'),

(gen_random_uuid(), 'USR-DOC-11', 'FEEDBACK_RECEIVED',
 'New Patient Feedback Received',
 'A patient has submitted feedback for appointment APT-SEED-1009. Rating: 5/5 — "The telemedicine format saved me hours of travel." View on your dashboard.',
 false, NOW() - INTERVAL '63 days' + INTERVAL '18 hours'),

(gen_random_uuid(), 'USR-DOC-13', 'FEEDBACK_RECEIVED',
 'New Patient Feedback Received',
 'A patient has submitted feedback for appointment APT-SEED-1011. Rating: 4/5. View on your dashboard.',
 false, NOW() - INTERVAL '59 days' + INTERVAL '18 hours'),

-- ── Recent unread notifications ───────────────────────────────────────────────
(gen_random_uuid(), 'USR-PAT-03', 'APPOINTMENT_BOOKED',
 'Appointment Booked Successfully',
 'Your appointment with Dr. Chathuri Rathnayake (Cardiology) has been booked for Paroxysmal AF follow-up. Appointment ID: APT-SEED-1027.',
 false, NOW() - INTERVAL '24 days'),

(gen_random_uuid(), 'USR-PAT-03', 'PAYMENT_SUCCESS',
 'Payment Confirmed',
 'Your payment for appointment APT-SEED-1027 was successful. Your prescription is being prepared.',
 false, NOW() - INTERVAL '24 days' + INTERVAL '8 minutes'),

(gen_random_uuid(), 'USR-PAT-12', 'APPOINTMENT_BOOKED',
 'Appointment Booked Successfully',
 'Your appointment with Dr. Lasitha Athukorala (Endocrinology) has been booked. Appointment ID: APT-SEED-1023.',
 false, NOW() - INTERVAL '36 days'),

(gen_random_uuid(), 'USR-PAT-15', 'APPOINTMENT_BOOKED',
 'Appointment Booked Successfully',
 'Your appointment with Dr. Gayan Siriwardena (Dermatology) has been booked for acne review. Appointment ID: APT-SEED-1026.',
 false, NOW() - INTERVAL '25 days'),

(gen_random_uuid(), 'USR-PAT-15', 'PAYMENT_SUCCESS',
 'Payment Confirmed',
 'Your payment for appointment APT-SEED-1026 was successful. Order reference: ORD-2026-00026.',
 false, NOW() - INTERVAL '25 days' + INTERVAL '8 minutes'),

-- ── APT-SEED-1041 (Lehan, Orthopedic Surgery, SUCCESS/COMPLETED) ────────────
(gen_random_uuid(), 'USR-PAT-16', 'APPOINTMENT_BOOKED',
 'Appointment Booked Successfully',
 'Your appointment with Dr. Eranga Munasinghe (Orthopedic Surgery) has been booked for slot 10:00-10:30. Appointment ID: APT-SEED-1041.',
 false, NOW() - INTERVAL '7 days'),

(gen_random_uuid(), 'USR-PAT-16', 'PAYMENT_SUCCESS',
 'Payment Confirmed',
 'Your payment of LKR 8,990.00 for appointment APT-SEED-1041 was successful. Order reference: ORD-2026-00041.',
 false, NOW() - INTERVAL '6 days' + INTERVAL '8 minutes'),

(gen_random_uuid(), 'USR-PAT-16', 'APPOINTMENT_COMPLETED',
 'Appointment Completed',
 'Your appointment with Dr. Eranga Munasinghe (Orthopedic Surgery) has been completed. Appointment ID: APT-SEED-1041. View your prescription in the app.',
 false, NOW() - INTERVAL '6 days' + INTERVAL '1 hour'),

-- ── APT-SEED-1042 (Lehan, Ophthalmology VIDEO, SUCCESS/COMPLETED) ──────────
(gen_random_uuid(), 'USR-PAT-16', 'APPOINTMENT_BOOKED',
 'Video Appointment Booked',
 'Your video appointment with Dr. Ishan Peiris (Ophthalmology) has been booked for slot 14:30-15:00. Appointment ID: APT-SEED-1042.',
 false, NOW() - INTERVAL '4 days'),

(gen_random_uuid(), 'USR-PAT-16', 'PAYMENT_SUCCESS',
 'Payment Confirmed',
 'Your payment of LKR 9,180.00 for video appointment APT-SEED-1042 was successful. Order reference: ORD-2026-00042.',
 false, NOW() - INTERVAL '3 days' + INTERVAL '8 minutes'),

(gen_random_uuid(), 'USR-PAT-16', 'TELEMEDICINE_SESSION_STARTED',
 'Video Session Ready',
 'Your video session with Dr. Ishan Peiris is ready. Join at: https://video.edoc.lk/appointment-APT-SEED-1042. Appointment ID: APT-SEED-1042.',
 false, NOW() - INTERVAL '3 days' + INTERVAL '7 hours'),

(gen_random_uuid(), 'USR-PAT-16', 'APPOINTMENT_COMPLETED',
 'Video Appointment Completed',
 'Your video appointment with Dr. Ishan Peiris (Ophthalmology) has been completed. Appointment ID: APT-SEED-1042.',
 false, NOW() - INTERVAL '3 days' + INTERVAL '7 hours' + INTERVAL '30 minutes'),

-- ── APT-SEED-1043 (Lehan, Psychiatry, PENDING/CONFIRMED upcoming) ──────────
(gen_random_uuid(), 'USR-PAT-16', 'APPOINTMENT_BOOKED',
 'Appointment Booked Successfully',
 'Your appointment with Dr. Kumari Samaraweera (Psychiatry) has been booked for slot 11:00-11:30. Appointment ID: APT-SEED-1043.',
 false, NOW() - INTERVAL '1 day'),

(gen_random_uuid(), 'USR-PAT-16', 'APPOINTMENT_CONFIRMED',
 'Appointment Confirmed',
 'Your upcoming appointment with Dr. Kumari Samaraweera (Psychiatry) at NIMH Mulleriyawa has been confirmed. Appointment ID: APT-SEED-1043.',
 false, NOW() - INTERVAL '1 day' + INTERVAL '30 minutes');

-- ─── notification_logs ───────────────────────────────────────────────────────
-- Email and SMS delivery logs for the key notifications above.

INSERT INTO notification_logs (id, recipient, channel, subject, message, status, provider_message_id, error_message, created_at)
VALUES

-- APT-SEED-1001 booking confirmation email
(gen_random_uuid(), 'vimukthi.rathnasiri@edoc.com', 'EMAIL',
 'Appointment Confirmed — eDoc',
 'Dear Vimukthi, your appointment with Dr. Chathuri Rathnayake (Cardiology) at Nawaloka Hospital has been confirmed for slot 09:30-10:00. Appointment ID: APT-SEED-1001.',
 'SUCCESS', 'resend_msg_001', NULL,
 NOW() - INTERVAL '80 days'),

-- APT-SEED-1001 booking SMS
(gen_random_uuid(), '0733300003', 'SMS',
 NULL,
 'eDoc: Appt APT-SEED-1001 confirmed with Dr. Rathnayake (Cardiology). Nawaloka Hospital, 09:30. Payment successful.',
 'SUCCESS', 'vonage_msg_001', NULL,
 NOW() - INTERVAL '80 days' + INTERVAL '2 minutes'),

-- APT-SEED-1002 booking confirmation email
(gen_random_uuid(), 'wasantha.alwis@edoc.com', 'EMAIL',
 'Appointment Confirmed — eDoc',
 'Dear Wasantha, your appointment with Dr. Dinesh Jayasuriya (Neurology) at Lanka Hospitals has been confirmed. Appointment ID: APT-SEED-1002.',
 'SUCCESS', 'resend_msg_002', NULL,
 NOW() - INTERVAL '78 days'),

-- APT-SEED-1003 video appointment email
(gen_random_uuid(), 'yasiru.vithanage@edoc.com', 'EMAIL',
 'Video Consultation Confirmed — eDoc',
 'Dear Yasiru, your telemedicine session with Dr. Eranga Munasinghe (Orthopedic Surgery) is confirmed. Join at: https://video.edoc.lk/appointment-APT-SEED-1003. Appointment ID: APT-SEED-1003.',
 'SUCCESS', 'resend_msg_003', NULL,
 NOW() - INTERVAL '76 days'),

-- APT-SEED-1004 email
(gen_random_uuid(), 'amali.udagedara@edoc.com', 'EMAIL',
 'Appointment Confirmed — eDoc',
 'Dear Amali, your appointment with Dr. Fathima Rizvi (Pediatrics) at Sirimavo Bandaranaike Hospital has been confirmed. Appointment ID: APT-SEED-1004.',
 'SUCCESS', 'resend_msg_004', NULL,
 NOW() - INTERVAL '74 days'),

-- APT-SEED-1007 cancellation email (FAILED payment)
(gen_random_uuid(), 'danushka.samarakoon@edoc.com', 'EMAIL',
 'Appointment Cancelled — Payment Failed — eDoc',
 'Dear Danushka, we regret to inform you that your appointment APT-SEED-1007 with Dr. Ishan Peiris has been cancelled due to a failed payment. Please rebook on eDoc.',
 'SUCCESS', 'resend_msg_007', NULL,
 NOW() - INTERVAL '68 days' + INTERVAL '30 minutes'),

-- APT-SEED-1007 cancellation SMS
(gen_random_uuid(), '0711900009', 'SMS',
 NULL,
 'eDoc: Appt APT-SEED-1007 CANCELLED (payment failed). Please rebook at edoc.lk.',
 'SUCCESS', 'vonage_msg_007', NULL,
 NOW() - INTERVAL '68 days' + INTERVAL '32 minutes'),

-- APT-SEED-1008 email
(gen_random_uuid(), 'erandi.wickremaratne@edoc.com', 'EMAIL',
 'Appointment Confirmed — eDoc',
 'Dear Erandi, your appointment with Dr. Janaka Dassanayake (General Medicine) has been confirmed. Appointment ID: APT-SEED-1008.',
 'SUCCESS', 'resend_msg_008', NULL,
 NOW() - INTERVAL '66 days'),

-- APT-SEED-1009 video session email
(gen_random_uuid(), 'farhan.saleem@edoc.com', 'EMAIL',
 'Video Consultation Ready — eDoc',
 'Dear Farhan, your telemedicine session with Dr. Kumari Samaraweera (Psychiatry) is ready. Session link: https://video.edoc.lk/appointment-APT-SEED-1009',
 'SUCCESS', 'resend_msg_009', NULL,
 NOW() - INTERVAL '63 days'),

-- APT-SEED-1011 video session SMS
(gen_random_uuid(), '0755300013', 'SMS',
 NULL,
 'eDoc: Your video session with Dr. Wijesinghe (Gastroenterology) is ready. Join: https://video.edoc.lk/appointment-APT-SEED-1011',
 'SUCCESS', 'vonage_msg_011', NULL,
 NOW() - INTERVAL '59 days'),

-- APT-SEED-1012 email
(gen_random_uuid(), 'indika.kumara@edoc.com', 'EMAIL',
 'Appointment Confirmed — eDoc',
 'Dear Indika, your appointment with Dr. Nalaka Hettige (Pulmonology) at Chest Hospital, Welisara has been confirmed. Appointment ID: APT-SEED-1012.',
 'SUCCESS', 'resend_msg_012', NULL,
 NOW() - INTERVAL '58 days'),

-- APT-SEED-1013 video consultation email
(gen_random_uuid(), 'janani.thilakarathne@edoc.com', 'EMAIL',
 'Video Consultation Ready — eDoc',
 'Dear Janani, your telemedicine session with Dr. Oshadi Sampath (ENT) is ready. Session link: https://video.edoc.lk/appointment-APT-SEED-1013',
 'SUCCESS', 'resend_msg_013', NULL,
 NOW() - INTERVAL '55 days'),

-- APT-SEED-1013 SMS
(gen_random_uuid(), '0777500015', 'SMS',
 NULL,
 'eDoc: Your video session with Dr. Sampath (ENT) starts now. Join: https://video.edoc.lk/appointment-APT-SEED-1013',
 'SUCCESS', 'vonage_msg_013', NULL,
 NOW() - INTERVAL '55 days' + INTERVAL '1 minute'),

-- Failed SMS delivery example (network error)
(gen_random_uuid(), '0744400004', 'SMS',
 NULL,
 'eDoc: Appt APT-SEED-1002 confirmed with Dr. Jayasuriya (Neurology). Lanka Hospitals.',
 'FAILED', NULL, 'Vonage error: 14 - Invalid calling account for given destination. Network: Dialog.',
 NOW() - INTERVAL '78 days'),

-- APT-SEED-1027 (PAT-03 return visit) email
(gen_random_uuid(), 'vimukthi.rathnasiri@edoc.com', 'EMAIL',
 'Appointment Confirmed — eDoc',
 'Dear Vimukthi, your follow-up appointment with Dr. Chathuri Rathnayake (Cardiology) for AF management has been confirmed. Appointment ID: APT-SEED-1027.',
 'SUCCESS', 'resend_msg_027', NULL,
 NOW() - INTERVAL '24 days'),

-- APT-SEED-1026 (PAT-15, Dermatology) email
(gen_random_uuid(), 'janani.thilakarathne@edoc.com', 'EMAIL',
 'Appointment Confirmed — eDoc',
 'Dear Janani, your appointment with Dr. Gayan Siriwardena (Dermatology) has been confirmed. Appointment ID: APT-SEED-1026.',
 'SUCCESS', 'resend_msg_026', NULL,
 NOW() - INTERVAL '25 days'),

-- APT-SEED-1041 (Lehan, Orthopedic Surgery) email + SMS
(gen_random_uuid(), 'lehanxp@gmail.com', 'EMAIL',
 'Appointment Confirmed — eDoc',
 'Dear Lehan, your appointment with Dr. Eranga Munasinghe (Orthopedic Surgery) at Asiri Surgical Hospital has been confirmed. Appointment ID: APT-SEED-1041.',
 'SUCCESS', 'resend_msg_041', NULL,
 NOW() - INTERVAL '6 days'),

(gen_random_uuid(), '0788600016', 'SMS', NULL,
 'eDoc: Appointment APT-SEED-1041 with Dr. Munasinghe (Orthopedic Surgery) is confirmed for today at 10:00. Reply HELP for assistance.',
 'SUCCESS', NULL, NULL,
 NOW() - INTERVAL '6 days' + INTERVAL '2 minutes'),

-- APT-SEED-1042 (Lehan, Ophthalmology video) email
(gen_random_uuid(), 'lehanxp@gmail.com', 'EMAIL',
 'Video Appointment Confirmed — eDoc',
 'Dear Lehan, your video appointment with Dr. Ishan Peiris (Ophthalmology) is confirmed. Appointment ID: APT-SEED-1042. Session link: https://video.edoc.lk/appointment-APT-SEED-1042',
 'SUCCESS', 'resend_msg_042', NULL,
 NOW() - INTERVAL '3 days'),

-- APT-SEED-1043 (Lehan, Psychiatry upcoming) email
(gen_random_uuid(), 'lehanxp@gmail.com', 'EMAIL',
 'Appointment Confirmed — eDoc',
 'Dear Lehan, your appointment with Dr. Kumari Samaraweera (Psychiatry) at NIMH Mulleriyawa has been confirmed. Appointment ID: APT-SEED-1043.',
 'SUCCESS', 'resend_msg_043', NULL,
 NOW() - INTERVAL '1 day');

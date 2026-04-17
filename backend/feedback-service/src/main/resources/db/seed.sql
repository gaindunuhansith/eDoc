-- ─────────────────────────────────────────────────────────────────────────────
-- Feedback Service Seed Data
-- Database: feedback_db (PostgreSQL)
-- DDL mode: create — Hibernate drops and recreates tables on every startup.
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Feedback is created only for COMPLETED appointments (SUCCESS payment status).
-- From the appointment-service seed (40 appointments):
--   SUCCESS appointments: gs ∉ {5,7,10,14,15,20,21,25,28,30,35,40}
--   All 28 SUCCESS appointments are in the past → status = COMPLETED.
--
-- Cross-service references:
--   patient_id (UUID)  → patient-service fixed UUIDs (00000000-0000-4000-8000-0000000000XX)
--   doctor_id (VARCHAR)→ doctor-service MongoDB IDs (DOC-001..DOC-013, cycling by appointment)
--   appointment_id     → appointment-service MongoDB IDs (APT-SEED-1001..1040)
-- ─────────────────────────────────────────────────────────────────────────────

DELETE FROM feedback;

-- Helper CTE: build patient_id and doctor_id for all 40 appointment slots
-- then filter to SUCCESS ones only.
WITH appointment_refs AS (
    SELECT
        gs,
        'APT-SEED-' || (1000 + gs)                                       AS appointment_id,
        -- patient index 0-12, cycling 3..15
        CASE (gs - 1) % 13
            WHEN 0  THEN '00000000-0000-4000-8000-000000000003'::uuid
            WHEN 1  THEN '00000000-0000-4000-8000-000000000004'::uuid
            WHEN 2  THEN '00000000-0000-4000-8000-000000000005'::uuid
            WHEN 3  THEN '00000000-0000-4000-8000-000000000006'::uuid
            WHEN 4  THEN '00000000-0000-4000-8000-000000000007'::uuid
            WHEN 5  THEN '00000000-0000-4000-8000-000000000008'::uuid
            WHEN 6  THEN '00000000-0000-4000-8000-000000000009'::uuid
            WHEN 7  THEN '00000000-0000-4000-8000-000000000010'::uuid
            WHEN 8  THEN '00000000-0000-4000-8000-000000000011'::uuid
            WHEN 9  THEN '00000000-0000-4000-8000-000000000012'::uuid
            WHEN 10 THEN '00000000-0000-4000-8000-000000000013'::uuid
            WHEN 11 THEN '00000000-0000-4000-8000-000000000014'::uuid
            ELSE         '00000000-0000-4000-8000-000000000015'::uuid
        END                                                               AS patient_id,
        -- doctor index 0-12, cycling DOC-001..DOC-013
        'DOC-' || LPAD(((gs - 1) % 13 + 1)::text, 3, '0')              AS doctor_id,
        -- payment status (matches payment-service seed formula)
        CASE
            WHEN gs % 7 = 0 THEN 'FAILED'
            WHEN gs % 5 = 0 THEN 'PENDING'
            ELSE                 'SUCCESS'
        END                                                               AS payment_status,
        -- appointment date: base NOW()-80d, +2d per gs
        (NOW() - INTERVAL '80 days' + (gs - 1) * INTERVAL '2 days')     AS appointment_ts
    FROM generate_series(1, 40) AS gs
),
-- Only COMPLETED (SUCCESS) appointments get feedback
completed AS (
    SELECT * FROM appointment_refs WHERE payment_status = 'SUCCESS'
)
INSERT INTO feedback (
    id,
    patient_id,
    doctor_id,
    appointment_id,
    rating,
    comment,
    timestamp,
    editable_until,
    version,
    updated_at
)
SELECT
    (
        substr(md5('fb-' || gs), 1, 8)  || '-' ||
        substr(md5('fb-' || gs), 9, 4)  || '-' ||
        substr(md5('fb-' || gs), 13, 4) || '-' ||
        substr(md5('fb-' || gs), 17, 4) || '-' ||
        substr(md5('fb-' || gs), 21, 12)
    )::uuid,
    patient_id,
    doctor_id,
    appointment_id,
    -- Rating distribution: mostly 4-5 stars; occasional 3 for realism
    CASE
        WHEN gs % 11 = 1 THEN 3
        WHEN gs % 7  = 2 THEN 4
        WHEN gs % 13 = 3 THEN 3
        ELSE 5
    END,
    -- Context-aware comments indexed by gs
    CASE gs % 14
        WHEN  1 THEN 'Outstanding consultation. The doctor was thorough and explained my condition in detail. I feel much more confident about my treatment plan.'
        WHEN  2 THEN 'Very professional and knowledgeable. Took time to answer all my questions. Highly recommended.'
        WHEN  3 THEN 'Good consultation overall. The doctor was clear about the diagnosis but the appointment felt a bit rushed.'
        WHEN  4 THEN 'Excellent doctor! Very compassionate and patient. The prescribed treatment has already shown improvement.'
        WHEN  5 THEN 'The telemedicine session worked perfectly. Doctor was attentive despite the virtual format. Very impressed.'
        WHEN  6 THEN 'Satisfied with the consultation. Clear diagnosis and appropriate medication prescribed. Will visit again.'
        WHEN  7 THEN 'Doctor was very friendly and made me comfortable. Explained the side effects of each medication carefully.'
        WHEN  8 THEN 'Average experience. Consultation was brief. I expected more detailed discussion about my test results.'
        WHEN  9 THEN 'Wonderful experience. The doctor reviewed all my previous reports and gave a comprehensive treatment plan.'
        WHEN 10 THEN 'Very helpful. The telemedicine format saved me hours of travel. Will definitely use eDoc again.'
        WHEN 11 THEN 'Good doctor, but the waiting time before the appointment was longer than expected.'
        WHEN 12 THEN 'Exceptional care. The doctor followed up with additional notes after the consultation. Five stars!'
        WHEN 13 THEN 'Professional and efficient. Got my prescription the same day. Very pleased with the service.'
        ELSE        'The doctor was knowledgeable and explained everything clearly. Would recommend to family and friends.'
    END,
    -- Feedback submitted within 24 hours of appointment
    appointment_ts + INTERVAL '18 hours',
    -- Editable for 7 days after submission
    appointment_ts + INTERVAL '18 hours' + INTERVAL '7 days',
    0,
    NULL
FROM completed;

-- ── Lehan Navaratne (USR-PAT-16) feedback ───────────────────────────────────────────────
INSERT INTO feedback (id, patient_id, doctor_id, appointment_id, rating, comment, timestamp, editable_until, version, updated_at)
VALUES
    (gen_random_uuid(),
     '00000000-0000-4000-8000-000000000016', 'DOC-003', 'APT-SEED-1041', 5,
     'Excellent consultation. Dr. Munasinghe was very thorough and the rehabilitation plan is clear. My ankle is already improving.',
     NOW() - INTERVAL '6 days' + INTERVAL '18 hours',
     NOW() - INTERVAL '6 days' + INTERVAL '18 hours' + INTERVAL '7 days',
     0, NULL),

    (gen_random_uuid(),
     '00000000-0000-4000-8000-000000000016', 'DOC-007', 'APT-SEED-1042', 4,
     'The telemedicine session was smooth and professional. Dr. Peiris explained the eye examination results very clearly. Very helpful.',
     NOW() - INTERVAL '3 days' + INTERVAL '18 hours',
     NOW() - INTERVAL '3 days' + INTERVAL '18 hours' + INTERVAL '7 days',
     0, NULL);

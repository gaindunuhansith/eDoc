-- ─────────────────────────────────────────────────────────────────────────────
-- Telemedicine Service Seed Data
-- Database: telemedicine_db (PostgreSQL)
-- DDL mode: update — Hibernate creates/updates tables on startup.
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Video sessions are created for VIDEO (odd-numbered) appointments only.
-- Payment/appointment status per session:
--   SUCCESS (ENDED)    → gs: 1,3,9,11,13,17,19,23,27,29,31,33,37,39  (14 sessions)
--   PENDING (SCHEDULED)→ gs: 5,15,25                                   (3 sessions)
--   FAILED (CANCELLED) → gs: 7,21,35                                   (3 sessions)
--
-- Cross-service references:
--   appointmentId → appointment-service MongoDB IDs (APT-SEED-XXXX)
--   doctorId      → doctor-service MongoDB IDs (DOC-001..DOC-013)
--   patientId     → patient-service fixed UUIDs (00000000-0000-4000-8000-0000000000XX)
--
-- Appointment dates: base = NOW()-80 days, +2 days per appointment number.
--   Odd gs N → date = NOW() - (80 - (N-1)*2) days
-- Time slots (cycling by gs%10):
--   gs%10: 1→09:30, 3→10:30, 5→11:30, 7→14:30, 9→15:30, 1→09:30 ...
-- Duration: 30 minutes per slot.
-- ─────────────────────────────────────────────────────────────────────────────

DELETE FROM video_sessions;

INSERT INTO video_sessions (
    id, appointment_id, doctor_id, patient_id,
    patient_name, doctor_name, doctor_specialty,
    scheduled_at, duration, room_name, notes,
    twilio_room_sid, status,
    start_time, end_time, created_at, updated_at
)
VALUES

-- ── gs=1  PAT-03, DOC-001, Cardiology, ENDED ──────────────────────────────
(gen_random_uuid(),
 'APT-SEED-1001', 'DOC-001', '00000000-0000-4000-8000-000000000003',
 'Vimukthi Rathnasiri', 'Dr. Chathuri Rathnayake', 'Cardiology',
 (NOW() - INTERVAL '80 days')::date + TIME '09:30:00', 30,
 'appointment-APT-SEED-1001',
 'Chest pain and shortness of breath during exertion',
 'RMSEED0000000000000000001', 'ENDED',
 (NOW() - INTERVAL '80 days')::date + TIME '09:32:00',
 (NOW() - INTERVAL '80 days')::date + TIME '10:02:00',
 NOW() - INTERVAL '80 days',
 (NOW() - INTERVAL '80 days')::date + TIME '10:02:00'),

-- ── gs=3  PAT-05, DOC-003, Orthopedic Surgery, ENDED ─────────────────────
(gen_random_uuid(),
 'APT-SEED-1003', 'DOC-003', '00000000-0000-4000-8000-000000000005',
 'Yasiru Vithanage', 'Dr. Eranga Munasinghe', 'Orthopedic Surgery',
 (NOW() - INTERVAL '74 days')::date + TIME '10:30:00', 30,
 'appointment-APT-SEED-1003',
 'Right knee pain and difficulty walking',
 'RMSEED0000000000000000003', 'ENDED',
 (NOW() - INTERVAL '74 days')::date + TIME '10:31:00',
 (NOW() - INTERVAL '74 days')::date + TIME '11:01:00',
 NOW() - INTERVAL '74 days',
 (NOW() - INTERVAL '74 days')::date + TIME '11:01:00'),

-- ── gs=5  PAT-07, DOC-005, Dermatology, SCHEDULED (PENDING payment) ───────
(gen_random_uuid(),
 'APT-SEED-1005', 'DOC-005', '00000000-0000-4000-8000-000000000007',
 'Binara Harshana', 'Dr. Gayan Siriwardena', 'Dermatology',
 (NOW() - INTERVAL '70 days')::date + TIME '11:30:00', 30,
 'appointment-APT-SEED-1005',
 'Skin rash and itching on arms and legs',
 NULL, 'SCHEDULED',
 NULL, NULL,
 NOW() - INTERVAL '70 days',
 NOW() - INTERVAL '70 days'),

-- ── gs=7  PAT-09, DOC-007, Ophthalmology, CANCELLED (FAILED payment) ──────
(gen_random_uuid(),
 'APT-SEED-1007', 'DOC-007', '00000000-0000-4000-8000-000000000009',
 'Danushka Samarakoon', 'Dr. Ishan Peiris', 'Ophthalmology',
 (NOW() - INTERVAL '68 days')::date + TIME '14:30:00', 30,
 'appointment-APT-SEED-1007',
 'Blurred vision and eye strain',
 NULL, 'CANCELLED',
 NULL, NULL,
 NOW() - INTERVAL '68 days',
 NOW() - INTERVAL '68 days' + INTERVAL '30 minutes'),

-- ── gs=9  PAT-11, DOC-009, Psychiatry, ENDED ─────────────────────────────
(gen_random_uuid(),
 'APT-SEED-1009', 'DOC-009', '00000000-0000-4000-8000-000000000011',
 'Farhan Saleem', 'Dr. Kumari Samaraweera', 'Psychiatry',
 (NOW() - INTERVAL '64 days')::date + TIME '15:30:00', 30,
 'appointment-APT-SEED-1009',
 'Anxiety, low mood and sleep disturbances',
 'RMSEED0000000000000000009', 'ENDED',
 (NOW() - INTERVAL '64 days')::date + TIME '15:30:00',
 (NOW() - INTERVAL '64 days')::date + TIME '16:01:00',
 NOW() - INTERVAL '64 days',
 (NOW() - INTERVAL '64 days')::date + TIME '16:01:00'),

-- ── gs=11 PAT-13, DOC-011, Gastroenterology, ENDED ──────────────────────
(gen_random_uuid(),
 'APT-SEED-1011', 'DOC-011', '00000000-0000-4000-8000-000000000013',
 'Hasitha Jayasena', 'Dr. Malsha Wijesinghe', 'Gastroenterology',
 (NOW() - INTERVAL '60 days')::date + TIME '09:30:00', 30,
 'appointment-APT-SEED-1011',
 'Abdominal pain and bloating after meals',
 'RMSEED0000000000000000011', 'ENDED',
 (NOW() - INTERVAL '60 days')::date + TIME '09:31:00',
 (NOW() - INTERVAL '60 days')::date + TIME '10:01:00',
 NOW() - INTERVAL '60 days',
 (NOW() - INTERVAL '60 days')::date + TIME '10:01:00'),

-- ── gs=13 PAT-15, DOC-013, ENT, ENDED ───────────────────────────────────
(gen_random_uuid(),
 'APT-SEED-1013', 'DOC-013', '00000000-0000-4000-8000-000000000015',
 'Janani Thilakarathne', 'Dr. Oshadi Sampath', 'ENT',
 (NOW() - INTERVAL '56 days')::date + TIME '10:30:00', 30,
 'appointment-APT-SEED-1013',
 'Ear pain and hearing difficulty',
 'RMSEED0000000000000000013', 'ENDED',
 (NOW() - INTERVAL '56 days')::date + TIME '10:32:00',
 (NOW() - INTERVAL '56 days')::date + TIME '11:06:00',
 NOW() - INTERVAL '56 days',
 (NOW() - INTERVAL '56 days')::date + TIME '11:06:00'),

-- ── gs=15 PAT-04, DOC-002, Neurology, SCHEDULED (PENDING payment) ────────
(gen_random_uuid(),
 'APT-SEED-1015', 'DOC-002', '00000000-0000-4000-8000-000000000004',
 'Wasantha Alwis', 'Dr. Dinesh Jayasuriya', 'Neurology',
 (NOW() - INTERVAL '52 days')::date + TIME '11:30:00', 30,
 'appointment-APT-SEED-1015',
 'Migraine management review',
 NULL, 'SCHEDULED',
 NULL, NULL,
 NOW() - INTERVAL '52 days',
 NOW() - INTERVAL '52 days'),

-- ── gs=17 PAT-06, DOC-004, Pediatrics, ENDED ────────────────────────────
(gen_random_uuid(),
 'APT-SEED-1017', 'DOC-004', '00000000-0000-4000-8000-000000000006',
 'Amali Udagedara', 'Dr. Fathima Rizvi', 'Pediatrics',
 (NOW() - INTERVAL '48 days')::date + TIME '14:30:00', 30,
 'appointment-APT-SEED-1017',
 'Child vaccination and growth monitoring',
 'RMSEED0000000000000000017', 'ENDED',
 (NOW() - INTERVAL '48 days')::date + TIME '14:30:00',
 (NOW() - INTERVAL '48 days')::date + TIME '15:00:00',
 NOW() - INTERVAL '48 days',
 (NOW() - INTERVAL '48 days')::date + TIME '15:00:00'),

-- ── gs=19 PAT-08, DOC-006, Gynecology, ENDED ────────────────────────────
(gen_random_uuid(),
 'APT-SEED-1019', 'DOC-006', '00000000-0000-4000-8000-000000000008',
 'Chamila Sampath', 'Dr. Harshani Abeywickrama', 'Obstetrics & Gynecology',
 (NOW() - INTERVAL '44 days')::date + TIME '15:30:00', 30,
 'appointment-APT-SEED-1019',
 'Antenatal check-up at 28 weeks',
 'RMSEED0000000000000000019', 'ENDED',
 (NOW() - INTERVAL '44 days')::date + TIME '15:30:00',
 (NOW() - INTERVAL '44 days')::date + TIME '16:02:00',
 NOW() - INTERVAL '44 days',
 (NOW() - INTERVAL '44 days')::date + TIME '16:02:00'),

-- ── gs=21 PAT-10, DOC-008, General Medicine, CANCELLED (FAILED payment) ──
(gen_random_uuid(),
 'APT-SEED-1021', 'DOC-008', '00000000-0000-4000-8000-000000000010',
 'Erandi Wickremaratne', 'Dr. Janaka Dassanayake', 'General Medicine',
 (NOW() - INTERVAL '42 days')::date + TIME '09:30:00', 30,
 'appointment-APT-SEED-1021',
 'Diabetes management and HbA1c review',
 NULL, 'CANCELLED',
 NULL, NULL,
 NOW() - INTERVAL '42 days',
 NOW() - INTERVAL '42 days' + INTERVAL '30 minutes'),

-- ── gs=23 PAT-12, DOC-010, Endocrinology, ENDED ─────────────────────────
(gen_random_uuid(),
 'APT-SEED-1023', 'DOC-010', '00000000-0000-4000-8000-000000000012',
 'Gimhan Perera', 'Dr. Lasitha Athukorala', 'Endocrinology',
 (NOW() - INTERVAL '36 days')::date + TIME '10:30:00', 30,
 'appointment-APT-SEED-1023',
 'Thyroid function test review',
 'RMSEED0000000000000000023', 'ENDED',
 (NOW() - INTERVAL '36 days')::date + TIME '10:31:00',
 (NOW() - INTERVAL '36 days')::date + TIME '11:02:00',
 NOW() - INTERVAL '36 days',
 (NOW() - INTERVAL '36 days')::date + TIME '11:02:00'),

-- ── gs=25 PAT-14, DOC-012, Pulmonology, SCHEDULED (PENDING payment) ──────
(gen_random_uuid(),
 'APT-SEED-1025', 'DOC-012', '00000000-0000-4000-8000-000000000014',
 'Indika Kumara', 'Dr. Nalaka Hettige', 'Pulmonology',
 (NOW() - INTERVAL '32 days')::date + TIME '11:30:00', 30,
 'appointment-APT-SEED-1025',
 'COPD exacerbation management',
 NULL, 'SCHEDULED',
 NULL, NULL,
 NOW() - INTERVAL '32 days',
 NOW() - INTERVAL '32 days'),

-- ── gs=27 PAT-03, DOC-001, Cardiology, ENDED (return visit — AF follow-up) ─
(gen_random_uuid(),
 'APT-SEED-1027', 'DOC-001', '00000000-0000-4000-8000-000000000003',
 'Vimukthi Rathnasiri', 'Dr. Chathuri Rathnayake', 'Cardiology',
 (NOW() - INTERVAL '28 days')::date + TIME '14:30:00', 30,
 'appointment-APT-SEED-1027',
 'Hypertension and heart failure follow-up',
 'RMSEED0000000000000000027', 'ENDED',
 (NOW() - INTERVAL '28 days')::date + TIME '14:30:00',
 (NOW() - INTERVAL '28 days')::date + TIME '15:02:00',
 NOW() - INTERVAL '28 days',
 (NOW() - INTERVAL '28 days')::date + TIME '15:02:00'),

-- ── gs=29 PAT-05, DOC-003, Orthopedic Surgery, ENDED ────────────────────
(gen_random_uuid(),
 'APT-SEED-1029', 'DOC-003', '00000000-0000-4000-8000-000000000005',
 'Yasiru Vithanage', 'Dr. Eranga Munasinghe', 'Orthopedic Surgery',
 (NOW() - INTERVAL '24 days')::date + TIME '15:30:00', 30,
 'appointment-APT-SEED-1029',
 'Back pain and disc herniation assessment',
 'RMSEED0000000000000000029', 'ENDED',
 (NOW() - INTERVAL '24 days')::date + TIME '15:31:00',
 (NOW() - INTERVAL '24 days')::date + TIME '16:02:00',
 NOW() - INTERVAL '24 days',
 (NOW() - INTERVAL '24 days')::date + TIME '16:02:00'),

-- ── gs=31 PAT-07, DOC-005, Dermatology, ENDED ───────────────────────────
(gen_random_uuid(),
 'APT-SEED-1031', 'DOC-005', '00000000-0000-4000-8000-000000000007',
 'Binara Harshana', 'Dr. Gayan Siriwardena', 'Dermatology',
 (NOW() - INTERVAL '20 days')::date + TIME '09:30:00', 30,
 'appointment-APT-SEED-1031',
 'Allergic rhinitis and eczema',
 'RMSEED0000000000000000031', 'ENDED',
 (NOW() - INTERVAL '20 days')::date + TIME '09:30:00',
 (NOW() - INTERVAL '20 days')::date + TIME '10:00:00',
 NOW() - INTERVAL '20 days',
 (NOW() - INTERVAL '20 days')::date + TIME '10:00:00'),

-- ── gs=33 PAT-09, DOC-007, Ophthalmology, ENDED ─────────────────────────
(gen_random_uuid(),
 'APT-SEED-1033', 'DOC-007', '00000000-0000-4000-8000-000000000009',
 'Danushka Samarakoon', 'Dr. Ishan Peiris', 'Ophthalmology',
 (NOW() - INTERVAL '16 days')::date + TIME '10:30:00', 30,
 'appointment-APT-SEED-1033',
 'Retinal detachment screening',
 'RMSEED0000000000000000033', 'ENDED',
 (NOW() - INTERVAL '16 days')::date + TIME '10:31:00',
 (NOW() - INTERVAL '16 days')::date + TIME '11:01:00',
 NOW() - INTERVAL '16 days',
 (NOW() - INTERVAL '16 days')::date + TIME '11:01:00'),

-- ── gs=35 PAT-11, DOC-009, Psychiatry, CANCELLED (FAILED payment) ────────
(gen_random_uuid(),
 'APT-SEED-1035', 'DOC-009', '00000000-0000-4000-8000-000000000011',
 'Farhan Saleem', 'Dr. Kumari Samaraweera', 'Psychiatry',
 (NOW() - INTERVAL '12 days')::date + TIME '11:30:00', 30,
 'appointment-APT-SEED-1035',
 'Panic disorder and medication titration',
 NULL, 'CANCELLED',
 NULL, NULL,
 NOW() - INTERVAL '12 days',
 NOW() - INTERVAL '12 days' + INTERVAL '30 minutes'),

-- ── gs=37 PAT-13, DOC-011, Gastroenterology, ENDED ──────────────────────
(gen_random_uuid(),
 'APT-SEED-1037', 'DOC-011', '00000000-0000-4000-8000-000000000013',
 'Hasitha Jayasena', 'Dr. Malsha Wijesinghe', 'Gastroenterology',
 (NOW() - INTERVAL '8 days')::date + TIME '14:30:00', 30,
 'appointment-APT-SEED-1037',
 'Acid reflux and GERD management',
 'RMSEED0000000000000000037', 'ENDED',
 (NOW() - INTERVAL '8 days')::date + TIME '14:30:00',
 (NOW() - INTERVAL '8 days')::date + TIME '15:01:00',
 NOW() - INTERVAL '8 days',
 (NOW() - INTERVAL '8 days')::date + TIME '15:01:00'),

-- ── gs=39 PAT-15, DOC-013, ENT, ENDED ───────────────────────────────────
(gen_random_uuid(),
 'APT-SEED-1039', 'DOC-013', '00000000-0000-4000-8000-000000000015',
 'Janani Thilakarathne', 'Dr. Oshadi Sampath', 'ENT',
 (NOW() - INTERVAL '4 days')::date + TIME '15:30:00', 30,
 'appointment-APT-SEED-1039',
 'Tonsillitis and throat infection',
 'RMSEED0000000000000000039', 'ENDED',
 (NOW() - INTERVAL '4 days')::date + TIME '15:30:00',
 (NOW() - INTERVAL '4 days')::date + TIME '16:00:00',
 NOW() - INTERVAL '4 days',
 (NOW() - INTERVAL '4 days')::date + TIME '16:00:00'),

-- ── APT-SEED-1042 Lehan Navaratne, DOC-007, Ophthalmology, ENDED ────────────
(gen_random_uuid(),
 'APT-SEED-1042', 'DOC-007', '00000000-0000-4000-8000-000000000016',
 'Lehan Navaratne', 'Dr. Ishan Peiris', 'Ophthalmology',
 (NOW() - INTERVAL '3 days')::date + TIME '14:30:00', 30,
 'appointment-APT-SEED-1042',
 'Blurred vision and eye strain',
 'RMSEED0000000000000000042', 'ENDED',
 (NOW() - INTERVAL '3 days')::date + TIME '14:31:00',
 (NOW() - INTERVAL '3 days')::date + TIME '15:01:00',
 NOW() - INTERVAL '3 days',
 (NOW() - INTERVAL '3 days')::date + TIME '15:01:00');

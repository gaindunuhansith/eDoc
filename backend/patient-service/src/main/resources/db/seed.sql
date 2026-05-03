-- ─────────────────────────────────────────────────────────────────────────────
-- Patient Service Seed Data
-- Database: patient_db (PostgreSQL)
-- DDL mode: create — tables are dropped and re-created on every startup.
-- This seed runs after Hibernate creates the schema (defer-datasource-initialization: true).
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Patient UUIDs are FIXED so that other services (feedback, appointment, telemedicine)
-- can reference them consistently:
--
--   USR-PAT-03  Vimukthi Rathnasiri      → 00000000-0000-4000-8000-000000000003
--   USR-PAT-04  Wasantha Alwis           → 00000000-0000-4000-8000-000000000004
--   USR-PAT-05  Yasiru Vithanage         → 00000000-0000-4000-8000-000000000005
--   USR-PAT-06  Amali Udagedara          → 00000000-0000-4000-8000-000000000006
--   USR-PAT-07  Binara Harshana          → 00000000-0000-4000-8000-000000000007
--   USR-PAT-08  Chamila Sampath          → 00000000-0000-4000-8000-000000000008
--   USR-PAT-09  Danushka Samarakoon      → 00000000-0000-4000-8000-000000000009
--   USR-PAT-10  Erandi Wickremaratne     → 00000000-0000-4000-8000-000000000010
--   USR-PAT-11  Farhan Saleem            → 00000000-0000-4000-8000-000000000011
--   USR-PAT-12  Gimhan Perera            → 00000000-0000-4000-8000-000000000012
--   USR-PAT-13  Hasitha Jayasena         → 00000000-0000-4000-8000-000000000013
--   USR-PAT-14  Indika Kumara            → 00000000-0000-4000-8000-000000000014
--   USR-PAT-15  Janani Thilakarathne     → 00000000-0000-4000-8000-000000000015
--   USR-PAT-16  Lehan Navaratne          → 00000000-0000-4000-8000-000000000016
--
-- USR-PAT-01 (inactive) and USR-PAT-02 (deleted) are excluded from this seed
-- because they have no profile (is_profile_created=false / is_deleted=true).
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Patients ────────────────────────────────────────────────────────────────
INSERT INTO patients (
    id, user_id, gender, date_of_birth, blood_group,
    height, weight, nic_number, address, allergies,
    emergency_contact_phone, created_at, updated_at, is_deleted
) VALUES
-- PAT-03: Vimukthi Rathnasiri – 34-year-old male, Colombo
('00000000-0000-4000-8000-000000000003', 'USR-PAT-03', 'MALE',
 '1991-06-15', 'B+',
 175.0, 78.5, '916621234V',
 '42/3 Galle Road, Colombo 03',
 'Penicillin (rash), Shellfish (anaphylaxis)',
 '0711200033', NOW() - INTERVAL '90 days', NOW() - INTERVAL '2 days', false),

-- PAT-04: Wasantha Alwis – 47-year-old male, Kandy
('00000000-0000-4000-8000-000000000004', 'USR-PAT-04', 'MALE',
 '1978-03-22', 'O+',
 170.0, 83.0, '782821345V',
 '15 Peradeniya Road, Kandy',
 'Sulfonamides (rash)',
 '0723300044', NOW() - INTERVAL '85 days', NOW() - INTERVAL '7 days', false),

-- PAT-05: Yasiru Vithanage – 29-year-old male, Galle
('00000000-0000-4000-8000-000000000005', 'USR-PAT-05', 'MALE',
 '1996-09-08', 'A+',
 182.0, 75.0, '960522456V',
 '88 Matara Road, Galle',
 NULL,
 '0745500055', NOW() - INTERVAL '80 days', NOW() - INTERVAL '4 days', false),

-- PAT-06: Amali Udagedara – 38-year-old female, Negombo
('00000000-0000-4000-8000-000000000006', 'USR-PAT-06', 'FEMALE',
 '1987-11-30', 'AB+',
 160.0, 62.0, '874330567V',
 '9 Sea Street, Negombo',
 'Latex (contact dermatitis), Ibuprofen (gastric upset)',
 '0766100066', NOW() - INTERVAL '75 days', NOW() - INTERVAL '1 day', false),

-- PAT-07: Binara Harshana – 25-year-old male, Matara
('00000000-0000-4000-8000-000000000007', 'USR-PAT-07', 'MALE',
 '2000-02-14', 'O-',
 178.0, 72.0, '000142678V',
 '22 Beach Road, Matara',
 NULL,
 '0777200077', NOW() - INTERVAL '70 days', NOW() - INTERVAL '3 days', false),

-- PAT-08: Chamila Sampath – 42-year-old female, Kurunegala
('00000000-0000-4000-8000-000000000008', 'USR-PAT-08', 'FEMALE',
 '1983-05-19', 'A-',
 158.0, 68.5, '835392789V',
 '34 Colombo Road, Kurunegala',
 'Aspirin (asthma exacerbation)',
 '0788900088', NOW() - INTERVAL '65 days', NOW() - INTERVAL '5 days', false),

-- PAT-09: Danushka Samarakoon – 33-year-old male, Jaffna
('00000000-0000-4000-8000-000000000009', 'USR-PAT-09', 'MALE',
 '1992-08-25', 'B-',
 174.0, 80.0, '924372890V',
 '5 Hospital Road, Jaffna',
 NULL,
 '0712300099', NOW() - INTERVAL '60 days', NOW() - INTERVAL '8 days', false),

-- PAT-10: Erandi Wickremaratne – 51-year-old female, Batticaloa
('00000000-0000-4000-8000-000000000010', 'USR-PAT-10', 'FEMALE',
 '1974-12-03', 'AB-',
 162.0, 70.0, '744730901V',
 '17 Bar Road, Batticaloa',
 'Codeine (nausea)',
 '0723400010', NOW() - INTERVAL '55 days', NOW() - INTERVAL '2 days', false),

-- PAT-11: Farhan Saleem – 28-year-old male, Ratnapura
('00000000-0000-4000-8000-000000000011', 'USR-PAT-11', 'MALE',
 '1997-04-17', 'A+',
 176.0, 77.0, '972082012V',
 '8 Main Street, Ratnapura',
 'Peanuts (anaphylaxis)',
 '0734100011', NOW() - INTERVAL '50 days', NOW() - INTERVAL '6 days', false),

-- PAT-12: Gimhan Perera – 36-year-old male, Badulla
('00000000-0000-4000-8000-000000000012', 'USR-PAT-12', 'MALE',
 '1989-07-11', 'O+',
 180.0, 85.0, '893921123V',
 '6 Bandarawela Road, Badulla',
 NULL,
 '0744300012', NOW() - INTERVAL '40 days', NOW() - INTERVAL '9 days', false),

-- PAT-13: Hasitha Jayasena – 44-year-old male, Anuradhapura
('00000000-0000-4000-8000-000000000013', 'USR-PAT-13', 'MALE',
 '1981-01-28', 'B+',
 172.0, 88.0, '810283234V',
 '23 Maithripala Road, Anuradhapura',
 'NSAIDs (peptic ulcer)',
 '0755400013', NOW() - INTERVAL '30 days', NOW() - INTERVAL '3 days', false),

-- PAT-14: Indika Kumara – 39-year-old male, Nuwara Eliya
('00000000-0000-4000-8000-000000000014', 'USR-PAT-14', 'MALE',
 '1986-10-05', 'A+',
 169.0, 74.0, '862783345V',
 '11 Park Road, Nuwara Eliya',
 NULL,
 '0766500014', NOW() - INTERVAL '20 days', NOW() - INTERVAL '1 day', false),

-- PAT-15: Janani Thilakarathne – 31-year-old female, Colombo
('00000000-0000-4000-8000-000000000015', 'USR-PAT-15', 'FEMALE',
 '1994-03-09', 'O+',
 163.0, 58.0, '945692456V',
 '7 Independence Avenue, Colombo 07',
 'Sulfonamides (rash), Egg (mild intolerance)',
 '0777600015', NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day', false),

-- PAT-16: Lehan Navaratne – 24-year-old male, Rajagiriya
('00000000-0000-4000-8000-000000000016', 'USR-PAT-16', 'MALE',
 '2001-12-03', 'A+',
 177.0, 70.0, '012382345V',
 '55 Nawala Road, Rajagiriya',
 NULL,
 '0776600016', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', false);

-- ─── Medical History ──────────────────────────────────────────────────────────
-- Linked to COMPLETED appointments (SUCCESS payment status).
-- doctor_id references doctor-service MongoDB IDs (DOC-001..DOC-013).
-- appointment_id references appointment-service MongoDB IDs (APT-SEED-XXXX).
-- doctor_name_snapshot is the doctor name at time of visit.
INSERT INTO medical_history (
    id, patient_id, condition, diagnosis, visit_date,
    doctor_id, appointment_id, doctor_name_snapshot, notes, created_at
) VALUES
-- PAT-03 history
('a0000001-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000003',
 'Hypertension', 'Hypertensive Heart Disease with Left Ventricular Hypertrophy',
 (NOW() - INTERVAL '79 days')::date,
 'DOC-001', 'APT-SEED-1001', 'Dr. Chathuri Rathnayake',
 'BP 162/98 on presentation. ECG shows LVH pattern. Started on Amlodipine 5mg and Enalapril 10mg.',
 NOW() - INTERVAL '79 days'),

('a0000002-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000003',
 'Cardiac Arrhythmia', 'Paroxysmal Atrial Fibrillation',
 (NOW() - INTERVAL '23 days')::date,
 'DOC-001', 'APT-SEED-1027', 'Dr. Chathuri Rathnayake',
 '24-hour Holter confirms paroxysmal AF. CHA2DS2-VASc score 2. Started anticoagulation with Rivaroxaban.',
 NOW() - INTERVAL '23 days'),

-- PAT-04 history
('a0000003-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000004',
 'Chronic Headache', 'Tension-type Headache with Cervicogenic Component',
 (NOW() - INTERVAL '77 days')::date,
 'DOC-002', 'APT-SEED-1002', 'Dr. Dinesh Jayasuriya',
 'MRI brain normal. Cervical spine X-ray shows degenerative changes at C4-C5. Referred to physiotherapy.',
 NOW() - INTERVAL '77 days'),

-- PAT-05 history
('a0000004-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000005',
 'Knee Pain', 'Right Knee Osteoarthritis Grade II',
 (NOW() - INTERVAL '75 days')::date,
 'DOC-003', 'APT-SEED-1003', 'Dr. Eranga Munasinghe',
 'X-ray right knee shows moderate joint space narrowing. BMI 22.6. Physiotherapy prescribed.',
 NOW() - INTERVAL '75 days'),

-- PAT-08 history
('a0000005-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000008',
 'Menstrual Irregularity', 'Polycystic Ovarian Syndrome (PCOS)',
 (NOW() - INTERVAL '69 days')::date,
 'DOC-006', 'APT-SEED-1006', 'Dr. Harshani Abeywickrama',
 'USS pelvis: polycystic ovaries. LH:FSH ratio elevated. Testosterone mildly raised. Metformin initiated.',
 NOW() - INTERVAL '69 days'),

-- PAT-09 history
('a0000006-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000009',
 'Diabetes Mellitus', 'Type 2 Diabetes Mellitus – Newly Diagnosed',
 (NOW() - INTERVAL '65 days')::date,
 'DOC-008', 'APT-SEED-1008', 'Dr. Janaka Dassanayake',
 'FBS 196 mg/dL, HbA1c 8.4%. No retinopathy or neuropathy on screening. Metformin and dietary counselling.',
 NOW() - INTERVAL '65 days'),

-- PAT-10 history
('a0000007-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000010',
 'Depression', 'Major Depressive Disorder – Moderate Severity',
 (NOW() - INTERVAL '63 days')::date,
 'DOC-009', 'APT-SEED-1009', 'Dr. Kumari Samaraweera',
 'PHQ-9 score 14. No suicidal ideation. Escitalopram 10mg initiated. Psychotherapy referral made.',
 NOW() - INTERVAL '63 days'),

-- PAT-11 history
('a0000008-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000011',
 'Thyroid Disorder', 'Primary Hypothyroidism (Hashimoto''s Thyroiditis)',
 (NOW() - INTERVAL '59 days')::date,
 'DOC-010', 'APT-SEED-1011', 'Dr. Lasitha Athukorala',
 'TSH 12.4 mIU/L, Free T4 low, TPO antibodies positive. Levothyroxine 50mcg started.',
 NOW() - INTERVAL '59 days'),

-- PAT-12 history
('a0000009-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000012',
 'Gastric Infection', 'Acute Gastritis with H. pylori Infection',
 (NOW() - INTERVAL '57 days')::date,
 'DOC-011', 'APT-SEED-1012', 'Dr. Malsha Wijesinghe',
 'Rapid urease test positive. Triple therapy (Amoxicillin, Clarithromycin, Omeprazole) prescribed for 14 days.',
 NOW() - INTERVAL '57 days'),

-- PAT-13 history
('a0000010-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000013',
 'Respiratory Disease', 'Bronchial Asthma – Mild Persistent',
 (NOW() - INTERVAL '55 days')::date,
 'DOC-012', 'APT-SEED-1013', 'Dr. Nalaka Hettige',
 'FEV1 78% predicted. Post-bronchodilator reversibility 15%. Stepped up to ICS/LABA combination.',
 NOW() - INTERVAL '55 days'),

-- PAT-14 history
('a0000011-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000014',
 'Sinus Condition', 'Chronic Sinusitis with Nasal Polyps – Grade I',
 (NOW() - INTERVAL '47 days')::date,
 'DOC-013', 'APT-SEED-1016', 'Dr. Oshadi Sampath',
 'CT PNS: bilateral mucosal thickening, small polyps. Conservative management with nasal steroid spray.',
 NOW() - INTERVAL '47 days'),

-- PAT-15 history
('a0000012-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000015',
 'Acne', 'Moderate Acne Vulgaris with Post-Inflammatory Hyperpigmentation',
 (NOW() - INTERVAL '24 days')::date,
 'DOC-005', 'APT-SEED-1026', 'Dr. Gayan Siriwardena',
 'Comedonal and inflammatory acne on face and upper back. Doxycycline, Adapalene and Clindamycin lotion prescribed.',
 NOW() - INTERVAL '24 days'),

-- PAT-16 history
('a0000013-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000016',
 'Sports Injury', 'Right Ankle Ligament Sprain Grade II with Syndesmotic Involvement',
 (NOW() - INTERVAL '6 days')::date,
 'DOC-003', 'APT-SEED-1041', 'Dr. Eranga Munasinghe',
 'MRI right ankle confirms complete ATFL tear and partial CFL tear. No bony injury on X-ray. Protected weight-bearing with splint for 3 weeks. Physiotherapy and ankle strengthening programme prescribed.',
 NOW() - INTERVAL '6 days');

-- ─── Medical Reports ──────────────────────────────────────────────────────────
-- Uploaded lab/imaging reports linked to completed appointments.
INSERT INTO medical_reports (
    id, patient_id, report_name, report_type, doctor_id, appointment_id, notes, created_at
) VALUES
-- PAT-03: Cardiac reports
('b0000001-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000003',
 '12-Lead ECG – LVH Changes', 'ECG',
 'DOC-001', 'APT-SEED-1001',
 'Sinus rhythm, rate 88 bpm. Voltage criteria for LVH met (Sokolow-Lyon index > 35mm). No ST changes.',
 NOW() - INTERVAL '79 days'),

('b0000002-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000003',
 'Echocardiogram Report', 'Echocardiogram',
 'DOC-001', 'APT-SEED-1001',
 'EF 58%. Mild concentric LVH. No wall motion abnormalities. Mild aortic regurgitation.',
 NOW() - INTERVAL '78 days'),

('b0000003-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000003',
 '24-Hour Holter Monitor Report', 'Holter Monitoring',
 'DOC-001', 'APT-SEED-1027',
 'Paroxysmal AF episodes recorded at 02:15 and 14:30. Longest episode 4.2 hours. No significant pauses.',
 NOW() - INTERVAL '23 days'),

-- PAT-04: Neurological reports
('b0000004-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000004',
 'MRI Brain – Normal Study', 'MRI',
 'DOC-002', 'APT-SEED-1002',
 'No intracranial mass, midline shift or haemorrhage. White matter signal normal. No acute infarct.',
 NOW() - INTERVAL '77 days'),

('b0000005-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000004',
 'Cervical Spine X-Ray', 'X-Ray',
 'DOC-002', 'APT-SEED-1002',
 'Mild degenerative disc disease at C4-C5 and C5-C6. No fracture or dislocation. Osteophyte formation present.',
 NOW() - INTERVAL '77 days'),

-- PAT-05: Orthopaedic reports
('b0000006-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000005',
 'Right Knee X-Ray AP and Lateral', 'X-Ray',
 'DOC-003', 'APT-SEED-1003',
 'Moderate joint space narrowing medial compartment. Osteophytes on medial tibial plateau. Kellgren-Lawrence Grade II.',
 NOW() - INTERVAL '75 days'),

-- PAT-08: Gynaecology reports
('b0000007-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000008',
 'Pelvic Ultrasound – PCOS Features', 'Ultrasound',
 'DOC-006', 'APT-SEED-1006',
 'Both ovaries enlarged with peripheral follicles (>12 follicles per ovary). No free fluid in POD.',
 NOW() - INTERVAL '69 days'),

('b0000008-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000008',
 'Hormone Profile – LH/FSH/Testosterone', 'Blood Test',
 'DOC-006', 'APT-SEED-1006',
 'LH: 12.4 mIU/mL, FSH: 4.2 mIU/mL, LH:FSH ratio 2.95. Total testosterone: 72 ng/dL (mildly elevated). Fasting insulin elevated.',
 NOW() - INTERVAL '69 days'),

-- PAT-09: Diabetes reports
('b0000009-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000009',
 'Fasting Blood Sugar & HbA1c', 'Blood Test',
 'DOC-008', 'APT-SEED-1008',
 'FBS: 196 mg/dL. HbA1c: 8.4%. Fasting lipid profile: total cholesterol 218 mg/dL, LDL 142 mg/dL.',
 NOW() - INTERVAL '65 days'),

-- PAT-11: Thyroid reports
('b0000010-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000011',
 'Thyroid Function Tests & Antibodies', 'Blood Test',
 'DOC-010', 'APT-SEED-1011',
 'TSH: 12.4 mIU/L (high), Free T4: 8.2 pmol/L (low), Free T3: 3.1 pmol/L (low). TPO Ab: 486 IU/mL (strongly positive).',
 NOW() - INTERVAL '59 days'),

('b0000011-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000011',
 'Thyroid Ultrasound', 'Ultrasound',
 'DOC-010', 'APT-SEED-1011',
 'Heterogeneous echotexture of thyroid gland. No discrete nodule. No cervical lymphadenopathy. Consistent with Hashimoto''s thyroiditis.',
 NOW() - INTERVAL '59 days'),

-- PAT-12: GI reports
('b0000012-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000012',
 'H. pylori Rapid Urease Test', 'Endoscopy',
 'DOC-011', 'APT-SEED-1012',
 'Upper GI endoscopy: erythematous gastric mucosa, antral gastritis. Rapid urease test: POSITIVE.',
 NOW() - INTERVAL '57 days'),

-- PAT-13: Respiratory reports
('b0000013-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000013',
 'Spirometry – Reversibility Test', 'Pulmonary Function Test',
 'DOC-012', 'APT-SEED-1013',
 'Pre-BD: FEV1 78%, FVC 92%, FEV1/FVC 0.72. Post-BD: FEV1 85%, reversibility 15%. Pattern: mild obstruction with reversibility.',
 NOW() - INTERVAL '55 days'),

-- PAT-14: ENT reports
('b0000014-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000014',
 'CT Paranasal Sinuses', 'CT Scan',
 'DOC-013', 'APT-SEED-1016',
 'Bilateral maxillary and ethmoid sinusitis with mucosal thickening. Small polyps in right maxillary sinus. No bony erosion.',
 NOW() - INTERVAL '47 days'),

-- PAT-16: Sports injury MRI
('b0000015-0000-4000-8000-000000000001',
 '00000000-0000-4000-8000-000000000016',
 'Right Ankle MRI – Ligament Assessment', 'MRI',
 'DOC-003', 'APT-SEED-1041',
 'MRI right ankle: complete tear of anterior talofibular ligament (ATFL), partial tear of calcaneofibular ligament (CFL). No osteochondral lesion. Peroneal tendons intact. Consistent with Grade II lateral ankle sprain.',
 NOW() - INTERVAL '6 days');

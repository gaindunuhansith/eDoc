-- ─── User Seed Data ───────────────────────────────────────────────────────────
-- All users share the password: Password123
-- user_id format:
--   USR-ADM-01 … USR-ADM-15  (admins)
--   USR-DOC-01 … USR-DOC-15  (doctors)
--   USR-PAT-01 … USR-PAT-15  (patients)
--
-- Status legend (consistent across all roles):
--   USR-*-01  → inactive   (is_active=false, is_deleted=false)
--   USR-*-02  → deleted    (is_active=false, is_deleted=true)
--   USR-*-03+ → active
--
-- Admins:   is_profile_created=false  (no patient/doctor profile)
-- Doctors:  is_profile_created=true
-- Patients: is_profile_created=true

DELETE FROM users;

-- ─── Admin Users ─────────────────────────────────────────────────────────────
INSERT INTO users (id, user_id, name, email, password, phone_number, role, is_profile_created, is_active, is_deleted, created_at, updated_at, deleted_at) VALUES
(gen_random_uuid(), 'USR-ADM-01', 'Kavinda Perera',        'kavinda.perera@edoc.com',        crypt('Password123', gen_salt('bf', 10)), '0711234501', 'ADMIN', false, false, false, NOW() - INTERVAL '90 days',  NOW() - INTERVAL '45 days',  NULL),
(gen_random_uuid(), 'USR-ADM-02', 'Sachini Rajapaksa',     'sachini.rajapaksa@edoc.com',     crypt('Password123', gen_salt('bf', 10)), '0722345602', 'ADMIN', false, false, true,  NOW() - INTERVAL '85 days',  NOW() - INTERVAL '40 days',  NOW() - INTERVAL '38 days'),
(gen_random_uuid(), 'USR-ADM-03', 'Ruwan Bandara',         'ruwan.bandara@edoc.com',         crypt('Password123', gen_salt('bf', 10)), '0773456703', 'ADMIN', false, true,  false, NOW() - INTERVAL '80 days',  NOW() - INTERVAL '5 days',   NULL),
(gen_random_uuid(), 'USR-ADM-04', 'Thilini Fernando',      'thilini.fernando@edoc.com',      crypt('Password123', gen_salt('bf', 10)), '0744567804', 'ADMIN', false, true,  false, NOW() - INTERVAL '75 days',  NOW() - INTERVAL '10 days',  NULL),
(gen_random_uuid(), 'USR-ADM-05', 'Manoj Silva',           'manoj.silva@edoc.com',           crypt('Password123', gen_salt('bf', 10)), '0755678905', 'ADMIN', false, true,  false, NOW() - INTERVAL '70 days',  NOW() - INTERVAL '3 days',   NULL),
(gen_random_uuid(), 'USR-ADM-06', 'Dilani Wickramasinghe', 'dilani.wickramasinghe@edoc.com', crypt('Password123', gen_salt('bf', 10)), '0766789006', 'ADMIN', false, true,  false, NOW() - INTERVAL '65 days',  NOW() - INTERVAL '7 days',   NULL),
(gen_random_uuid(), 'USR-ADM-07', 'Chamara Jayawardena',   'chamara.jayawardena@edoc.com',   crypt('Password123', gen_salt('bf', 10)), '0777890107', 'ADMIN', false, true,  false, NOW() - INTERVAL '60 days',  NOW() - INTERVAL '2 days',   NULL),
(gen_random_uuid(), 'USR-ADM-08', 'Nisala Gunawardena',    'nisala.gunawardena@edoc.com',    crypt('Password123', gen_salt('bf', 10)), '0788901208', 'ADMIN', false, true,  false, NOW() - INTERVAL '55 days',  NOW() - INTERVAL '8 days',   NULL),
(gen_random_uuid(), 'USR-ADM-09', 'Prasad Senanayake',     'prasad.senanayake@edoc.com',     crypt('Password123', gen_salt('bf', 10)), '0711012309', 'ADMIN', false, true,  false, NOW() - INTERVAL '50 days',  NOW() - INTERVAL '1 day',    NULL),
(gen_random_uuid(), 'USR-ADM-10', 'Anusha Dissanayake',    'anusha.dissanayake@edoc.com',    crypt('Password123', gen_salt('bf', 10)), '0722123410', 'ADMIN', false, true,  false, NOW() - INTERVAL '45 days',  NOW() - INTERVAL '6 days',   NULL),
(gen_random_uuid(), 'USR-ADM-11', 'Roshan Mendis',         'roshan.mendis@edoc.com',         crypt('Password123', gen_salt('bf', 10)), '0733234511', 'ADMIN', false, true,  false, NOW() - INTERVAL '40 days',  NOW() - INTERVAL '4 days',   NULL),
(gen_random_uuid(), 'USR-ADM-12', 'Hasini Ranasinghe',     'hasini.ranasinghe@edoc.com',     crypt('Password123', gen_salt('bf', 10)), '0744345612', 'ADMIN', false, true,  false, NOW() - INTERVAL '35 days',  NOW() - INTERVAL '9 days',   NULL),
(gen_random_uuid(), 'USR-ADM-13', 'Dimuth Kumarasinghe',   'dimuth.kumarasinghe@edoc.com',   crypt('Password123', gen_salt('bf', 10)), '0755456713', 'ADMIN', false, true,  false, NOW() - INTERVAL '30 days',  NOW() - INTERVAL '12 days',  NULL),
(gen_random_uuid(), 'USR-ADM-14', 'Nimesha Hettiarachchi', 'nimesha.hettiarachchi@edoc.com', crypt('Password123', gen_salt('bf', 10)), '0766567814', 'ADMIN', false, true,  false, NOW() - INTERVAL '20 days',  NOW() - INTERVAL '2 days',   NULL),
(gen_random_uuid(), 'USR-ADM-15', 'Saman Pathirana',       'saman.pathirana@edoc.com',       crypt('Password123', gen_salt('bf', 10)), '0777678915', 'ADMIN', false, true,  false, NOW() - INTERVAL '10 days',  NOW() - INTERVAL '1 day',    NULL);

-- ─── Doctor Users ─────────────────────────────────────────────────────────────
INSERT INTO users (id, user_id, name, email, password, phone_number, role, is_profile_created, is_active, is_deleted, created_at, updated_at, deleted_at) VALUES
(gen_random_uuid(), 'USR-DOC-01', 'Amara Wijesekara',      'amara.wijesekara@edoc.com',      crypt('Password123', gen_salt('bf', 10)), '0711111101', 'DOCTOR', true, false, false, NOW() - INTERVAL '120 days', NOW() - INTERVAL '60 days',  NULL),
(gen_random_uuid(), 'USR-DOC-02', 'Buddhika Liyanage',     'buddhika.liyanage@edoc.com',     crypt('Password123', gen_salt('bf', 10)), '0722222202', 'DOCTOR', true, false, true,  NOW() - INTERVAL '115 days', NOW() - INTERVAL '55 days',  NOW() - INTERVAL '50 days'),
(gen_random_uuid(), 'USR-DOC-03', 'Chathuri Rathnayake',   'chathuri.rathnayake@edoc.com',   crypt('Password123', gen_salt('bf', 10)), '0733333303', 'DOCTOR', true, true,  false, NOW() - INTERVAL '110 days', NOW() - INTERVAL '5 days',   NULL),
(gen_random_uuid(), 'USR-DOC-04', 'Dinesh Jayasuriya',     'dinesh.jayasuriya@edoc.com',     crypt('Password123', gen_salt('bf', 10)), '0744444404', 'DOCTOR', true, true,  false, NOW() - INTERVAL '105 days', NOW() - INTERVAL '3 days',   NULL),
(gen_random_uuid(), 'USR-DOC-05', 'Eranga Munasinghe',     'eranga.munasinghe@edoc.com',     crypt('Password123', gen_salt('bf', 10)), '0755555505', 'DOCTOR', true, true,  false, NOW() - INTERVAL '100 days', NOW() - INTERVAL '7 days',   NULL),
(gen_random_uuid(), 'USR-DOC-06', 'Fathima Rizvi',         'fathima.rizvi@edoc.com',         crypt('Password123', gen_salt('bf', 10)), '0766666606', 'DOCTOR', true, true,  false, NOW() - INTERVAL '95 days',  NOW() - INTERVAL '2 days',   NULL),
(gen_random_uuid(), 'USR-DOC-07', 'Gayan Siriwardena',     'gayan.siriwardena@edoc.com',     crypt('Password123', gen_salt('bf', 10)), '0777777707', 'DOCTOR', true, true,  false, NOW() - INTERVAL '90 days',  NOW() - INTERVAL '1 day',    NULL),
(gen_random_uuid(), 'USR-DOC-08', 'Harshani Abeywickrama', 'harshani.abeywickrama@edoc.com', crypt('Password123', gen_salt('bf', 10)), '0788888808', 'DOCTOR', true, true,  false, NOW() - INTERVAL '85 days',  NOW() - INTERVAL '4 days',   NULL),
(gen_random_uuid(), 'USR-DOC-09', 'Ishan Peiris',          'ishan.peiris@edoc.com',          crypt('Password123', gen_salt('bf', 10)), '0711999909', 'DOCTOR', true, true,  false, NOW() - INTERVAL '80 days',  NOW() - INTERVAL '6 days',   NULL),
(gen_random_uuid(), 'USR-DOC-10', 'Janaka Dassanayake',    'janaka.dassanayake@edoc.com',    crypt('Password123', gen_salt('bf', 10)), '0722000010', 'DOCTOR', true, true,  false, NOW() - INTERVAL '75 days',  NOW() - INTERVAL '8 days',   NULL),
(gen_random_uuid(), 'USR-DOC-11', 'Kumari Samaraweera',    'kumari.samaraweera@edoc.com',    crypt('Password123', gen_salt('bf', 10)), '0733111111', 'DOCTOR', true, true,  false, NOW() - INTERVAL '70 days',  NOW() - INTERVAL '10 days',  NULL),
(gen_random_uuid(), 'USR-DOC-12', 'Lasitha Athukorala',    'lasitha.athukorala@edoc.com',    crypt('Password123', gen_salt('bf', 10)), '0744222212', 'DOCTOR', true, true,  false, NOW() - INTERVAL '60 days',  NOW() - INTERVAL '3 days',   NULL),
(gen_random_uuid(), 'USR-DOC-13', 'Malsha Wijesinghe',     'malsha.wijesinghe@edoc.com',     crypt('Password123', gen_salt('bf', 10)), '0755333313', 'DOCTOR', true, true,  false, NOW() - INTERVAL '50 days',  NOW() - INTERVAL '5 days',   NULL),
(gen_random_uuid(), 'USR-DOC-14', 'Nalaka Hettige',        'nalaka.hettige@edoc.com',        crypt('Password123', gen_salt('bf', 10)), '0766444414', 'DOCTOR', true, true,  false, NOW() - INTERVAL '40 days',  NOW() - INTERVAL '2 days',   NULL),
(gen_random_uuid(), 'USR-DOC-15', 'Oshadi Sampath',        'oshadi.sampath@edoc.com',        crypt('Password123', gen_salt('bf', 10)), '0777555515', 'DOCTOR', true, true,  false, NOW() - INTERVAL '25 days',  NOW() - INTERVAL '1 day',    NULL);

-- ─── Patient Users ────────────────────────────────────────────────────────────
INSERT INTO users (id, user_id, name, email, password, phone_number, role, is_profile_created, is_active, is_deleted, created_at, updated_at, deleted_at) VALUES
(gen_random_uuid(), 'USR-PAT-01', 'Tharaka Nanayakkara',   'tharaka.nanayakkara@edoc.com',   crypt('Password123', gen_salt('bf', 10)), '0711100001', 'PATIENT', true, false, false, NOW() - INTERVAL '100 days', NOW() - INTERVAL '50 days',  NULL),
(gen_random_uuid(), 'USR-PAT-02', 'Udari Kotuwegoda',      'udari.kotuwegoda@edoc.com',      crypt('Password123', gen_salt('bf', 10)), '0722200002', 'PATIENT', true, false, true,  NOW() - INTERVAL '95 days',  NOW() - INTERVAL '45 days',  NOW() - INTERVAL '42 days'),
(gen_random_uuid(), 'USR-PAT-03', 'Vimukthi Rathnasiri',   'vimukthi.rathnasiri@edoc.com',   crypt('Password123', gen_salt('bf', 10)), '0733300003', 'PATIENT', true, true,  false, NOW() - INTERVAL '90 days',  NOW() - INTERVAL '2 days',   NULL),
(gen_random_uuid(), 'USR-PAT-04', 'Wasantha Alwis',        'wasantha.alwis@edoc.com',        crypt('Password123', gen_salt('bf', 10)), '0744400004', 'PATIENT', true, true,  false, NOW() - INTERVAL '85 days',  NOW() - INTERVAL '7 days',   NULL),
(gen_random_uuid(), 'USR-PAT-05', 'Yasiru Vithanage',      'yasiru.vithanage@edoc.com',      crypt('Password123', gen_salt('bf', 10)), '0755500005', 'PATIENT', true, true,  false, NOW() - INTERVAL '80 days',  NOW() - INTERVAL '4 days',   NULL),
(gen_random_uuid(), 'USR-PAT-06', 'Amali Udagedara',       'amali.udagedara@edoc.com',       crypt('Password123', gen_salt('bf', 10)), '0766600006', 'PATIENT', true, true,  false, NOW() - INTERVAL '75 days',  NOW() - INTERVAL '1 day',    NULL),
(gen_random_uuid(), 'USR-PAT-07', 'Binara Harshana',       'binara.harshana@edoc.com',       crypt('Password123', gen_salt('bf', 10)), '0777700007', 'PATIENT', true, true,  false, NOW() - INTERVAL '70 days',  NOW() - INTERVAL '3 days',   NULL),
(gen_random_uuid(), 'USR-PAT-08', 'Chamila Sampath',       'chamila.sampath@edoc.com',       crypt('Password123', gen_salt('bf', 10)), '0788800008', 'PATIENT', true, true,  false, NOW() - INTERVAL '65 days',  NOW() - INTERVAL '5 days',   NULL),
(gen_random_uuid(), 'USR-PAT-09', 'Danushka Samarakoon',   'danushka.samarakoon@edoc.com',   crypt('Password123', gen_salt('bf', 10)), '0711900009', 'PATIENT', true, true,  false, NOW() - INTERVAL '60 days',  NOW() - INTERVAL '8 days',   NULL),
(gen_random_uuid(), 'USR-PAT-10', 'Erandi Wickremaratne',  'erandi.wickremaratne@edoc.com',  crypt('Password123', gen_salt('bf', 10)), '0722000010', 'PATIENT', true, true,  false, NOW() - INTERVAL '55 days',  NOW() - INTERVAL '2 days',   NULL),
(gen_random_uuid(), 'USR-PAT-11', 'Farhan Saleem',         'farhan.saleem@edoc.com',         crypt('Password123', gen_salt('bf', 10)), '0733100011', 'PATIENT', true, true,  false, NOW() - INTERVAL '50 days',  NOW() - INTERVAL '6 days',   NULL),
(gen_random_uuid(), 'USR-PAT-12', 'Gimhan Perera',         'gimhan.perera@edoc.com',         crypt('Password123', gen_salt('bf', 10)), '0744200012', 'PATIENT', true, true,  false, NOW() - INTERVAL '40 days',  NOW() - INTERVAL '9 days',   NULL),
(gen_random_uuid(), 'USR-PAT-13', 'Hasitha Jayasena',      'hasitha.jayasena@edoc.com',      crypt('Password123', gen_salt('bf', 10)), '0755300013', 'PATIENT', true, true,  false, NOW() - INTERVAL '30 days',  NOW() - INTERVAL '3 days',   NULL),
(gen_random_uuid(), 'USR-PAT-14', 'Indika Kumara',         'indika.kumara@edoc.com',         crypt('Password123', gen_salt('bf', 10)), '0766400014', 'PATIENT', true, true,  false, NOW() - INTERVAL '20 days',  NOW() - INTERVAL '1 day',    NULL),
(gen_random_uuid(), 'USR-PAT-15', 'Janani Thilakarathne',  'janani.thilakarathne@edoc.com',  crypt('Password123', gen_salt('bf', 10)), '0777500015', 'PATIENT', true, true,  false, NOW() - INTERVAL '10 days',  NOW() - INTERVAL '1 day',    NULL);

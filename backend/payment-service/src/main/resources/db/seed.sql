-- ─────────────────────────────────────────────────────────────────────────────
-- Payment Service Seed Data
-- ─────────────────────────────────────────────────────────────────────────────
--
-- user_id (BIGINT) maps to the numeric suffix of the user-service patient
-- user_ids.  Only the 13 active, non-deleted patients are represented:
--
--   user_id 'USR-PAT-03' → Vimukthi Rathnasiri    vimukthi.rathnasiri@edoc.com   0733300003
--   user_id 'USR-PAT-04' → Wasantha Alwis         wasantha.alwis@edoc.com        0744400004
--   user_id 'USR-PAT-05' → Yasiru Vithanage       yasiru.vithanage@edoc.com      0755500005
--   user_id 'USR-PAT-06' → Amali Udagedara        amali.udagedara@edoc.com       0766600006
--   user_id 'USR-PAT-07' → Binara Harshana        binara.harshana@edoc.com       0777700007
--   user_id 'USR-PAT-08' → Chamila Sampath        chamila.sampath@edoc.com       0788800008
--   user_id 'USR-PAT-09' → Danushka Samarakoon    danushka.samarakoon@edoc.com   0711900009
--   user_id 'USR-PAT-10' → Erandi Wickremaratne   erandi.wickremaratne@edoc.com  0722000010
--   user_id 'USR-PAT-11' → Farhan Saleem          farhan.saleem@edoc.com         0733100011
--   user_id 'USR-PAT-12' → Gimhan Perera          gimhan.perera@edoc.com         0744200012
--   user_id 'USR-PAT-13' → Hasitha Jayasena       hasitha.jayasena@edoc.com      0755300013
--   user_id 'USR-PAT-14' → Indika Kumara          indika.kumara@edoc.com         0766400014
--   user_id 'USR-PAT-15' → Janani Thilakarathne   janani.thilakarathne@edoc.com  0777500015
--
-- USR-PAT-01 (is_active=false) and USR-PAT-02 (is_deleted=true) are excluded.
--
-- appointment_id (VARCHAR) represents string IDs from appointment-service (MongoDB).
-- Seed values use the format 'APT-SEED-NNNN' (1001–1040).
-- ─────────────────────────────────────────────────────────────────────────────

DELETE FROM payment_transaction_logs;
DELETE FROM billing_details;
DELETE FROM payments;

-- ─── Payments ────────────────────────────────────────────────────────────────
-- 40 payments spread across the 13 active patients (cycling user_id 3–15).
-- Status distribution: ~28 SUCCESS, ~7 PENDING, ~5 FAILED.

INSERT INTO payments (
    id,
    appointment_id,
    user_id,
    amount,
    currency,
    status,
    order_id,
    payhere_id,
    created_at,
    updated_at
)
SELECT
    (
        substr(md5('pmt-' || gs), 1, 8)  || '-' ||
        substr(md5('pmt-' || gs), 9, 4)  || '-' ||
        substr(md5('pmt-' || gs), 13, 4) || '-' ||
        substr(md5('pmt-' || gs), 17, 4) || '-' ||
        substr(md5('pmt-' || gs), 21, 12)
    )::uuid                                                       AS id,

    'APT-SEED-' || LPAD((1000 + gs)::text, 4, '0')              AS appointment_id,
    'USR-PAT-' || LPAD((3 + ((gs - 1) % 13))::text, 2, '0')       AS user_id,

    -- All consultation fees in LKR (1200 + gs * 190); range LKR 1390–8800
    ROUND((1200.00 + gs * 190.00)::numeric, 2)                    AS amount,

    'LKR'                                                         AS currency,

    CASE
        WHEN gs % 7 = 0 THEN 'FAILED'
        WHEN gs % 5 = 0 THEN 'PENDING'
        ELSE                 'SUCCESS'
    END                                                           AS status,

    'ORD-2026-' || LPAD(gs::text, 5, '0')                       AS order_id,

    -- PayHere only assigns an ID after a successful or failed webhook; PENDING has none
    CASE
        WHEN gs % 7 = 0 OR gs % 5 = 0 THEN NULL
        ELSE 'PH-' || LPAD((200000 + gs * 7)::text, 9, '0')
    END                                                           AS payhere_id,

    NOW() - ((41 - gs) * INTERVAL '2 days')                     AS created_at,
    NOW() - ((41 - gs) * INTERVAL '2 days') + INTERVAL '8 minutes' AS updated_at

FROM generate_series(1, 40) AS gs;

-- ── Lehan Navaratne (USR-PAT-16) explicit payments ──────────────────────────
INSERT INTO payments (id, appointment_id, user_id, amount, currency, status, order_id, payhere_id, created_at, updated_at)
VALUES
    ((substr(md5('pmt-41'),1,8)||'-'||substr(md5('pmt-41'),9,4)||'-'||substr(md5('pmt-41'),13,4)||'-'||substr(md5('pmt-41'),17,4)||'-'||substr(md5('pmt-41'),21,12))::uuid,
     'APT-SEED-1041', 'USR-PAT-16', 8990.00, 'LKR', 'SUCCESS',
     'ORD-2026-00041', 'PH-000200287',
     NOW() - INTERVAL '6 days',
     NOW() - INTERVAL '6 days' + INTERVAL '8 minutes'),

    ((substr(md5('pmt-42'),1,8)||'-'||substr(md5('pmt-42'),9,4)||'-'||substr(md5('pmt-42'),13,4)||'-'||substr(md5('pmt-42'),17,4)||'-'||substr(md5('pmt-42'),21,12))::uuid,
     'APT-SEED-1042', 'USR-PAT-16', 9180.00, 'LKR', 'SUCCESS',
     'ORD-2026-00042', 'PH-000200294',
     NOW() - INTERVAL '3 days',
     NOW() - INTERVAL '3 days' + INTERVAL '8 minutes'),

    ((substr(md5('pmt-43'),1,8)||'-'||substr(md5('pmt-43'),9,4)||'-'||substr(md5('pmt-43'),13,4)||'-'||substr(md5('pmt-43'),17,4)||'-'||substr(md5('pmt-43'),21,12))::uuid,
     'APT-SEED-1043', 'USR-PAT-16', 9370.00, 'LKR', 'PENDING',
     'ORD-2026-00043', NULL,
     NOW() - INTERVAL '1 day',
     NOW() - INTERVAL '1 day' + INTERVAL '8 minutes');

-- ─── Transaction Logs ─────────────────────────────────────────────────────────
-- Each payment receives a full lifecycle log sequence.
-- PENDING payments stop after GATEWAY_REDIRECT (still waiting on user).
-- SUCCESS payments: INITIATED → REDIRECT → WEBHOOK_RECEIVED → REST_NOTIFY_SENT
-- FAILED  payments: INITIATED → REDIRECT → WEBHOOK_RECEIVED → REST_NOTIFY_FAILED

-- Log 1: PAYMENT_INITIATED – always present at payment creation time
INSERT INTO payment_transaction_logs (id, payment_id, event, raw_payload, created_at)
SELECT
    (
        substr(md5('tl1-' || p.order_id), 1, 8)  || '-' ||
        substr(md5('tl1-' || p.order_id), 9, 4)  || '-' ||
        substr(md5('tl1-' || p.order_id), 13, 4) || '-' ||
        substr(md5('tl1-' || p.order_id), 17, 4) || '-' ||
        substr(md5('tl1-' || p.order_id), 21, 12)
    )::uuid,
    p.id,
    'PAYMENT_INITIATED',
    jsonb_build_object(
        'orderId',       p.order_id,
        'appointmentId', p.appointment_id,
        'userId',        p.user_id,
        'amount',        p.amount,
        'currency',      p.currency
    ),
    p.created_at
FROM payments p;

-- Log 2: GATEWAY_REDIRECT – user browser sent to PayHere checkout page
INSERT INTO payment_transaction_logs (id, payment_id, event, raw_payload, created_at)
SELECT
    (
        substr(md5('tl2-' || p.order_id), 1, 8)  || '-' ||
        substr(md5('tl2-' || p.order_id), 9, 4)  || '-' ||
        substr(md5('tl2-' || p.order_id), 13, 4) || '-' ||
        substr(md5('tl2-' || p.order_id), 17, 4) || '-' ||
        substr(md5('tl2-' || p.order_id), 21, 12)
    )::uuid,
    p.id,
    'GATEWAY_REDIRECT',
    jsonb_build_object(
        'orderId',   p.order_id,
        'gateway',   'payhere.lk',
        'returnUrl', 'https://app.edoc.lk/payments/return',
        'cancelUrl', 'https://app.edoc.lk/payments/cancel'
    ),
    p.created_at + INTERVAL '20 seconds'
FROM payments p;

-- Log 3: WEBHOOK_RECEIVED – PayHere posts back for SUCCESS and FAILED payments
INSERT INTO payment_transaction_logs (id, payment_id, event, raw_payload, created_at)
SELECT
    (
        substr(md5('tl3-' || p.order_id), 1, 8)  || '-' ||
        substr(md5('tl3-' || p.order_id), 9, 4)  || '-' ||
        substr(md5('tl3-' || p.order_id), 13, 4) || '-' ||
        substr(md5('tl3-' || p.order_id), 17, 4) || '-' ||
        substr(md5('tl3-' || p.order_id), 21, 12)
    )::uuid,
    p.id,
    'WEBHOOK_RECEIVED',
    CASE p.status
        WHEN 'SUCCESS' THEN jsonb_build_object(
            'merchant_id',      'TestMerchant001',
            'order_id',         p.order_id,
            'payment_id',       p.payhere_id,
            'status_code',      2,
            'status_message',   'Successfully Completed',
            'payhere_amount',   p.amount,
            'payhere_currency', p.currency,
            'method', (ARRAY['VISA', 'MASTER', 'AMEX', 'eZCash'])
                          [(abs(hashtext(p.order_id)) % 4 + 1)::int]
        )
        ELSE jsonb_build_object(
            'merchant_id',      'TestMerchant001',
            'order_id',         p.order_id,
            'status_code',      -1,
            'status_message',   'Payment was cancelled',
            'payhere_amount',   p.amount,
            'payhere_currency', p.currency
        )
    END,
    p.updated_at - INTERVAL '2 minutes'
FROM payments p
WHERE p.status IN ('SUCCESS', 'FAILED');

-- Log 4: REST_NOTIFY_SENT – appointment-service notified after SUCCESS
INSERT INTO payment_transaction_logs (id, payment_id, event, raw_payload, created_at)
SELECT
    (
        substr(md5('tl4-' || p.order_id), 1, 8)  || '-' ||
        substr(md5('tl4-' || p.order_id), 9, 4)  || '-' ||
        substr(md5('tl4-' || p.order_id), 13, 4) || '-' ||
        substr(md5('tl4-' || p.order_id), 17, 4) || '-' ||
        substr(md5('tl4-' || p.order_id), 21, 12)
    )::uuid,
    p.id,
    'REST_NOTIFY_SENT',
    jsonb_build_object(
        'orderId',         p.order_id,
        'appointmentId',   p.appointment_id,
        'notifiedService', 'appointment-service',
        'httpStatus',      200,
        'attempt',         1
    ),
    p.updated_at
FROM payments p
WHERE p.status = 'SUCCESS';

-- Log 5: REST_NOTIFY_FAILED – appointment-service unreachable on FAILED payments
INSERT INTO payment_transaction_logs (id, payment_id, event, raw_payload, created_at)
SELECT
    (
        substr(md5('tl5-' || p.order_id), 1, 8)  || '-' ||
        substr(md5('tl5-' || p.order_id), 9, 4)  || '-' ||
        substr(md5('tl5-' || p.order_id), 13, 4) || '-' ||
        substr(md5('tl5-' || p.order_id), 17, 4) || '-' ||
        substr(md5('tl5-' || p.order_id), 21, 12)
    )::uuid,
    p.id,
    'REST_NOTIFY_FAILED',
    jsonb_build_object(
        'orderId',         p.order_id,
        'appointmentId',   p.appointment_id,
        'notifiedService', 'appointment-service',
        'httpStatus',      503,
        'reason',          'service_unavailable',
        'retryable',       true,
        'attempt',         1
    ),
    p.updated_at
FROM payments p
WHERE p.status = 'FAILED';

-- ─── Billing Details ──────────────────────────────────────────────────────────
-- The CTE mirrors the exact names, emails and phone numbers from the
-- user-service seed for USR-PAT-03 through USR-PAT-15.
-- Joined to payments on user_id so every billing row is tied to the
-- correct patient identity.

WITH patients (user_id, full_name, email, phone, city) AS (
    VALUES
    ('USR-PAT-03', 'Vimukthi Rathnasiri',  'vimukthi.rathnasiri@edoc.com',  '0733300003', 'Colombo'),
    ('USR-PAT-04', 'Wasantha Alwis',       'wasantha.alwis@edoc.com',       '0744400004', 'Kandy'),
    ('USR-PAT-05', 'Yasiru Vithanage',     'yasiru.vithanage@edoc.com',     '0755500005', 'Galle'),
    ('USR-PAT-06', 'Amali Udagedara',      'amali.udagedara@edoc.com',      '0766600006', 'Negombo'),
    ('USR-PAT-07', 'Binara Harshana',      'binara.harshana@edoc.com',      '0777700007', 'Matara'),
    ('USR-PAT-08', 'Chamila Sampath',      'chamila.sampath@edoc.com',      '0788800008', 'Kurunegala'),
    ('USR-PAT-09', 'Danushka Samarakoon',  'danushka.samarakoon@edoc.com',  '0711900009', 'Jaffna'),
    ('USR-PAT-10', 'Erandi Wickremaratne', 'erandi.wickremaratne@edoc.com', '0722000010', 'Batticaloa'),
    ('USR-PAT-11', 'Farhan Saleem',        'farhan.saleem@edoc.com',        '0733100011', 'Ratnapura'),
    ('USR-PAT-12', 'Gimhan Perera',        'gimhan.perera@edoc.com',        '0744200012', 'Badulla'),
    ('USR-PAT-13', 'Hasitha Jayasena',     'hasitha.jayasena@edoc.com',     '0755300013', 'Anuradhapura'),
    ('USR-PAT-14', 'Indika Kumara',        'indika.kumara@edoc.com',        '0766400014', 'Nuwara Eliya'),
    ('USR-PAT-15', 'Janani Thilakarathne', 'janani.thilakarathne@edoc.com', '0777500015', 'Colombo'),
    ('USR-PAT-16', 'Lehan Navaratne',      'lehanxp@gmail.com',             '0788600016', 'Rajagiriya'))
)
INSERT INTO billing_details (
    id, payment_id, full_name, email, phone, address, city, country, created_at
)
SELECT
    (
        substr(md5('bill-' || p.order_id), 1, 8)  || '-' ||
        substr(md5('bill-' || p.order_id), 9, 4)  || '-' ||
        substr(md5('bill-' || p.order_id), 13, 4) || '-' ||
        substr(md5('bill-' || p.order_id), 17, 4) || '-' ||
        substr(md5('bill-' || p.order_id), 21, 12)
    )::uuid,
    p.id,
    pt.full_name,
    pt.email,
    pt.phone,
    ((abs(hashtext(p.order_id)) % 999 + 1)::text || ' ' ||
        (ARRAY[
            'Galle Road',       'Kandy Road',      'Negombo Road',    'High Level Road',
            'Baseline Road',    'Union Place',      'Marine Drive',    'Rajagiriya Road',
            'Duplication Road', 'Maharagama Road'
        ])[(abs(hashtext(p.order_id)) % 10 + 1)::int]
    ),
    pt.city,
    'Sri Lanka',
    p.created_at
FROM payments p
JOIN patients pt ON pt.user_id = p.user_id;

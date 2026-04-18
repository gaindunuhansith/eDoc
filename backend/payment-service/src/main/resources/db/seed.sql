DELETE FROM payment_transaction_logs;
DELETE FROM payments;

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
        substr(md5('payment-' || gs::text), 1, 8) || '-' ||
        substr(md5('payment-' || gs::text), 9, 4) || '-' ||
        substr(md5('payment-' || gs::text), 13, 4) || '-' ||
        substr(md5('payment-' || gs::text), 17, 4) || '-' ||
        substr(md5('payment-' || gs::text), 21, 12)
    )::uuid,
    1000 + gs,
    200 + (gs % 9),
    ROUND((75 + gs * 4.25)::numeric, 2),
    CASE WHEN gs % 2 = 0 THEN 'LKR' ELSE 'USD' END,
    CASE
        WHEN gs % 5 = 0 THEN 'FAILED'
        WHEN gs % 3 = 0 THEN 'PENDING'
        ELSE 'SUCCESS'
    END,
    'ORD-' || LPAD(gs::text, 6, '0'),
    CASE WHEN gs % 3 = 0 THEN NULL ELSE 'PH-' || LPAD((100000 + gs)::text, 8, '0') END,
    NOW() - (gs * INTERVAL '3 hours'),
    NOW() - (gs * INTERVAL '2 hours')
FROM generate_series(1, 40) AS gs;

INSERT INTO payment_transaction_logs (
    id,
    payment_id,
    event,
    raw_payload,
    created_at
)
SELECT
    (
        substr(md5('log-' || p.order_id || '-' || seq::text), 1, 8) || '-' ||
        substr(md5('log-' || p.order_id || '-' || seq::text), 9, 4) || '-' ||
        substr(md5('log-' || p.order_id || '-' || seq::text), 13, 4) || '-' ||
        substr(md5('log-' || p.order_id || '-' || seq::text), 17, 4) || '-' ||
        substr(md5('log-' || p.order_id || '-' || seq::text), 21, 12)
    )::uuid,
    p.id,
    CASE
        WHEN seq = 1 THEN 'PAYMENT_INITIATED'
        WHEN seq = 2 THEN 'WEBHOOK_RECEIVED'
        WHEN p.status = 'SUCCESS' THEN 'REST_NOTIFY_SENT'
        WHEN p.status = 'FAILED' THEN 'REST_NOTIFY_FAILED'
        ELSE 'RECONCILE_FLAGGED'
    END,
    jsonb_build_object(
        'orderId', p.order_id,
        'appointmentId', p.appointment_id,
        'status', p.status,
        'sequence', seq,
        'channel', CASE WHEN seq = 3 THEN 'bridge' ELSE 'gateway' END,
        'note', CASE
            WHEN p.status = 'SUCCESS' AND seq = 3 THEN 'Notification delivered'
            WHEN p.status = 'FAILED' AND seq = 3 THEN 'Appointment service unavailable'
            WHEN p.status = 'PENDING' AND seq = 3 THEN 'Queued for reconciliation'
            ELSE 'Lifecycle event'
        END
    ),
    p.created_at + (seq * INTERVAL '7 minutes')
FROM payments p
CROSS JOIN generate_series(1, 3) AS seq;

INSERT INTO payment_transaction_logs (
    id,
    payment_id,
    event,
    raw_payload,
    created_at
)
SELECT
    (
        substr(md5('retry-' || p.order_id), 1, 8) || '-' ||
        substr(md5('retry-' || p.order_id), 9, 4) || '-' ||
        substr(md5('retry-' || p.order_id), 13, 4) || '-' ||
        substr(md5('retry-' || p.order_id), 17, 4) || '-' ||
        substr(md5('retry-' || p.order_id), 21, 12)
    )::uuid,
    p.id,
    'REST_NOTIFY_FAILED',
    jsonb_build_object(
        'orderId', p.order_id,
        'attempt', 2,
        'reason', 'timeout',
        'retryable', true
    ),
    p.updated_at + INTERVAL '40 minutes'
FROM payments p
WHERE p.status = 'SUCCESS' AND p.appointment_id % 4 = 0;

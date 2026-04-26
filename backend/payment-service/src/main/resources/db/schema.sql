DROP TABLE IF EXISTS payment_transaction_logs;
DROP TABLE IF EXISTS payments;

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY,
    appointment_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL CHECK (currency IN ('LKR', 'USD')),
    status VARCHAR(16) NOT NULL CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    order_id VARCHAR(50) NOT NULL UNIQUE,
    payhere_id VARCHAR(50) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_transaction_logs (
    id UUID PRIMARY KEY,
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    event VARCHAR(100) NOT NULL,
    raw_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payment_transaction_logs_payment_id ON payment_transaction_logs(payment_id);

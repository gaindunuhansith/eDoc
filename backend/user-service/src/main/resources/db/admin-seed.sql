-- Replace the password hash below with a BCrypt hash generated for your chosen admin password.
-- Example plaintext password for this hash: Admin1234
INSERT INTO users (id, user_id, name, email, password, phone_number, role, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'System Admin',
    'admin@edoc.com',
    '$2a$10$2b0NUA4A4N6yH3M2f8y2jOfu1WTH0I1GtIsfRSAxEPPYUajF2iGaW',
    '0000000000',
    'ADMIN',
    now(),
    now()
)
ON CONFLICT (email) DO NOTHING;

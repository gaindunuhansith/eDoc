-- Requires pgcrypto for password hashing in seed.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id                 UUID         PRIMARY KEY,
    user_id            VARCHAR(255) NOT NULL UNIQUE,
    name               VARCHAR(255) NOT NULL,
    email              VARCHAR(255) NOT NULL UNIQUE,
    password           VARCHAR(255) NOT NULL,
    phone_number       VARCHAR(255) NOT NULL,
    role               VARCHAR(50)  NOT NULL,
    is_profile_created BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active          BOOLEAN      NOT NULL DEFAULT TRUE,
    is_deleted         BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMP    NOT NULL,
    updated_at         TIMESTAMP,
    deleted_at         TIMESTAMP
);

CREATE INDEX idx_users_user_id    ON users (user_id);
CREATE INDEX idx_users_email      ON users (email);
CREATE INDEX idx_users_role       ON users (role);
CREATE INDEX idx_users_is_active  ON users (is_active);
CREATE INDEX idx_users_is_deleted ON users (is_deleted);
CREATE INDEX idx_users_created_at ON users (created_at);

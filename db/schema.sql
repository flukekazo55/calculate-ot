-- Supabase/PostgreSQL schema for OT data storage.
-- Table name matches backend default: OT_TABLE_NAME=ot_data
-- One row is stored per OT dataset snapshot (default row id: singleton).

CREATE TABLE IF NOT EXISTS ot_data (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ot_data_payload_is_object CHECK (jsonb_typeof(payload) = 'object'),
  CONSTRAINT ot_data_payload_records_is_array CHECK (jsonb_typeof(payload->'records') = 'array'),
  CONSTRAINT ot_data_payload_last_update_is_string CHECK (jsonb_typeof(payload->'lastUpdate') = 'string')
);

CREATE INDEX IF NOT EXISTS idx_ot_data_updated_at
  ON ot_data (updated_at DESC);

-- Users table for register/login.
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower
  ON users ((LOWER(username)));

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower
  ON users ((LOWER(email)));

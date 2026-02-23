-- Neon/PostgreSQL schema for OT data storage.
-- Table name matches server default: OT_TABLE_NAME=ot_data

CREATE TABLE IF NOT EXISTS ot_data (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ot_data_updated_at ON ot_data (updated_at DESC);

-- Import OT payload JSON into Neon/PostgreSQL.
-- Required psql variable:
--   ot_payload -> compact JSON string from data.json
-- Optional psql variable:
--   ot_row_id  -> row key (default: singleton)
--
-- Example (PowerShell):
--   $json = (Get-Content data.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress)
--   psql "$env:DATABASE_URL" -f db/schema.sql
--   psql "$env:DATABASE_URL" -v ot_payload="$json" -f db/import_data.sql
--
-- Example (bash):
--   json="$(jq -c . data.json)"
--   psql "$DATABASE_URL" -f db/schema.sql
--   psql "$DATABASE_URL" -v ot_payload="$json" -f db/import_data.sql

\if :{?ot_row_id}
\else
\set ot_row_id singleton
\endif

\if :{?ot_payload}
\else
\echo 'ERROR: missing ot_payload variable'
\echo 'Usage: psql "$DATABASE_URL" -v ot_payload="<json>" -f db/import_data.sql'
\quit 1
\endif

INSERT INTO ot_data (id, payload, updated_at)
VALUES (:'ot_row_id', :'ot_payload'::jsonb, NOW())
ON CONFLICT (id)
DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW();

SELECT id, jsonb_array_length(payload->'records') AS record_count, updated_at
FROM ot_data
WHERE id = :'ot_row_id';

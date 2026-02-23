-- Rebuild OT data (truncate old data and insert new data)
-- IMPORTANT: Save this file as UTF-8

BEGIN;

-- Ensure UTF-8 on client side (useful when running via psql)
SET client_encoding = 'UTF8';

CREATE TABLE IF NOT EXISTS ot_data (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ot_data_updated_at ON ot_data (updated_at DESC);

-- Remove old rows
TRUNCATE TABLE ot_data;

-- Insert fresh snapshot (replace JSON below with UTF-8 Thai text)
INSERT INTO ot_data (id, payload, updated_at)
VALUES (
  'singleton',
  $ot$
  {
    "records": [
      { "id": 1763023643787, "date": "13/11/2568", "type": "earn", "activity": "Backup OT", "dayType": "weekend", "value": 24 },

      { "id": 1763700051216, "date": "21/11/2568", "type": "use", "activity": "ทำธุระ", "dayType": "use", "value": -2 },

      { "id": 1763956254814, "date": "24/11/2568", "type": "use", "activity": "ลาไปรับปริญญา", "dayType": "use", "value": -7.5 },

      { "id": 1764209004986, "date": "18/11/2568", "type": "earn", "activity": "Support Case", "dayType": "weekday", "value": 3 },
      { "id": 1764209027114, "date": "19/11/2568", "type": "earn", "activity": "Support Case", "dayType": "weekday", "value": 2.25 },
      { "id": 1764209040709, "date": "20/11/2568", "type": "earn", "activity": "Support Case", "dayType": "weekday", "value": 2.25 },
      { "id": 1764209156123, "date": "21/11/2568", "type": "earn", "activity": "Support Case", "dayType": "weekday", "value": 1.5 },
      { "id": 1764209209810, "date": "22/11/2568", "type": "earn", "activity": "Support Case", "dayType": "weekday", "value": 2.25 },
      { "id": 1764209222233, "date": "24/11/2568", "type": "earn", "activity": "Support Case", "dayType": "weekday", "value": 3 },

      { "id": 1765013784208, "timestamp": 1765013784208, "date": "6/12/2568", "type": "earn", "activity": "Support Production Case", "dayType": "weekend", "value": 7 },

      { "id": 1765859292400, "date": "19/12/2568", "type": "use", "activity": "ลาไปเที่ยวโคราช", "dayType": "use", "value": -7.5 },

      { "id": 1766472040551, "date": "23/12/2568", "type": "use", "activity": "ลาพักผ่อน", "dayType": "use", "value": -15 }
    ],
    "lastUpdate": "23/12/2568 13:40:40"
  }
  $ot$::jsonb,
  NOW()
);

COMMIT;

-- Verify
SELECT id, jsonb_array_length(payload->'records') AS record_count, updated_at
FROM ot_data
WHERE id = 'singleton';
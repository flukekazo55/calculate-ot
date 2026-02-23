-- Generated from data.json snapshot on 2026-02-23 13:35:14 +07:00
-- This script imports current local data into PostgreSQL/Supabase.

CREATE TABLE IF NOT EXISTS ot_data (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ot_data_updated_at ON ot_data (updated_at DESC);

INSERT INTO ot_data (id, payload, updated_at)
VALUES ('singleton', $ot${"records":[{"id":1763023643787,"date":"13/11/2568","type":"earn","activity":"Backup OT","dayType":"weekend","value":24},{"id":1763700051216,"date":"21/11/2568","type":"use","activity":"à¸—à¸³à¸˜à¸¸à¸£à¸°","dayType":"use","value":-2,"formatted":"[à¸—à¸³à¸˜à¸¸à¸£à¸°] à¸§à¸±à¸™à¸—à¸µà¹ˆ 21/11/2568 [à¹ƒà¸Šà¹‰ 2 à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡ 0 à¸™à¸²à¸—à¸µ] à¹ƒà¸Šà¹‰à¸§à¸±à¸™à¸«à¸¢à¸¸à¸” OT à¸ˆà¸²à¸ [24 à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡ 0 à¸™à¸²à¸—à¸µ] à¹€à¸«à¸¥à¸·à¸­ [22 à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡ 0 à¸™à¸²à¸—à¸µ] #Leave","meta":{"spentHours":2,"beforeHours":24,"afterHours":22}},{"id":1763956254814,"date":"24/11/2568","type":"use","activity":"à¸¥à¸²à¹„à¸›à¸‡à¸²à¸™à¸£à¸±à¸šà¸›à¸£à¸´à¸à¸à¸²","dayType":"use","value":-7.5,"formatted":"[à¸¥à¸²à¹„à¸›à¸‡à¸²à¸™à¸£à¸±à¸šà¸›à¸£à¸´à¸à¸à¸²] à¸§à¸±à¸™à¸—à¸µà¹ˆ 24/11/2568 [à¹ƒà¸Šà¹‰ 7 à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡ 30 à¸™à¸²à¸—à¸µ] à¹ƒà¸Šà¹‰à¸§à¸±à¸™à¸«à¸¢à¸¸à¸” OT à¸ˆà¸²à¸ [22 à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡ 0 à¸™à¸²à¸—à¸µ] à¹€à¸«à¸¥à¸·à¸­ [14 à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡ 30 à¸™à¸²à¸—à¸µ] #Leave","meta":{"spentHours":7.5,"beforeHours":22,"afterHours":14.5}},{"id":1764209004986,"date":"18/11/2568","type":"earn","activity":"Support Case","dayType":"weekday","value":3},{"id":1764209027114,"date":"19/11/2568","type":"earn","activity":"Support Case","dayType":"weekday","value":2.25},{"id":1764209040709,"date":"20/11/2568","type":"earn","activity":"Support Case","dayType":"weekday","value":2.25},{"id":1764209156123,"date":"21/11/2568","type":"earn","activity":"Support Case","dayType":"weekday","value":1.5},{"id":1764209209810,"date":"22/11/2568","type":"earn","activity":"Support Case","dayType":"weekday","value":2.25},{"id":1764209222233,"date":"24/11/2568","type":"earn","activity":"Support Case","dayType":"weekday","value":3},{"id":1765013784208,"timestamp":1765013784208,"date":"6/12/2568","type":"earn","activity":"Support Production Case","dayType":"weekend","value":7},{"id":1765859292400,"date":"19/12/2568","type":"use","activity":"à¸¥à¸²à¹„à¸›à¹€à¸—à¸µà¹ˆà¸¢à¸§à¹‚à¸„à¸£à¸²à¸Š","dayType":"use","value":-7.5,"formatted":"[à¸¥à¸²à¹„à¸›à¹€à¸—à¸µà¹ˆà¸¢à¸§à¹‚à¸„à¸£à¸²à¸Š] à¸§à¸±à¸™à¸—à¸µà¹ˆ 16/12/2568 [à¹ƒà¸Šà¹‰ 7 à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡ 30 à¸™à¸²à¸—à¸µ] à¹ƒà¸Šà¹‰à¸§à¸±à¸™à¸«à¸¢à¸¸à¸” OT à¸ˆà¸²à¸ [35 à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡ 45 à¸™à¸²à¸—à¸µ] à¹€à¸«à¸¥à¸·à¸­ [28 à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡ 15 à¸™à¸²à¸—à¸µ] #Leave","meta":{"spentHours":7.5,"beforeHours":35.75,"afterHours":28.25}},{"id":1766472040551,"date":"23/12/2568","type":"use","activity":"à¸¥à¸²à¸žà¸±à¸à¸œà¹ˆà¸­à¸™","dayType":"use","value":-15,"formatted":"[à¸¥à¸²à¸žà¸±à¸à¸œà¹ˆà¸­à¸™] à¸§à¸±à¸™à¸—à¸µà¹ˆ 23/12/2568 [à¹ƒà¸Šà¹‰ 15 à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡ 0 à¸™à¸²à¸—à¸µ] à¹ƒà¸Šà¹‰à¸§à¸±à¸™à¸«à¸¢à¸¸à¸” OT à¸ˆà¸²à¸ [28 à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡ 15 à¸™à¸²à¸—à¸µ] à¹€à¸«à¸¥à¸·à¸­ [13 à¸Šà¸±à¹ˆà¸§à¹‚à¸¡à¸‡ 15 à¸™à¸²à¸—à¸µ] #Leave","meta":{"spentHours":15,"beforeHours":28.25,"afterHours":13.25}}],"lastUpdate":"23/12/2568 13:40:40"}$ot$::jsonb, NOW())
ON CONFLICT (id)
DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW();

SELECT id, jsonb_array_length(payload->'records') AS record_count, updated_at
FROM ot_data
WHERE id = 'singleton';

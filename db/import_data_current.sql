BEGIN;

SET client_encoding = 'UTF8';

CREATE TABLE IF NOT EXISTS ot_data (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ot_data_updated_at ON ot_data (updated_at DESC);

TRUNCATE TABLE ot_data;

INSERT INTO ot_data (id, payload, updated_at)
VALUES (
  'singleton',
  $ot$
  {
    "records": [
      { "id": 1763023643787, "date": "13/11/2568", "type": "earn", "value": 24, "dayType": "weekend", "activity": "Backup OT" },
      { "id": 1763700051216, "date": "21/11/2568", "type": "use", "value": -2, "dayType": "use", "activity": "ทำธุระ" },
      { "id": 1763956254814, "date": "24/11/2568", "type": "use", "value": -7.5, "dayType": "use", "activity": "ลาไปรับปริญญา" },
      { "id": 1764209004986, "date": "18/11/2568", "type": "earn", "value": 3, "dayType": "weekday", "activity": "Support Case" },
      { "id": 1764209027114, "date": "19/11/2568", "type": "earn", "value": 2.25, "dayType": "weekday", "activity": "Support Case" },
      { "id": 1764209040709, "date": "20/11/2568", "type": "earn", "value": 2.25, "dayType": "weekday", "activity": "Support Case" },
      { "id": 1764209156123, "date": "21/11/2568", "type": "earn", "value": 1.5, "dayType": "weekday", "activity": "Support Case" },
      { "id": 1764209209810, "date": "22/11/2568", "type": "earn", "value": 2.25, "dayType": "weekday", "activity": "Support Case" },
      { "id": 1764209222233, "date": "24/11/2568", "type": "earn", "value": 3, "dayType": "weekday", "activity": "Support Case" },
      { "id": 1765013784208, "date": "6/12/2568", "type": "earn", "value": 7, "dayType": "weekend", "activity": "Support Production Case", "timestamp": 1765013784208 },
      { "id": 1765859292400, "date": "19/12/2568", "type": "use", "value": -7.5, "dayType": "use", "activity": "ลาไปเที่ยวโคราช" },
      { "id": 1766472040551, "date": "23/12/2568", "type": "use", "value": -15, "dayType": "use", "activity": "ลาพักผ่อน" },
      {
        "id": 1771830016822,
        "date": "23/2/2569",
        "meta": { "afterHours": 5.75, "spentHours": 7.5, "beforeHours": 13.25 },
        "type": "use",
        "value": -7.5,
        "dayType": "use",
        "activity": "08/01/2026: ลาไปทำธุระส่วนตัว",
        "formatted": "[08/01/2026: ลาไปทำธุระส่วนตัว] วันที่ 23/2/2569 [ใช้ 7 ชั่วโมง 30 นาที] ใช้วันหยุด OT จาก [13 ชั่วโมง 15 นาที] เหลือ [5 ชั่วโมง 45 นาที] #Leave"
      },
      { "id": 1771830046992, "date": "23/2/2569", "type": "earn", "value": 7, "dayType": "weekend", "activity": "Support OTC Production" },
      {
        "id": 1771830076665,
        "date": "23/2/2569",
        "meta": { "afterHours": 5.25, "spentHours": 7.5, "beforeHours": 12.75 },
        "type": "use",
        "value": -7.5,
        "dayType": "use",
        "activity": "30/01/2026: ลาไปทำธุระส่วนตัว",
        "formatted": "[30/01/2026: ลาไปทำธุระส่วนตัว] วันที่ 23/2/2569 [ใช้ 7 ชั่วโมง 30 นาที] ใช้วันหยุด OT จาก [12 ชั่วโมง 45 นาที] เหลือ [5 ชั่วโมง 15 นาที] #Leave"
      },
      {
        "id": 1771830166737,
        "date": "23/2/2569",
        "meta": { "afterHours": 1.25, "spentHours": 4, "beforeHours": 5.25 },
        "type": "use",
        "value": -4,
        "dayType": "use",
        "activity": "02/02/2026: ลาครึ่งบ่ายไปทำธุระ",
        "formatted": "[02/02/2026: ลาครึ่งบ่ายไปทำธุระ] วันที่ 23/2/2569 [ใช้ 4 ชั่วโมง 0 นาที] ใช้วันหยุด OT จาก [5 ชั่วโมง 15 นาที] เหลือ [1 ชั่วโมง 15 นาที] #Leave"
      },
      { "id": 1771830292258, "date": "23/2/2569", "type": "earn", "value": 7, "dayType": "weekend", "activity": "Support OTC Production" },
      { "id": 1771830433095, "date": "23/2/2569", "type": "earn", "value": 3, "dayType": "weekday", "activity": "Deploy OTC LE Production" },
      { "id": 1771830457207, "date": "23/2/2569", "type": "earn", "value": 1.5, "dayType": "weekday", "activity": "Deploy OTC LE Production" }
    ],
    "lastUpdate": "23/2/2569 14:07:37"
  }
  $ot$::jsonb,
  NOW()
);

COMMIT;

SELECT id, jsonb_array_length(payload->'records') AS record_count, updated_at
FROM ot_data
WHERE id = 'singleton';

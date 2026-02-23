const { Pool } = require("pg");
const { getStore } = require("@netlify/blobs");

const STORE_NAME = "ot-tracker";
const STORE_KEY = "data";
const DEFAULT_DATA = { records: [], lastUpdate: "" };

const DATABASE_URL = String(process.env.DATABASE_URL || "").trim();
const OT_TABLE_NAME = String(process.env.OT_TABLE_NAME || "ot_data").trim();
const OT_ROW_ID = String(process.env.OT_ROW_ID || "singleton").trim();
const USE_POSTGRES = DATABASE_URL.length > 0;
const USE_SSL =
  /sslmode=require/i.test(DATABASE_URL) || /neon\.tech/i.test(DATABASE_URL);

const pool = USE_POSTGRES
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: USE_SSL ? { rejectUnauthorized: false } : undefined,
    })
  : null;

let schemaReadyPromise = null;

function cloneDefaultData() {
  return {
    records: [],
    lastUpdate: "",
  };
}

function normalizeData(value) {
  if (!value || typeof value !== "object") return cloneDefaultData();
  const records = Array.isArray(value.records) ? value.records : [];
  const lastUpdate =
    typeof value.lastUpdate === "string" ? value.lastUpdate : "";
  return { records, lastUpdate };
}

async function ensureSchema() {
  if (!USE_POSTGRES) return;
  if (!schemaReadyPromise) {
    const tableNameSafe = OT_TABLE_NAME.replace(/[^a-zA-Z0-9_]/g, "");
    if (!tableNameSafe) {
      throw new Error("Invalid OT_TABLE_NAME");
    }
    schemaReadyPromise = pool.query(`
      CREATE TABLE IF NOT EXISTS ${tableNameSafe} (
        id TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }
  await schemaReadyPromise;
}

function getDataStore() {
  return getStore(STORE_NAME);
}

async function readDataFromPostgres() {
  await ensureSchema();
  const tableNameSafe = OT_TABLE_NAME.replace(/[^a-zA-Z0-9_]/g, "");
  const result = await pool.query(
    `SELECT payload FROM ${tableNameSafe} WHERE id = $1 LIMIT 1`,
    [OT_ROW_ID]
  );
  if (!result.rows.length) return cloneDefaultData();
  return normalizeData(result.rows[0].payload);
}

async function writeDataToPostgres(value) {
  await ensureSchema();
  const normalized = normalizeData(value);
  const tableNameSafe = OT_TABLE_NAME.replace(/[^a-zA-Z0-9_]/g, "");
  await pool.query(
    `
      INSERT INTO ${tableNameSafe} (id, payload, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (id)
      DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
    `,
    [OT_ROW_ID, JSON.stringify(normalized)]
  );
  return normalized;
}

async function readDataFromBlobs() {
  const store = getDataStore();
  const value = await store.get(STORE_KEY, { type: "json" });
  if (!value) return cloneDefaultData();
  return normalizeData(value);
}

async function writeDataToBlobs(value) {
  const store = getDataStore();
  const normalized = normalizeData(value);
  await store.setJSON(STORE_KEY, normalized);
  return normalized;
}

async function readData() {
  if (USE_POSTGRES) {
    return readDataFromPostgres();
  }
  return readDataFromBlobs();
}

async function writeData(value) {
  if (USE_POSTGRES) {
    return writeDataToPostgres(value);
  }
  return writeDataToBlobs(value);
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "Content-Type",
    },
    body: JSON.stringify(body),
  };
}

function optionsResponse() {
  return {
    statusCode: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "Content-Type",
    },
    body: "",
  };
}

function methodNotAllowed(allowedMethod) {
  return jsonResponse(405, {
    error: "method_not_allowed",
    details: `Use ${allowedMethod}`,
  });
}

module.exports = {
  DEFAULT_DATA,
  jsonResponse,
  optionsResponse,
  methodNotAllowed,
  readData,
  writeData,
};

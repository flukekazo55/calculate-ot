const { getStore } = require("@netlify/blobs");

const STORE_NAME = "ot-tracker";
const STORE_KEY = "data";
const DEFAULT_DATA = { records: [], lastUpdate: "" };

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

function getDataStore() {
  return getStore(STORE_NAME);
}

async function readData() {
  const store = getDataStore();
  const value = await store.get(STORE_KEY, { type: "json" });
  if (!value) return cloneDefaultData();
  return normalizeData(value);
}

async function writeData(value) {
  const store = getDataStore();
  const normalized = normalizeData(value);
  await store.setJSON(STORE_KEY, normalized);
  return normalized;
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

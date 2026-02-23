const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const { Pool } = require("pg");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ENABLE_GIT_SYNC = process.env.ENABLE_GIT_SYNC !== "false";
const CORS_ORIGINS_RAW = (process.env.CORS_ORIGINS || "").trim();
const CORS_ORIGINS = CORS_ORIGINS_RAW
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const ALLOW_ALL_ORIGINS = CORS_ORIGINS.includes("*");

const DATABASE_URL = String(process.env.DATABASE_URL || "").trim();
const USE_POSTGRES = DATABASE_URL.length > 0;
const USE_SSL =
  /sslmode=require/i.test(DATABASE_URL) || /neon\.tech/i.test(DATABASE_URL);
const OT_TABLE_NAME = String(process.env.OT_TABLE_NAME || "ot_data").trim();
const OT_ROW_ID = String(process.env.OT_ROW_ID || "singleton").trim();
const TABLE_NAME_SAFE = OT_TABLE_NAME.replace(/[^a-zA-Z0-9_]/g, "");

const pool = USE_POSTGRES
  ? new Pool({
      connectionString: DATABASE_URL,
      ssl: USE_SSL ? { rejectUnauthorized: false } : undefined,
    })
  : null;
let schemaReadyPromise = null;

const DATA_FILE = path.join(__dirname, "data.json");
const DEFAULT_DATA = { records: [], lastUpdate: "" };
const execAsync = util.promisify(exec);
const gitOpts = { cwd: __dirname };

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

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
  }
}

function readDataFile() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf8") || "{}";
  try {
    return normalizeData(JSON.parse(raw));
  } catch (err) {
    throw new Error(`Invalid JSON in ${DATA_FILE}: ${err.message}`);
  }
}

function writeDataFile(value) {
  const normalized = normalizeData(value);
  fs.writeFileSync(DATA_FILE, JSON.stringify(normalized, null, 2));
  return normalized;
}

async function ensureSchema() {
  if (!USE_POSTGRES) return;
  if (!TABLE_NAME_SAFE) {
    throw new Error("Invalid OT_TABLE_NAME");
  }
  if (!schemaReadyPromise) {
    schemaReadyPromise = pool.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME_SAFE} (
        id TEXT PRIMARY KEY,
        payload JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }
  await schemaReadyPromise;
}

async function readDataFromPostgres() {
  await ensureSchema();
  const result = await pool.query(
    `SELECT payload FROM ${TABLE_NAME_SAFE} WHERE id = $1 LIMIT 1`,
    [OT_ROW_ID]
  );
  if (!result.rows.length) {
    return cloneDefaultData();
  }
  return normalizeData(result.rows[0].payload);
}

async function writeDataToPostgres(value) {
  await ensureSchema();
  const normalized = normalizeData(value);
  await pool.query(
    `
      INSERT INTO ${TABLE_NAME_SAFE} (id, payload, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (id)
      DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
    `,
    [OT_ROW_ID, JSON.stringify(normalized)]
  );
  return normalized;
}

async function readData() {
  if (USE_POSTGRES) {
    return readDataFromPostgres();
  }
  return readDataFile();
}

async function writeData(value) {
  if (USE_POSTGRES) {
    return writeDataToPostgres(value);
  }
  return writeDataFile(value);
}

async function resetData() {
  return writeData(cloneDefaultData());
}

async function abortMergeStates() {
  // Best-effort cleanup so a previous failed merge/rebase does not block sync.
  try {
    await execAsync("git merge --abort", gitOpts);
  } catch {}
  try {
    await execAsync("git rebase --abort", gitOpts);
  } catch {}
}

async function isAheadOfRemote() {
  try {
    const { stdout } = await execAsync("git status --short --branch", gitOpts);
    return /\bahead\s+\d+/i.test(stdout);
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (ALLOW_ALL_ORIGINS) return true;
  if (CORS_ORIGINS.length > 0) {
    return CORS_ORIGINS.includes(origin);
  }
  return (
    /^http:\/\/localhost(?::\d+)?$/i.test(origin) ||
    /^http:\/\/127\.0\.0\.1(?::\d+)?$/i.test(origin) ||
    /^https:\/\/[a-z0-9-]+\.github\.io$/i.test(origin)
  );
}

app.use(express.json());
app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({ error: "cors_forbidden", origin });
  }
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.static(__dirname));

app.get("/load", async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "load_failed", details: err.message });
  }
});

app.post("/save", async (req, res) => {
  try {
    const saved = await writeData(req.body);
    res.json({ message: "saved", savedData: saved });
  } catch (err) {
    res.status(500).json({ error: "save_failed", details: err.message });
  }
});

app.post("/reset", async (req, res) => {
  try {
    const resetValue = await resetData();
    res.json({ message: "reset", resetData: resetValue });
  } catch (err) {
    res.status(500).json({ error: "reset_failed", details: err.message });
  }
});

app.post("/sync", async (req, res) => {
  if (USE_POSTGRES) {
    return res.status(501).json({
      error: "sync_disabled",
      details: "Git sync is not available when DATABASE_URL is enabled.",
    });
  }
  if (!ENABLE_GIT_SYNC) {
    return res.status(501).json({
      error: "sync_disabled",
      details: "Git sync is disabled on this deployment.",
    });
  }

  try {
    ensureDataFile();
    await abortMergeStates();
    let pullOutput = "";
    let pushOutput = "";
    let commitOutput = "";
    let pulledUpdates = false;

    try {
      const { stdout, stderr } = await execAsync("git pull --rebase --autostash", gitOpts);
      pullOutput = `${stdout || ""}${stderr || ""}`.trim();
      if (pullOutput && !/up to date/i.test(pullOutput)) {
        pulledUpdates = true;
      }
    } catch (err) {
      const pullMessage = `${err.stdout || ""}${err.stderr || ""}${err.message || ""}`.trim();
      if (/up to date/i.test(pullMessage)) {
        pullOutput = pullMessage;
      } else {
        await abortMergeStates();
        throw err;
      }
    }

    await execAsync("git add data.json", gitOpts);
    const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
    let committed = false;
    try {
      const { stdout } = await execAsync(`git commit -m "[SYNC]: data.json ${timestamp}"`, gitOpts);
      commitOutput = stdout;
      committed = true;
    } catch (err) {
      const stderr = (err && (err.stderr || err.stdout)) || "";
      if (!/nothing to commit|no changes added to commit/i.test(stderr)) {
        await abortMergeStates();
        throw err;
      }
    }

    const shouldPush = committed || (await isAheadOfRemote());
    if (shouldPush) {
      const { stdout: pushStdout, stderr: pushStderr } = await execAsync("git push", gitOpts);
      pushOutput = `${pushStdout || ""}${pushStderr || ""}`.trim();
    }

    const latestData = readDataFile();
    const responsePayload = {
      message: committed ? "synced" : pulledUpdates ? "pulled" : "no_changes",
      pullOutput,
      pushOutput,
      syncedData: latestData,
    };
    if (committed) {
      responsePayload.commitOutput = commitOutput;
    }
    return res.json(responsePayload);
  } catch (err) {
    await abortMergeStates();
    return res
      .status(500)
      .json({ error: "sync_failed", details: err.stderr || err.stdout || err.message || "Unknown error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  if (USE_POSTGRES) {
    console.log(`Storage backend: postgres (${TABLE_NAME_SAFE}/${OT_ROW_ID})`);
  } else {
    console.log(`Storage backend: file (${DATA_FILE})`);
  }
});

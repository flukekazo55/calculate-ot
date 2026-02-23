// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ENABLE_GIT_SYNC = process.env.ENABLE_GIT_SYNC !== "false";
const CORS_ORIGINS_RAW = (process.env.CORS_ORIGINS || "").trim();
const CORS_ORIGINS = CORS_ORIGINS_RAW
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const ALLOW_ALL_ORIGINS = CORS_ORIGINS.includes("*");

const DATA_FILE = path.join(__dirname, "data.json");
const DEFAULT_DATA = { records: [], lastUpdate: "" };
const execAsync = util.promisify(exec);
const gitOpts = { cwd: __dirname };

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

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
  }
}

function readDataFile() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf8") || "{}";
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in ${DATA_FILE}: ${err.message}`);
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
app.use(express.static(__dirname)); // ให้เปิด index.html ได้โดยตรง

// โหลดข้อมูล
app.get("/load", (req, res) => {
  try {
    const data = readDataFile();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "load_failed", details: err.message });
  }
});

// บันทึกข้อมูล
app.post("/save", (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
    res.json({ message: "บันทึกเรียบร้อย" });
  } catch (err) {
    res.status(500).json({ error: "บันทึกไม่สำเร็จ", details: err.message });
  }
});

// ล้างข้อมูล
app.post("/reset", (req, res) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2));
    res.json({ message: "ล้างข้อมูลเรียบร้อย" });
  } catch (err) {
    res.status(500).json({ error: "รีเซ็ตไม่สำเร็จ", details: err.message });
  }
});

app.post("/sync", async (req, res) => {
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
    res
      .status(500)
      .json({ error: "sync_failed", details: err.stderr || err.stdout || err.message || "Unknown error" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

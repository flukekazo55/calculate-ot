// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, "data.json");
const DEFAULT_DATA = { records: [], lastUpdate: "" };
const execAsync = util.promisify(exec);

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

app.use(express.json());
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
  try {
    ensureDataFile();
    let pullOutput = "";
    let pushOutput = "";
    let commitOutput = "";
    let pulledUpdates = false;
    await execAsync("git add data.json", { cwd: __dirname });
    const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
    let committed = false;
    try {
      const { stdout } = await execAsync(`git commit -m "[SYNC]: data.json ${timestamp}"`, {
        cwd: __dirname,
      });
      commitOutput = stdout;
      committed = true;
    } catch (err) {
      const stderr = (err && err.stderr) || "";
      if (!/nothing to commit|no changes added to commit/i.test(stderr)) {
        throw err;
      }
    }
    try {
      const { stdout, stderr } = await execAsync("git pull --rebase", { cwd: __dirname });
      pullOutput = `${stdout || ""}${stderr || ""}`.trim();
      if (pullOutput && !/up to date/i.test(pullOutput)) {
        pulledUpdates = true;
      }
    } catch (err) {
      const pullMessage = `${err.stdout || ""}${err.stderr || ""}${err.message || ""}`.trim();
      if (/up to date/i.test(pullMessage)) {
        pullOutput = pullMessage;
      } else {
        throw err;
      }
    }
    const { stdout: pushStdout, stderr: pushStderr } = await execAsync("git push", { cwd: __dirname });
    pushOutput = `${pushStdout || ""}${pushStderr || ""}`.trim();
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
    res
      .status(500)
      .json({ error: "sync_failed", details: err.stderr || err.stdout || err.message || "Unknown error" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

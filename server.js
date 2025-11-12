// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, "data.json");
const execAsync = util.promisify(exec);

app.use(express.json());
app.use(express.static(__dirname)); // ให้เปิด index.html ได้โดยตรง

// โหลดข้อมูล
app.get("/load", (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ records: [], lastUpdate: "" }, null, 2));
    }
    const data = fs.readFileSync(DATA_FILE, "utf8");
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: "อ่านไฟล์ไม่สำเร็จ", details: err.message });
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
    fs.writeFileSync(DATA_FILE, JSON.stringify({ records: [], lastUpdate: "" }, null, 2));
    res.json({ message: "ล้างข้อมูลเรียบร้อย" });
  } catch (err) {
    res.status(500).json({ error: "รีเซ็ตไม่สำเร็จ", details: err.message });
  }
});

app.post("/sync", async (req, res) => {
  try {
    await execAsync("git add data.json", { cwd: __dirname });
    const timestamp = new Date().toISOString().replace("T", " ").split(".")[0];
    let committed = false;
    try {
      await execAsync(`git commit -m "[SYNC]: data.json ${timestamp}"`, { cwd: __dirname });
      committed = true;
    } catch (err) {
      const stderr = (err && err.stderr) || "";
      if (!/nothing to commit|no changes added to commit/i.test(stderr)) {
        throw err;
      }
    }
    const { stdout: pushOutput } = await execAsync("git push", { cwd: __dirname });
    if (!committed) {
      return res.json({ message: "no_changes", pushOutput });
    }
    return res.json({ message: "synced", pushOutput });
  } catch (err) {
    res
      .status(500)
      .json({ error: "sync_failed", details: err.stderr || err.message || "Unknown error" });
  }
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

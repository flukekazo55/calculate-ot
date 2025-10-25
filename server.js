// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, "data.json");

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

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

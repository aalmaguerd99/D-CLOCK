const express = require("express");
const { LOCAL_PORT } = require("../config");

const app = express();
let serverInstance = null;

app.use(express.json());

// Allow connections from any IP on the local network (for mobile apps)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-device-id");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ── Status ───────────────────────────────────────────
app.get("/api/status", (req, res) => {
  res.json({
    app:       "D-CLOCK",
    version:   "1.0.0",
    status:    "active",
    timestamp: new Date().toISOString(),
  });
});

// ── Phase 4 placeholders (mobile app endpoints) ──────

app.post("/api/checkin", (req, res) => {
  // TODO Phase 4: receive employee check-in from mobile app
  const { employee_id, type } = req.body; // type: 'entrada' | 'salida'
  console.log(`Check-in: employee=${employee_id} type=${type}`);
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get("/api/employees", (req, res) => {
  // TODO Phase 4: return employee list from local SQLite DB
  res.json({ employees: [], total: 0 });
});

app.get("/api/records/today", (req, res) => {
  // TODO Phase 4: return today's attendance records
  res.json({ records: [], total: 0 });
});

// ── Server lifecycle ─────────────────────────────────
function start() {
  return new Promise((resolve, reject) => {
    if (serverInstance) { resolve(); return; }
    serverInstance = app.listen(LOCAL_PORT, "0.0.0.0", () => {
      console.log(`  D-CLOCK local server → port ${LOCAL_PORT}`);
      resolve();
    });
    serverInstance.on("error", reject);
  });
}

function stop() {
  return new Promise((resolve) => {
    if (!serverInstance) { resolve(); return; }
    serverInstance.close(() => { serverInstance = null; resolve(); });
  });
}

function getPort() { return LOCAL_PORT; }

module.exports = { start, stop, getPort };

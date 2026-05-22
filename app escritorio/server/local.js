const express    = require("express");
const path       = require("path");
const fs         = require("fs");
const bcrypt     = require("bcryptjs");
const { LOCAL_PORT } = require("../config");
const DB         = require("./db");

const app = express();
let serverInstance = null;
let dataDir        = null;
let sseClients     = new Set();

app.use(express.json({ limit: "10mb" })); // allow base64 image uploads
app.use(express.static(path.join(__dirname, "public")));
// Serve app icon at /assets/icon.png
app.use("/assets", express.static(path.join(__dirname, "..", "assets")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,x-auth-token,x-device-id");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

function auth(req, res, next) {
  if (!DB.validateSession(req.headers["x-auth-token"])) {
    return res.status(401).json({ error: "No autorizado" });
  }
  next();
}

function broadcast(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(c => c.write(msg));
}

function nowMX() {
  return new Date().toLocaleString('sv', { timeZone: 'America/Mexico_City' });
}

// ── Status ────────────────────────────────────────────
app.get("/",           (req, res) => res.redirect("/api/status"));
app.get("/api/status", (req, res) => res.json({ app: "D-CLOCK", version: "1.0.0", status: "active", timestamp: new Date().toISOString() }));

// ── Info pública (para app móvil) ─────────────────────
app.get("/api/info", (req, res) => {
  const db = DB.getDb();
  const company_name = db.prepare("SELECT value FROM config WHERE key='company_name'").get()?.value || "D-CLOCK";
  const logo         = db.prepare("SELECT value FROM config WHERE key='company_logo'").get()?.value || null;
  res.json({ company_name, logo, version: "1.0.0" });
});

// ── Auth móvil (empleado: número + PIN) ───────────────
app.post("/api/mobile/auth", (req, res) => {
  const { employee_number, pin } = req.body;
  if (!employee_number || !pin) return res.status(400).json({ error: "Datos requeridos" });
  const emp = DB.getDb().prepare(`
    SELECT e.id, e.employee_number, e.name, e.last_name, e.photo, e.active,
           e.email, e.phone, e.rfc, e.curp, e.nss, e.birth_date, e.gender, e.address,
           e.department_id, e.area_id, e.job_title_id, e.schedule_id, e.geofence_id,
           d.name AS department_name, a.name AS area_name, j.name AS job_title_name,
           s.name AS schedule_name
    FROM employees e
    LEFT JOIN departments  d ON e.department_id  = d.id
    LEFT JOIN areas        a ON e.area_id         = a.id
    LEFT JOIN job_titles   j ON e.job_title_id    = j.id
    LEFT JOIN schedules    s ON e.schedule_id     = s.id
    WHERE e.employee_number = ? AND e.pin = ? AND e.active = 1
  `).get(employee_number.trim(), pin.trim());
  if (!emp) return res.status(401).json({ error: "Número de empleado o PIN incorrecto" });
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  const last  = DB.getDb().prepare(
    "SELECT type, timestamp FROM check_ins WHERE employee_id=? AND date(timestamp,'localtime')=? ORDER BY timestamp DESC LIMIT 1"
  ).get(emp.id, today);
  res.json({ ok: true, employee: emp, last_checkin: last || null });
});

// ── Checkins de hoy para empleado (móvil) ────────────
app.get("/api/mobile/checkins/today", (req, res) => {
  const { employee_id } = req.query;
  if (!employee_id) return res.status(400).json({ error: "employee_id requerido" });
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  const rows  = DB.getDb().prepare(
    "SELECT id, type, timestamp FROM check_ins WHERE employee_id=? AND date(timestamp,'localtime')=? ORDER BY timestamp ASC"
  ).all(employee_id, today);
  res.json(rows.map((r) => ({ ...r, type: r.type === "entrada" ? "in" : "out" })));
});

function haversineM(lat1, lon1, lat2, lon2) {
  const R = 6371000, toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Registrar checkin desde móvil ────────────────────
app.post("/api/mobile/checkin", (req, res) => {
  const { employee_id, type, lat, lng, photo = null } = req.body;
  if (!employee_id || !["in", "out"].includes(type))
    return res.status(400).json({ error: "Datos requeridos" });
  const db = DB.getDb();
  const emp = db.prepare("SELECT id FROM employees WHERE id=? AND active=1").get(employee_id);
  if (!emp) return res.status(404).json({ error: "Empleado no encontrado" });

  // Detectar geocerca
  let geofence_id = null, geofence_name = null;
  if (lat != null && lng != null) {
    const geos = db.prepare("SELECT id, name, latitude, longitude, radius_meters FROM geofences WHERE active=1").all();
    for (const gf of geos) {
      if (haversineM(lat, lng, gf.latitude, gf.longitude) <= gf.radius_meters) {
        geofence_id = gf.id;
        geofence_name = gf.name;
        break;
      }
    }
  }

  const dbType = type === "in" ? "entrada" : "salida";
  const result = db.prepare(
    "INSERT INTO check_ins (employee_id, type, timestamp, latitude, longitude, photo, geofence_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(employee_id, dbType, nowMX(), lat ?? null, lng ?? null, photo, geofence_id);

  const row = db.prepare("SELECT id, type, timestamp FROM check_ins WHERE id=?").get(result.lastInsertRowid);
  res.json({
    id: row.id,
    type: row.type === "entrada" ? "in" : "out",
    timestamp: row.timestamp,
    geofence_name,
  });
});

// ── Auth ──────────────────────────────────────────────
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const db = DB.getDb();
  const storedUser = db.prepare("SELECT value FROM config WHERE key='admin_username'").get()?.value;
  const storedHash = db.prepare("SELECT value FROM config WHERE key='admin_password_hash'").get()?.value;
  if (username !== storedUser || !bcrypt.compareSync(password, storedHash)) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }
  const token = DB.createSession();
  res.json({ ok: true, token });
});

app.post("/api/auth/logout", auth, (req, res) => {
  DB.deleteSession(req.headers["x-auth-token"]);
  res.json({ ok: true });
});

app.get("/api/auth/check", (req, res) => {
  res.json({ ok: DB.validateSession(req.headers["x-auth-token"]) });
});

// ── Config / Logo (public GET, auth POST) ─────────────
app.get("/api/config/logo", (req, res) => {
  const logo = DB.getDb().prepare("SELECT value FROM config WHERE key='company_logo'").get()?.value || null;
  res.json({ logo });
});

app.post("/api/config/logo", auth, (req, res) => {
  const { logo } = req.body;
  if (logo) {
    DB.getDb().prepare("INSERT OR REPLACE INTO config VALUES ('company_logo',?)").run(logo);
  } else {
    DB.getDb().prepare("DELETE FROM config WHERE key='company_logo'").run();
  }
  res.json({ ok: true });
});

// ── Departments ───────────────────────────────────────
app.get("/api/departments", auth, (req, res) => {
  res.json(DB.getDb().prepare("SELECT * FROM departments ORDER BY name").all());
});
app.post("/api/departments", auth, (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Nombre requerido" });
  try {
    const r = DB.getDb().prepare("INSERT INTO departments (name) VALUES (?)").run(name.trim());
    res.json({ id: r.lastInsertRowid, name: name.trim() });
  } catch { res.status(400).json({ error: "El departamento ya existe" }); }
});
app.put("/api/departments/:id", auth, (req, res) => {
  DB.getDb().prepare("UPDATE departments SET name=? WHERE id=?").run(req.body.name, req.params.id);
  res.json({ ok: true });
});
app.delete("/api/departments/:id", auth, (req, res) => {
  DB.getDb().prepare("DELETE FROM departments WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// ── Areas ─────────────────────────────────────────────
app.get("/api/areas", auth, (req, res) => {
  res.json(DB.getDb().prepare(`
    SELECT a.*, d.name AS department_name
    FROM areas a LEFT JOIN departments d ON a.department_id=d.id
    ORDER BY a.name
  `).all());
});
app.post("/api/areas", auth, (req, res) => {
  const { name, type, department_id } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Nombre requerido" });
  const r = DB.getDb().prepare(
    "INSERT INTO areas (name,type,department_id) VALUES (?,?,?)"
  ).run(name.trim(), type || "oficina", department_id || null);
  res.json({ id: r.lastInsertRowid });
});
app.put("/api/areas/:id", auth, (req, res) => {
  const { name, type, department_id } = req.body;
  DB.getDb().prepare(
    "UPDATE areas SET name=?,type=?,department_id=? WHERE id=?"
  ).run(name, type || "oficina", department_id || null, req.params.id);
  res.json({ ok: true });
});
app.delete("/api/areas/:id", auth, (req, res) => {
  DB.getDb().prepare("DELETE FROM areas WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// ── Schedules ─────────────────────────────────────────
app.get("/api/schedules", auth, (req, res) => {
  res.json(DB.getDb().prepare("SELECT * FROM schedules ORDER BY name").all());
});
app.post("/api/schedules", auth, (req, res) => {
  const { name, type, color, check_in_time, check_out_time, days, tolerance_minutes } = req.body;
  const r = DB.getDb().prepare(
    "INSERT INTO schedules (name,type,color,check_in_time,check_out_time,days,tolerance_minutes) VALUES (?,?,?,?,?,?,?)"
  ).run(
    name,
    type  || "trabajo",
    color || "morning",
    check_in_time  || "09:00",
    check_out_time || "18:00",
    JSON.stringify(days || ["lun","mar","mie","jue","vie"]),
    tolerance_minutes ?? 15
  );
  res.json({ id: r.lastInsertRowid });
});
app.put("/api/schedules/:id", auth, (req, res) => {
  const { name, type, color, check_in_time, check_out_time, days, tolerance_minutes } = req.body;
  DB.getDb().prepare(
    "UPDATE schedules SET name=?,type=?,color=?,check_in_time=?,check_out_time=?,days=?,tolerance_minutes=? WHERE id=?"
  ).run(name, type||"trabajo", color||"morning", check_in_time, check_out_time, JSON.stringify(days), tolerance_minutes, req.params.id);
  res.json({ ok: true });
});
app.delete("/api/schedules/:id", auth, (req, res) => {
  DB.getDb().prepare("DELETE FROM schedules WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// ── Geofences ─────────────────────────────────────────
app.get("/api/geofences", auth, (req, res) => {
  res.json(DB.getDb().prepare("SELECT * FROM geofences ORDER BY name").all());
});
app.post("/api/geofences", auth, (req, res) => {
  const { name, latitude, longitude, radius_meters } = req.body;
  const r = DB.getDb().prepare(
    "INSERT INTO geofences (name,latitude,longitude,radius_meters) VALUES (?,?,?,?)"
  ).run(name, latitude, longitude, radius_meters || 100);
  res.json({ id: r.lastInsertRowid });
});
app.put("/api/geofences/:id", auth, (req, res) => {
  const { name, latitude, longitude, radius_meters, active } = req.body;
  DB.getDb().prepare(
    "UPDATE geofences SET name=?,latitude=?,longitude=?,radius_meters=?,active=? WHERE id=?"
  ).run(name, latitude, longitude, radius_meters, active ? 1 : 0, req.params.id);
  res.json({ ok: true });
});
app.delete("/api/geofences/:id", auth, (req, res) => {
  DB.getDb().prepare("DELETE FROM geofences WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// ── Job Titles ────────────────────────────────────────
app.get("/api/job_titles", auth, (req, res) => {
  res.json(DB.getDb().prepare("SELECT * FROM job_titles ORDER BY name").all());
});
app.post("/api/job_titles", auth, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Nombre requerido" });
  try {
    const r = DB.getDb().prepare("INSERT INTO job_titles (name) VALUES (?)").run(name);
    res.json({ id: r.lastInsertRowid });
  } catch { res.status(400).json({ error: "Ya existe ese puesto" }); }
});
app.put("/api/job_titles/:id", auth, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Nombre requerido" });
  DB.getDb().prepare("UPDATE job_titles SET name=? WHERE id=?").run(name, req.params.id);
  res.json({ ok: true });
});
app.delete("/api/job_titles/:id", auth, (req, res) => {
  DB.getDb().prepare("DELETE FROM job_titles WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// ── Employees ─────────────────────────────────────────
const EMP_SELECT = `
  SELECT e.*, d.name AS department_name, s.name AS schedule_name, a.name AS area_name, j.name AS job_title_name
  FROM employees e
  LEFT JOIN departments d ON e.department_id  = d.id
  LEFT JOIN schedules   s ON e.schedule_id    = s.id
  LEFT JOIN areas       a ON e.area_id        = a.id
  LEFT JOIN job_titles  j ON e.job_title_id   = j.id
`;
app.get("/api/employees", auth, (req, res) => {
  res.json(DB.getDb().prepare(EMP_SELECT + " ORDER BY e.name").all());
});
app.post("/api/employees", auth, (req, res) => {
  const { employee_number, name, last_name, email, phone, nss, curp, rfc, gender, birth_date, address, department_id, area_id, job_title_id, schedule_id, geofence_id, pin, photo } = req.body;
  if (!employee_number || !name) return res.status(400).json({ error: "Número y nombre requeridos" });
  try {
    const r = DB.getDb().prepare(
      "INSERT INTO employees (employee_number,name,last_name,email,phone,nss,curp,rfc,gender,birth_date,address,department_id,area_id,job_title_id,schedule_id,geofence_id,pin,photo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    ).run(employee_number, name, last_name||null, email||null, phone||null, nss||null, curp||null, rfc||null, gender||null, birth_date||null, address||null, department_id||null, area_id||null, job_title_id||null, schedule_id||null, geofence_id||null, pin||null, photo||null);
    res.json({ id: r.lastInsertRowid });
  } catch { res.status(400).json({ error: "El número de empleado ya existe" }); }
});
app.get("/api/employees/:id", auth, (req, res) => {
  const emp = DB.getDb().prepare(EMP_SELECT + " WHERE e.id=?").get(req.params.id);
  if (!emp) return res.status(404).json({ error: "No encontrado" });
  res.json(emp);
});
app.put("/api/employees/:id", auth, (req, res) => {
  const { employee_number, name, last_name, email, phone, nss, curp, rfc, gender, birth_date, address, department_id, area_id, job_title_id, schedule_id, geofence_id, pin, photo, active } = req.body;
  DB.getDb().prepare(
    "UPDATE employees SET employee_number=?,name=?,last_name=?,email=?,phone=?,nss=?,curp=?,rfc=?,gender=?,birth_date=?,address=?,department_id=?,area_id=?,job_title_id=?,schedule_id=?,geofence_id=?,pin=?,photo=?,active=? WHERE id=?"
  ).run(employee_number, name, last_name||null, email||null, phone||null, nss||null, curp||null, rfc||null, gender||null, birth_date||null, address||null, department_id||null, area_id||null, job_title_id||null, schedule_id||null, geofence_id||null, pin||null, photo||null, active?1:0, req.params.id);
  res.json({ ok: true });
});
app.delete("/api/employees/:id", auth, (req, res) => {
  DB.getDb().prepare("DELETE FROM employees WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// ── Schedule Assignments ──────────────────────────────
app.get("/api/assignments", auth, (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: "start y end requeridos" });
  res.json(DB.getDb().prepare(
    "SELECT employee_id, date, schedule_id FROM schedule_assignments WHERE date >= ? AND date <= ? ORDER BY date"
  ).all(start, end));
});

app.post("/api/assignments", auth, (req, res) => {
  const { employee_id, date, schedule_id } = req.body;
  if (!employee_id || !date || !schedule_id) return res.status(400).json({ error: "Datos incompletos" });
  DB.getDb().prepare(
    "INSERT OR REPLACE INTO schedule_assignments (employee_id, date, schedule_id) VALUES (?,?,?)"
  ).run(employee_id, date, schedule_id);
  res.json({ ok: true });
});

app.delete("/api/assignments/:empId/:date", auth, (req, res) => {
  DB.getDb().prepare(
    "DELETE FROM schedule_assignments WHERE employee_id=? AND date=?"
  ).run(req.params.empId, req.params.date);
  res.json({ ok: true });
});

// ── Check-ins ─────────────────────────────────────────
app.post("/api/checkin", (req, res) => {
  const { employee_id, type, latitude, longitude, geofence_id, device_id } = req.body;
  if (!employee_id || !["entrada","salida"].includes(type)) {
    return res.status(400).json({ error: "Datos inválidos" });
  }
  const emp = DB.getDb().prepare("SELECT * FROM employees WHERE id=? AND active=1").get(employee_id);
  if (!emp) return res.status(404).json({ error: "Empleado no encontrado" });

  const ts = nowMX();
  const r = DB.getDb().prepare(
    "INSERT INTO check_ins (employee_id,type,timestamp,latitude,longitude,geofence_id,device_id) VALUES (?,?,?,?,?,?,?)"
  ).run(employee_id, type, ts, latitude||null, longitude||null, geofence_id||null, device_id||null);

  const checkin = {
    id: r.lastInsertRowid,
    employee_id,
    employee_name: emp.name,
    employee_number: emp.employee_number,
    photo: emp.photo || null,
    type,
    timestamp: ts,
    latitude, longitude,
  };
  broadcast("checkin", checkin);
  res.json({ ok: true, checkin });
});

app.get("/api/checkins", auth, (req, res) => {
  const { date, employee_id, type, limit = 200 } = req.query;
  let sql = `SELECT ci.*, e.name AS employee_name, e.last_name AS employee_last_name, e.employee_number, e.photo AS employee_photo,
                    g.name AS geofence_name
             FROM check_ins ci
             JOIN employees e ON ci.employee_id=e.id
             LEFT JOIN geofences g ON ci.geofence_id=g.id
             WHERE 1=1`;
  const params = [];
  if (date)        { sql += " AND date(ci.timestamp)=?"; params.push(date); }
  if (employee_id) { sql += " AND ci.employee_id=?";    params.push(employee_id); }
  if (type)        { sql += " AND ci.type=?";           params.push(type); }
  sql += " ORDER BY ci.timestamp DESC LIMIT ?";
  params.push(Number(limit));
  res.json(DB.getDb().prepare(sql).all(...params));
});

app.get("/api/checkins/today", auth, (req, res) => {
  const today = nowMX().slice(0, 10);
  const rows = DB.getDb().prepare(`
    SELECT ci.*, e.name AS employee_name, e.last_name AS employee_last_name, e.employee_number, e.photo AS employee_photo,
           g.name AS geofence_name
    FROM check_ins ci
    JOIN employees e ON ci.employee_id=e.id
    LEFT JOIN geofences g ON ci.geofence_id=g.id
    WHERE date(ci.timestamp)=?
    ORDER BY ci.timestamp DESC
  `).all(today);
  res.json(rows);
});

app.delete("/api/checkins", auth, (req, res) => {
  const { before } = req.query;
  if (before) {
    DB.getDb().prepare("DELETE FROM check_ins WHERE date(timestamp) < ?").run(before);
  } else {
    DB.getDb().prepare("DELETE FROM check_ins").run();
  }
  res.json({ ok: true });
});

app.get("/api/checkins/live", (req, res) => {
  const token = req.headers["x-auth-token"] || req.query.t;
  if (!DB.validateSession(token)) return res.status(401).json({ error: "No autorizado" });
  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.flushHeaders();
  res.write("event: connected\ndata: {}\n\n");
  sseClients.add(res);
  req.on("close", () => sseClients.delete(res));
});

app.get("/api/stats", auth, (req, res) => {
  const db = DB.getDb();
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  const totalEmployees = db.prepare("SELECT COUNT(*) AS n FROM employees WHERE active=1").get().n;
  const presentToday   = db.prepare("SELECT COUNT(DISTINCT employee_id) AS n FROM check_ins WHERE type='entrada' AND date(timestamp,'localtime')=?").get(today).n;
  const checkinsToday  = db.prepare("SELECT COUNT(*) AS n FROM check_ins WHERE date(timestamp,'localtime')=?").get(today).n;
  res.json({ totalEmployees, presentToday, checkinsToday, date: today });
});

// ── Server lifecycle ──────────────────────────────────
function configure(dir) { dataDir = dir; }

function start() {
  return new Promise((resolve, reject) => {
    if (serverInstance) { resolve(); return; }
    const { adminPassword, isFirstRun } = DB.init(dataDir);
    // Persist company name from license.json so /api/info can serve it
    try {
      const lic = JSON.parse(fs.readFileSync(path.join(dataDir, "license.json"), "utf8"));
      if (lic?.company_name) {
        DB.getDb().prepare("INSERT OR REPLACE INTO config VALUES ('company_name',?)").run(lic.company_name);
      }
    } catch {}
    serverInstance = app.listen(LOCAL_PORT, "0.0.0.0", () => {
      console.log(`  D-CLOCK server → :${LOCAL_PORT}`);
      resolve({ adminPassword, isFirstRun });
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

function getPort()          { return LOCAL_PORT; }
function getAdminPassword() { return DB.getDb()?.prepare("SELECT value FROM config WHERE key='admin_password'").get()?.value; }

module.exports = { configure, start, stop, getPort, getAdminPassword };

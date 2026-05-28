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
           e.is_admin, e.face_descriptor,
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
  const { face_descriptor, ...empData } = emp;
  res.json({ ok: true, employee: { ...empData, has_face: !!face_descriptor }, last_checkin: last || null });
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

function faceDistance(d1, d2) {
  if (!d1 || !d2 || d1.length !== d2.length) return Infinity;
  return Math.sqrt(d1.reduce((sum, v, i) => sum + (v - d2[i]) ** 2, 0));
}

function haversineM(lat1, lon1, lat2, lon2) {
  const R = 6371000, toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Registrar checkin desde móvil ────────────────────
app.post("/api/mobile/checkin", async (req, res) => {
  const { employee_id, type, lat, lng, photo = null } = req.body;
  if (!employee_id || !["in", "out"].includes(type))
    return res.status(400).json({ error: "Datos requeridos" });

  const db = DB.getDb();
  const emp = db.prepare("SELECT id, face_descriptor FROM employees WHERE id=? AND active=1").get(employee_id);
  if (!emp) return res.status(404).json({ error: "Empleado no encontrado" });

  // ── Ubicación obligatoria ──────────────────────────
  if (lat == null || lng == null) {
    return res.status(400).json({
      error: "location_required",
      message: "Activa la ubicación en Configuración para poder registrar tu asistencia.",
    });
  }

  // ── Verificación facial (no bloquea, solo registra resultado) ────
  let face_verified = null;
  if (emp.face_descriptor) {
    face_verified = 0;
    if (photo) {
      try {
        const stored = JSON.parse(emp.face_descriptor);
        const captured = await (global.processFaceImage ? global.processFaceImage(photo) : null);
        if (captured) {
          const dist = faceDistance(stored, captured);
          if (dist <= 0.6) face_verified = 1;
        }
      } catch (e) {
        console.error("Face verification error:", e.message);
      }
    }
  }

  // ── Detectar geocerca ──────────────────────────────
  let geofence_id = null, geofence_name = null;
  const geos = db.prepare("SELECT id, name, latitude, longitude, radius_meters FROM geofences WHERE active=1").all();
  for (const gf of geos) {
    if (haversineM(lat, lng, gf.latitude, gf.longitude) <= gf.radius_meters) {
      geofence_id = gf.id; geofence_name = gf.name; break;
    }
  }

  const dbType = type === "in" ? "entrada" : "salida";
  const result = db.prepare(
    "INSERT INTO check_ins (employee_id, type, timestamp, latitude, longitude, photo, geofence_id, face_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(employee_id, dbType, nowMX(), lat, lng, photo, geofence_id, face_verified);

  const row = db.prepare("SELECT id, type, timestamp FROM check_ins WHERE id=?").get(result.lastInsertRowid);
  res.json({ id: row.id, type: row.type === "entrada" ? "in" : "out", timestamp: row.timestamp, geofence_name, face_verified });
});

// ── Registro de rostro desde móvil ────────────────
app.post("/api/mobile/register-face", async (req, res) => {
  const { employee_id, photo } = req.body;
  if (!employee_id || !photo) return res.status(400).json({ error: "Datos requeridos" });
  const emp = DB.getDb().prepare("SELECT id FROM employees WHERE id=? AND active=1").get(employee_id);
  if (!emp) return res.status(404).json({ error: "Empleado no encontrado" });
  try {
    const descriptor = await (global.processFaceImage ? global.processFaceImage(photo) : null);
    if (!descriptor) return res.status(400).json({ ok: false, error: "no_face_detected" });
    DB.getDb().prepare("UPDATE employees SET face_descriptor=? WHERE id=?")
      .run(JSON.stringify(descriptor), employee_id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Registros del día para admin (móvil) ──────────
app.get("/api/mobile/admin/checkins", (req, res) => {
  const { employee_id, date } = req.query;
  if (!employee_id) return res.status(400).json({ error: "employee_id requerido" });
  const admin = DB.getDb().prepare("SELECT is_admin FROM employees WHERE id=? AND active=1").get(employee_id);
  if (!admin?.is_admin) return res.status(403).json({ error: "No autorizado" });
  const day = date || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  const rows = DB.getDb().prepare(`
    SELECT ci.id, ci.type, ci.timestamp, ci.geofence_id,
           e.id AS employee_id, e.name, e.last_name, e.employee_number, e.photo,
           d.name AS department_name, j.name AS job_title_name,
           g.name AS geofence_name
    FROM check_ins ci
    JOIN employees e ON ci.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN job_titles  j ON e.job_title_id  = j.id
    LEFT JOIN geofences   g ON ci.geofence_id  = g.id
    WHERE date(ci.timestamp, 'localtime') = ?
    ORDER BY ci.timestamp DESC
  `).all(day);
  res.json(rows.map(r => ({ ...r, type: r.type === "entrada" ? "in" : "out" })));
});

// ── Face descriptor (admin) ────────────────────────
app.put("/api/employees/:id/face-descriptor", auth, (req, res) => {
  const { descriptor } = req.body;
  if (!Array.isArray(descriptor) || descriptor.length !== 128)
    return res.status(400).json({ error: "Descriptor inválido" });
  DB.getDb().prepare("UPDATE employees SET face_descriptor=? WHERE id=?")
    .run(JSON.stringify(descriptor), req.params.id);
  res.json({ ok: true });
});

app.delete("/api/employees/:id/face-descriptor", auth, (req, res) => {
  DB.getDb().prepare("UPDATE employees SET face_descriptor=NULL WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

app.get("/api/employees/:id/face-status", auth, (req, res) => {
  const emp = DB.getDb().prepare("SELECT face_descriptor FROM employees WHERE id=?").get(req.params.id);
  res.json({ has_face: !!(emp && emp.face_descriptor) });
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
  const rows = DB.getDb().prepare(EMP_SELECT + " ORDER BY e.name").all();
  res.json(rows.map(({ face_descriptor, ...r }) => ({ ...r, has_face: !!face_descriptor })));
});
app.post("/api/employees", auth, (req, res) => {
  const { employee_number, name, last_name, email, phone, nss, curp, rfc, gender, birth_date, address, department_id, area_id, job_title_id, schedule_id, geofence_id, pin, photo, is_admin } = req.body;
  if (!employee_number || !name) return res.status(400).json({ error: "Número y nombre requeridos" });
  try {
    const r = DB.getDb().prepare(
      "INSERT INTO employees (employee_number,name,last_name,email,phone,nss,curp,rfc,gender,birth_date,address,department_id,area_id,job_title_id,schedule_id,geofence_id,pin,photo,is_admin) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    ).run(employee_number, name, last_name||null, email||null, phone||null, nss||null, curp||null, rfc||null, gender||null, birth_date||null, address||null, department_id||null, area_id||null, job_title_id||null, schedule_id||null, geofence_id||null, pin||null, photo||null, is_admin?1:0);
    res.json({ id: r.lastInsertRowid });
  } catch { res.status(400).json({ error: "El número de empleado ya existe" }); }
});
app.get("/api/employees/:id", auth, (req, res) => {
  const emp = DB.getDb().prepare(EMP_SELECT + " WHERE e.id=?").get(req.params.id);
  if (!emp) return res.status(404).json({ error: "No encontrado" });
  res.json(emp);
});
app.put("/api/employees/:id", auth, (req, res) => {
  const { employee_number, name, last_name, email, phone, nss, curp, rfc, gender, birth_date, address, department_id, area_id, job_title_id, schedule_id, geofence_id, pin, photo, active, is_admin } = req.body;
  DB.getDb().prepare(
    "UPDATE employees SET employee_number=?,name=?,last_name=?,email=?,phone=?,nss=?,curp=?,rfc=?,gender=?,birth_date=?,address=?,department_id=?,area_id=?,job_title_id=?,schedule_id=?,geofence_id=?,pin=?,photo=?,active=?,is_admin=? WHERE id=?"
  ).run(employee_number, name, last_name||null, email||null, phone||null, nss||null, curp||null, rfc||null, gender||null, birth_date||null, address||null, department_id||null, area_id||null, job_title_id||null, schedule_id||null, geofence_id||null, pin||null, photo||null, active?1:0, is_admin?1:0, req.params.id);
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

app.get("/api/checkins/period", auth, (req, res) => {
  const { from, to, employee_id } = req.query;
  if (!from || !to) return res.status(400).json({ error: "from y to requeridos" });
  let sql = `SELECT ci.*, e.id AS emp_id, e.name AS employee_name, e.last_name AS employee_last_name,
                    e.employee_number, e.photo AS employee_photo, g.name AS geofence_name
             FROM check_ins ci
             JOIN employees e ON ci.employee_id=e.id
             LEFT JOIN geofences g ON ci.geofence_id=g.id
             WHERE date(ci.timestamp)>=? AND date(ci.timestamp)<=? AND e.active=1`;
  const params = [from, to];
  if (employee_id) { sql += " AND ci.employee_id=?"; params.push(employee_id); }
  sql += " ORDER BY e.name, e.last_name, ci.timestamp";
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

app.delete("/api/checkins/:id", auth, (req, res) => {
  const r = DB.getDb().prepare("DELETE FROM check_ins WHERE id=?").run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: "Registro no encontrado" });
  res.json({ ok: true });
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

app.get("/api/employees/report", auth, (req, res) => {
  res.json(DB.getDb().prepare(EMP_SELECT + " WHERE e.active=1 ORDER BY e.name, e.last_name").all());
});

app.get("/api/schedule-status", auth, (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: "from y to requeridos" });
  const db = DB.getDb();
  const emps = db.prepare(`
    SELECT e.id AS employee_id, e.schedule_id,
           s.type AS sched_type, s.days AS sched_days
    FROM employees e
    LEFT JOIN schedules s ON e.schedule_id=s.id
    WHERE e.active=1
  `).all();
  const assignments = db.prepare(`
    SELECT sa.employee_id, sa.date, s.type AS sched_type, s.name AS sched_name
    FROM schedule_assignments sa
    JOIN schedules s ON sa.schedule_id=s.id
    WHERE sa.date>=? AND sa.date<=?
  `).all(from, to);
  res.json({ emps, assignments });
});

app.get("/api/stats/week", auth, (req, res) => {
  const db = DB.getDb();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
    const present = db.prepare(
      "SELECT COUNT(DISTINCT employee_id) AS n FROM check_ins WHERE type='entrada' AND date(timestamp)=?"
    ).get(date).n;
    days.push({ date, present });
  }
  res.json(days);
});

app.get("/api/stats", auth, (req, res) => {
  const db = DB.getDb();
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  const totalEmployees = db.prepare("SELECT COUNT(*) AS n FROM employees WHERE active=1").get().n;
  const presentToday   = db.prepare("SELECT COUNT(DISTINCT employee_id) AS n FROM check_ins WHERE type='entrada' AND date(timestamp)=?").get(today).n;
  const checkinsToday  = db.prepare("SELECT COUNT(*) AS n FROM check_ins WHERE date(timestamp)=?").get(today).n;
  const insideNow = db.prepare(`
    SELECT COUNT(*) AS n FROM employees e
    WHERE e.active=1 AND (
      SELECT type FROM check_ins WHERE employee_id=e.id AND date(timestamp)=?
      ORDER BY timestamp DESC LIMIT 1
    )='entrada'
  `).get(today).n;
  const insideList = db.prepare(`
    SELECT e.id, e.name, e.last_name, e.photo, e.employee_number,
           ci.timestamp AS last_checkin
    FROM employees e
    JOIN check_ins ci ON ci.employee_id=e.id
    WHERE ci.id=(
      SELECT id FROM check_ins WHERE employee_id=e.id AND date(timestamp)=?
      ORDER BY timestamp DESC LIMIT 1
    ) AND ci.type='entrada' AND e.active=1
    ORDER BY ci.timestamp DESC
  `).all(today);
  const absentToday = Math.max(0, totalEmployees - presentToday);
  res.json({ totalEmployees, presentToday, checkinsToday, insideNow, insideList, absentToday, date: today });
});

// ── Wallet config ────────────────────────────────────
app.get("/api/wallet/config", auth, (req, res) => {
  const db = DB.getDb();
  const get = k => db.prepare("SELECT value FROM config WHERE key=?").get(k)?.value ?? null;
  res.json({
    pass_type_id:    get("wallet_pass_type_id"),
    team_id:         get("wallet_team_id"),
    bg_color:        get("wallet_bg_color")        || "rgb(26,26,26)",
    fg_color:        get("wallet_fg_color")        || "rgb(255,255,255)",
    label_color:     get("wallet_label_color")     || "rgb(170,170,170)",
    has_cert:        !!(get("wallet_signer_cert_pem")),
    has_key:         !!(get("wallet_signer_key_pem")),
    has_wwdr:        !!(get("wallet_wwdr_pem")),
    fields_config:   get("wallet_fields_config")   || null,
    bg_type:         get("wallet_bg_type")         || "preset",
    bg_preset:       get("wallet_bg_preset")       || "midnight",
    bg_image:        get("wallet_bg_image")        || null,
    overlay_color:   get("wallet_overlay_color")   || "#000000",
    overlay_opacity: get("wallet_overlay_opacity") || "0",
  });
});

app.post("/api/wallet/config", auth, (req, res) => {
  const db = DB.getDb();
  const set = (k, v) => { if (v !== undefined && v !== null) db.prepare("INSERT OR REPLACE INTO config VALUES (?,?)").run(k, v); };
  const { pass_type_id, team_id, bg_color, fg_color, label_color, signer_cert_pem, signer_key_pem, wwdr_pem, fields_config,
          bg_type, bg_preset, bg_image, overlay_color, overlay_opacity } = req.body;
  set("wallet_pass_type_id",    pass_type_id);
  set("wallet_team_id",         team_id);
  set("wallet_bg_color",        bg_color);
  set("wallet_fg_color",        fg_color);
  set("wallet_label_color",     label_color);
  set("wallet_fields_config",   fields_config);
  set("wallet_bg_type",         bg_type);
  set("wallet_bg_preset",       bg_preset);
  set("wallet_overlay_color",   overlay_color);
  set("wallet_overlay_opacity", overlay_opacity);
  if (bg_image !== undefined && bg_image !== null) set("wallet_bg_image", bg_image);
  if (signer_cert_pem) set("wallet_signer_cert_pem", signer_cert_pem);
  if (signer_key_pem)  set("wallet_signer_key_pem",  signer_key_pem);
  if (wwdr_pem)        set("wallet_wwdr_pem",         wwdr_pem);
  res.json({ ok: true });
});

// ── Fetch wallet certs from Railway (with local cache 7 days) ──
async function getWalletCerts() {
  const db  = DB.getDb();
  const get = k => db.prepare("SELECT value FROM config WHERE key=?").get(k)?.value ?? null;

  // Use local certs if available — fetch from Railway only when stale (>7 days)
  const certPem = get("wallet_signer_cert_pem");
  const keyPem  = get("wallet_signer_key_pem");
  const wwdrPem = get("wallet_wwdr_pem");
  if (certPem && keyPem && wwdrPem) {
    const cachedAt = get("wallet_certs_cached_at");
    const age = cachedAt ? Date.now() - new Date(cachedAt).getTime() : 0;
    if (age < 7 * 24 * 60 * 60 * 1000) {
      return {
        signer_cert_pem: certPem, signer_key_pem: keyPem, wwdr_pem: wwdrPem,
        pass_type_id: get("wallet_pass_type_id") || "pass.com.d99tech.dclock",
        team_id:      get("wallet_team_id")      || "56SBW74WX9",
      };
    }
  }

  // Fetch from Railway using the stored license key
  const licenseKey = get("license_key");
  if (!licenseKey) throw new Error("Licencia no activada");

  const { API_URL } = require("../config");
  const https = require("https");

  const certs = await new Promise((resolve, reject) => {
    const req = https.request(`${API_URL}/api/wallet/certs`, {
      method: "GET",
      headers: { "x-license-key": licenseKey },
    }, res => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        try {
          const data = JSON.parse(raw);
          if (res.statusCode !== 200) reject(new Error(data.error || `HTTP ${res.statusCode}`));
          else resolve(data);
        } catch { reject(new Error("Respuesta inválida del servidor de licencias")); }
      });
    });
    req.on("error", reject);
    req.end();
  });

  // Save to local cache
  const set = (k, v) => db.prepare("INSERT OR REPLACE INTO config VALUES (?,?)").run(k, v);
  set("wallet_signer_cert_pem", certs.signer_cert_pem);
  set("wallet_signer_key_pem",  certs.signer_key_pem);
  set("wallet_wwdr_pem",        certs.wwdr_pem);
  set("wallet_pass_type_id",    certs.pass_type_id || "pass.com.d99tech.dclock");
  set("wallet_team_id",         certs.team_id      || "56SBW74WX9");
  set("wallet_certs_cached_at", new Date().toISOString());

  return certs;
}

// ── Public wallet display config (no auth — visual data only) ──
app.get("/api/wallet/display", (req, res) => {
  const db = DB.getDb();
  const get = k => db.prepare("SELECT value FROM config WHERE key=?").get(k)?.value ?? null;
  res.json({
    bg_type:         get("wallet_bg_type")         || "preset",
    bg_preset:       get("wallet_bg_preset")        || "midnight",
    bg_image:        get("wallet_bg_image")         || null,
    bg_color:        get("wallet_bg_color")         || "rgb(15,52,96)",
    fg_color:        get("wallet_fg_color")         || "rgb(255,255,255)",
    label_color:     get("wallet_label_color")      || "rgb(170,170,170)",
    overlay_color:   get("wallet_overlay_color")    || "#000000",
    overlay_opacity: get("wallet_overlay_opacity")  || "0",
    fields_config:   get("wallet_fields_config")    || null,
  });
});

// ── Generate Apple Wallet pass ─────────────────────────
app.get("/api/employees/:id/pass.pkpass", async (req, res) => {
  try {
    const { PKPass } = require("passkit-generator");
    const db = DB.getDb();

    // Get certs from Railway (or local cache)
    let certs;
    try {
      certs = await getWalletCerts();
    } catch (e) {
      return res.status(503).json({ error: `No se pudieron obtener los certificados: ${e.message}` });
    }
    const certPem = certs.signer_cert_pem;
    const keyPem  = certs.signer_key_pem;
    const wwdrPem = certs.wwdr_pem;
    if (!certPem || !keyPem || !wwdrPem)
      return res.status(503).json({ error: "Certificados incompletos en el servidor." });

    const emp = db.prepare(`
      SELECT e.*, d.name AS dept, a.name AS area_name, j.name AS title
      FROM employees e
      LEFT JOIN departments d ON e.department_id=d.id
      LEFT JOIN areas       a ON e.area_id=a.id
      LEFT JOIN job_titles  j ON e.job_title_id=j.id
      WHERE e.id=? AND e.active=1
    `).get(req.params.id);
    if (!emp) return res.status(404).json({ error: "Empleado no encontrado" });

    const get = k => db.prepare("SELECT value FROM config WHERE key=?").get(k)?.value ?? null;
    const companyName = get("company_name")       || "D-CLOCK";
    const companyLogo = get("company_logo")       || null;
    const bgColor     = get("wallet_bg_color")    || "rgb(26,26,26)";
    const fgColor     = get("wallet_fg_color")    || "rgb(255,255,255)";
    const lblColor    = get("wallet_label_color") || "rgb(170,170,170)";
    const passTypeId  = certs.pass_type_id        || "pass.com.d99tech.dclock";
    const teamId      = certs.team_id             || "56SBW74WX9";

    const fullName = `${emp.name}${emp.last_name ? " " + emp.last_name : ""}`;

    // Load dynamic field config (saved by the designer UI)
    let fieldsConfig = null;
    const rawFC = get("wallet_fields_config");
    if (rawFC) { try { fieldsConfig = JSON.parse(rawFC); } catch {} }
    if (!fieldsConfig || !fieldsConfig.zones) {
      fieldsConfig = { showPhoto: true, zones: {
        primary:   [{ dataKey: "fullName",        label: "EMPLEADO" }],
        secondary: [{ dataKey: "title",            label: "PUESTO" }, { dataKey: "area_name", label: "ÁREA" }],
        auxiliary: [{ dataKey: "employee_number",  label: "NO. EMPLEADO" }],
        back:      [{ dataKey: "companyName",      label: "EMPRESA" }, { dataKey: "email", label: "EMAIL" }, { dataKey: "phone", label: "TELÉFONO" }],
      }};
    }

    function resolveField(dataKey) {
      const birthStr = emp.birth_date ? new Date(emp.birth_date).toLocaleDateString("es-MX") : "";
      const map = {
        fullName:        fullName,
        employee_number: emp.employee_number || "",
        title:           emp.title           || "",
        area_name:       emp.area_name       || "",
        dept:            emp.dept            || "",
        email:           emp.email           || "",
        phone:           emp.phone           || "",
        nss:             emp.nss             || "",
        rfc:             emp.rfc             || "",
        curp:            emp.curp            || "",
        birth_date:      birthStr,
        gender:          emp.gender          || "",
        companyName:     companyName,
      };
      return map[dataKey] ?? "";
    }

    const toPassFields = (zoneFields) =>
      (zoneFields || [])
        .map(f => ({ key: f.dataKey, label: f.label, value: resolveField(f.dataKey) }))
        .filter(f => f.value !== "");

    const passJson = {
      formatVersion: 1,
      passTypeIdentifier: passTypeId,
      serialNumber: `DCLOCK-EMP-${emp.id}`,
      teamIdentifier: teamId,
      organizationName: companyName,
      description: `Credencial — ${fullName}`,
      backgroundColor: bgColor,
      foregroundColor: fgColor,
      labelColor: lblColor,
      generic: {
        primaryFields:   toPassFields(fieldsConfig.zones.primary),
        secondaryFields: toPassFields(fieldsConfig.zones.secondary),
        auxiliaryFields: toPassFields(fieldsConfig.zones.auxiliary),
        backFields:      toPassFields(fieldsConfig.zones.back),
      },
    };

    function b64ToBuffer(dataUri) {
      if (!dataUri) return null;
      const b64 = dataUri.includes(",") ? dataUri.split(",")[1] : dataUri;
      return Buffer.from(b64, "base64");
    }

    const iconPath = path.join(__dirname, "..", "assets", "icon.png");
    const iconBuf  = fs.existsSync(iconPath) ? fs.readFileSync(iconPath) : null;

    const files = { "pass.json": Buffer.from(JSON.stringify(passJson)) };
    if (iconBuf) { files["icon.png"] = iconBuf; files["icon@2x.png"] = iconBuf; }

    if (emp.photo && fieldsConfig.showPhoto !== false) {
      const pb = b64ToBuffer(emp.photo);
      if (pb) { files["thumbnail.png"] = pb; files["thumbnail@2x.png"] = pb; }
    }
    if (companyLogo) {
      const lb = b64ToBuffer(companyLogo);
      if (lb) { files["logo.png"] = lb; files["logo@2x.png"] = lb; }
    }
    // Include custom background image if user uploaded one
    const bgType  = get("wallet_bg_type")  || "preset";
    const bgImage = get("wallet_bg_image") || null;
    if (bgType === "image" && bgImage) {
      const bb = b64ToBuffer(bgImage);
      if (bb) { files["background.png"] = bb; files["background@2x.png"] = bb; }
    }

    const pass   = new PKPass(files, { wwdr: wwdrPem, signerCert: certPem, signerKey: keyPem });
    const buffer = await pass.getAsBuffer();

    res.set({
      "Content-Type": "application/vnd.apple.pkpass",
      "Content-Disposition": `attachment; filename="dclock-${emp.employee_number}.pkpass"`,
    });
    res.send(buffer);
  } catch (e) {
    console.error("Pass generation error:", e.message);
    res.status(500).json({ error: e.message });
  }
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
      if (lic?.license_key) {
        DB.getDb().prepare("INSERT OR REPLACE INTO config VALUES ('license_key',?)").run(lic.license_key);
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

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
  const isTeamAdmin = !!(DB.getDb().prepare("SELECT 1 FROM teams WHERE admin_id=?").get(emp.id));
  const { face_descriptor, ...empData } = emp;
  res.json({ ok: true, employee: { ...empData, has_face: !!face_descriptor, is_team_admin: isTeamAdmin }, last_checkin: last || null });
});

// ── Checkins de hoy para empleado (móvil) ────────────
app.get("/api/mobile/checkins/today", (req, res) => {
  const { employee_id, date } = req.query;
  if (!employee_id) return res.status(400).json({ error: "employee_id requerido" });
  const targetDate = date || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  const rows = DB.getDb().prepare(`
    SELECT ci.id, ci.type, ci.timestamp, ci.latitude, ci.longitude, ci.photo, ci.face_verified,
           g.name AS geofence_name
    FROM check_ins ci
    LEFT JOIN geofences g ON g.id = ci.geofence_id
    WHERE ci.employee_id = ? AND date(ci.timestamp,'localtime') = ?
    ORDER BY ci.timestamp ASC
  `).all(employee_id, targetDate);
  res.json(rows.map(r => ({ ...r, type: r.type === "entrada" ? "in" : "out" })));
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

function timeToMins(t) {
  if (!t || t === '00:00') return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function detectShift(checkinTimestamp, allSchedules) {
  const d = new Date(checkinTimestamp.replace(' ', 'T'));
  const checkinMins = d.getHours() * 60 + d.getMinutes();
  const workShifts = allSchedules.filter(s => s.type === 'trabajo' && timeToMins(s.check_in_time));
  let best = null, bestAbs = Infinity;
  for (const shift of workShifts) {
    const shiftMins = timeToMins(shift.check_in_time);
    const falta = shift.falta_minutes || 60;
    const delta = checkinMins - shiftMins;
    if (delta >= -90 && delta <= falta) {
      const abs = Math.abs(delta);
      if (abs < bestAbs) { bestAbs = abs; best = { shift, delta }; }
    }
  }
  return best;
}

function calcAttendanceStatus(delta, tolerance, faltaMins) {
  if (delta <= (tolerance || 15)) return 'a_tiempo';
  if (delta <= (faltaMins || 60)) return 'retardo';
  return 'falta';
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
  const ts = nowMX();
  const result = db.prepare(
    "INSERT INTO check_ins (employee_id, type, timestamp, latitude, longitude, photo, geofence_id, face_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(employee_id, dbType, ts, lat, lng, photo, geofence_id, face_verified);

  let attendance_status = null, detected_schedule_id = null;
  if (dbType === 'entrada') {
    const allScheds = db.prepare("SELECT * FROM schedules").all();
    const detected = detectShift(ts, allScheds);
    if (detected) {
      attendance_status = calcAttendanceStatus(detected.delta, detected.shift.tolerance_minutes, detected.shift.falta_minutes);
      detected_schedule_id = detected.shift.id;
      db.prepare("UPDATE check_ins SET attendance_status=?, detected_schedule_id=? WHERE id=?")
        .run(attendance_status, detected_schedule_id, result.lastInsertRowid);
    }
  }

  const row = db.prepare("SELECT id, type, timestamp FROM check_ins WHERE id=?").get(result.lastInsertRowid);
  res.json({ id: row.id, type: row.type === "entrada" ? "in" : "out", timestamp: row.timestamp, geofence_name, face_verified, attendance_status });
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
app.patch("/api/employees/:id", auth, (req, res) => {
  try {
    const { active } = req.body;
    DB.getDb().prepare("UPDATE employees SET active=? WHERE id=?").run(active ? 1 : 0, req.params.id);
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
app.delete("/api/employees/:id", auth, (req, res) => {
  try {
    const db = DB.getDb();
    db.prepare("DELETE FROM check_ins WHERE employee_id=?").run(req.params.id);
    db.prepare("DELETE FROM employees WHERE id=?").run(req.params.id);
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
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
  const db2 = DB.getDb();
  const r = db2.prepare(
    "INSERT INTO check_ins (employee_id,type,timestamp,latitude,longitude,geofence_id,device_id) VALUES (?,?,?,?,?,?,?)"
  ).run(employee_id, type, ts, latitude||null, longitude||null, geofence_id||null, device_id||null);

  let attendance_status = null, detected_schedule_id = null;
  if (type === 'entrada') {
    const allScheds = db2.prepare("SELECT * FROM schedules").all();
    const detected = detectShift(ts, allScheds);
    if (detected) {
      attendance_status = calcAttendanceStatus(detected.delta, detected.shift.tolerance_minutes, detected.shift.falta_minutes);
      detected_schedule_id = detected.shift.id;
      db2.prepare("UPDATE check_ins SET attendance_status=?, detected_schedule_id=? WHERE id=?")
        .run(attendance_status, detected_schedule_id, r.lastInsertRowid);
    }
  }

  const checkin = {
    id: r.lastInsertRowid,
    employee_id,
    employee_name: emp.name,
    employee_number: emp.employee_number,
    photo: emp.photo || null,
    type,
    timestamp: ts,
    latitude, longitude,
    attendance_status,
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

app.get("/api/attendance-report", auth, (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: "from y to requeridos" });
  const db = DB.getDb();
  const DAY_NAMES = ['dom','lun','mar','mie','jue','vie','sab'];
  const dates = [];
  let cur = new Date(from + 'T12:00:00');
  const end = new Date(to + 'T12:00:00');
  while (cur <= end) { dates.push(cur.toLocaleDateString('en-CA')); cur.setDate(cur.getDate()+1); }
  const emps = db.prepare(`
    SELECT e.id, e.name, e.last_name, e.employee_number, e.photo,
           s.id AS sched_id, s.name AS sched_name, s.check_in_time,
           s.tolerance_minutes, s.falta_minutes, s.days, s.type AS sched_type
    FROM employees e LEFT JOIN schedules s ON e.schedule_id=s.id
    WHERE e.active=1 ORDER BY e.name, e.last_name
  `).all();
  const overrides = db.prepare(`
    SELECT sa.employee_id, sa.date, s.id AS sched_id, s.name AS sched_name,
           s.check_in_time, s.tolerance_minutes, s.falta_minutes, s.days, s.type AS sched_type
    FROM schedule_assignments sa JOIN schedules s ON sa.schedule_id=s.id
    WHERE sa.date>=? AND sa.date<=?
  `).all(from, to);
  const checkins = db.prepare(`
    SELECT ci.employee_id, date(ci.timestamp) AS date, ci.timestamp,
           ci.attendance_status, ci.detected_schedule_id, s.name AS detected_sched_name
    FROM check_ins ci LEFT JOIN schedules s ON ci.detected_schedule_id=s.id
    WHERE ci.type='entrada' AND date(ci.timestamp)>=? AND date(ci.timestamp)<=?
    ORDER BY ci.timestamp ASC
  `).all(from, to);
  const overrideMap = {};
  for (const o of overrides) overrideMap[`${o.employee_id}_${o.date}`] = o;
  const checkinMap = {};
  for (const ci of checkins) { const k=`${ci.employee_id}_${ci.date}`; if(!checkinMap[k])checkinMap[k]=ci; }
  const report = emps.map(emp => {
    const days = dates.map(date => {
      const dow = DAY_NAMES[new Date(date+'T12:00:00').getDay()];
      const override = overrideMap[`${emp.id}_${date}`];
      const expected = override || emp;
      let shouldWork = false;
      if (expected.sched_type==='trabajo' && expected.days) {
        try { shouldWork = JSON.parse(expected.days).includes(dow); } catch {}
      }
      const ci = checkinMap[`${emp.id}_${date}`];
      let status = 'no_aplica', detectedShiftName = null, deviation = false;
      if (shouldWork) {
        if (!ci) { status = 'falta'; }
        else {
          status = ci.attendance_status || 'a_tiempo';
          detectedShiftName = ci.detected_sched_name || null;
          if (ci.detected_schedule_id && expected.sched_id && ci.detected_schedule_id !== expected.sched_id) deviation = true;
        }
      }
      return { date, dow, status, checkin_time: ci ? ci.timestamp.slice(11,16) : null, detectedShiftName, deviation, expectedShiftName: expected.sched_name || null, shouldWork };
    });
    const s = days.reduce((a,d)=>{ if(d.status==='a_tiempo')a.aT++; else if(d.status==='retardo')a.ret++; else if(d.status==='falta')a.falt++; if(d.deviation)a.dev++; return a; },{aT:0,ret:0,falt:0,dev:0});
    return { id:emp.id, name:[emp.name,emp.last_name].filter(Boolean).join(' '), employee_number:emp.employee_number, photo:emp.photo, defaultShift:emp.sched_name||'—', days, summary:s };
  });
  res.json({ dates, report });
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

// ── Wallet background rendering ───────────────────────
// CSS patterns mirrored from the frontend designer
const BG_PRESETS_SERVER = {
  carbon:  'repeating-linear-gradient(45deg,rgba(255,255,255,.05) 0,rgba(255,255,255,.05) 1px,transparent 1px,transparent 10px),repeating-linear-gradient(-45deg,rgba(255,255,255,.05) 0,rgba(255,255,255,.05) 1px,transparent 1px,transparent 10px)',
  cosmos:  'radial-gradient(circle,rgba(255,255,255,.18) 1px,transparent 1px) 0 0/20px 20px,radial-gradient(circle,rgba(255,255,255,.09) 1px,transparent 1px) 10px 10px/20px 20px',
  ocean:   'repeating-linear-gradient(0deg,rgba(255,255,255,.08) 0,rgba(255,255,255,.08) 1px,transparent 1px,transparent 20px)',
  mesh:    'linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px) 0 0/26px 26px,linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px) 0 0/26px 26px',
  aurora:  'repeating-linear-gradient(-55deg,rgba(255,255,255,.07) 0,rgba(255,255,255,.07) 1.5px,transparent 1.5px,transparent 18px)',
  diamond: 'repeating-linear-gradient(45deg,rgba(255,255,255,.09) 0,rgba(255,255,255,.09) 1px,transparent 1px,transparent 16px),repeating-linear-gradient(135deg,rgba(255,255,255,.09) 0,rgba(255,255,255,.09) 1px,transparent 1px,transparent 16px)',
  dots:    'radial-gradient(circle,rgba(255,255,255,.2) 1.5px,transparent 1.5px) 0 0/18px 18px',
  copper:  'repeating-linear-gradient(-45deg,rgba(255,255,255,.08) 0,rgba(255,255,255,.08) 1px,transparent 1px,transparent 9px)',
  glacier: 'radial-gradient(circle,rgba(255,255,255,.16) 1px,transparent 1px) 0 0/16px 16px,radial-gradient(circle,rgba(255,255,255,.08) 2px,transparent 2px) 8px 8px/32px 32px',
  ember:   'radial-gradient(ellipse at 50% 30%,rgba(255,255,255,.12) 0,transparent 60%)',
  slate:   'repeating-linear-gradient(90deg,rgba(255,255,255,.06) 0,rgba(255,255,255,.06) 1px,transparent 1px,transparent 22px),repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0,rgba(255,255,255,.06) 1px,transparent 1px,transparent 22px)',
  waves:   'radial-gradient(farthest-side at 50% -30%,transparent 60%,rgba(255,255,255,.11) 61%,rgba(255,255,255,.11) 62%,transparent 63%) 0 0/26px 13px,radial-gradient(farthest-side at 50% -30%,transparent 60%,rgba(255,255,255,.11) 61%,rgba(255,255,255,.11) 62%,transparent 63%) 13px 6.5px/26px 13px',
  ripple:  'radial-gradient(circle,transparent 18%,rgba(255,255,255,.1) 19%,rgba(255,255,255,.1) 20%,transparent 21%,transparent 37%,rgba(255,255,255,.06) 38%,rgba(255,255,255,.06) 39%,transparent 40%) 0 0/36px 36px',
  hex:     'radial-gradient(circle,rgba(255,255,255,.13) 1.5px,transparent 1.5px) 0 0/18px 31px,radial-gradient(circle,rgba(255,255,255,.13) 1.5px,transparent 1.5px) 9px 15.5px/18px 31px',
  zigzag:  'repeating-linear-gradient(135deg,rgba(255,255,255,.09) 0,rgba(255,255,255,.09) 1.5px,transparent 1.5px,transparent 12px),repeating-linear-gradient(225deg,rgba(255,255,255,.09) 0,rgba(255,255,255,.09) 1.5px,transparent 1.5px,transparent 12px) 0 6px',
  stripe:  'repeating-linear-gradient(-22deg,rgba(255,255,255,.07) 0,rgba(255,255,255,.07) 4px,transparent 4px,transparent 22px)',
  fish:    'radial-gradient(farthest-side at 0% 50%,transparent 70%,rgba(255,255,255,.1) 71%,rgba(255,255,255,.1) 72%,transparent 73%) 0 0/22px 22px,radial-gradient(farthest-side at 100% 50%,transparent 70%,rgba(255,255,255,.1) 71%,rgba(255,255,255,.1) 72%,transparent 73%) 11px 11px/22px 22px',
  none:    '',
};

// Pure Node.js solid-color PNG generator (no deps, always works).
// Used as the reliable baseline; pattern is layered on top by renderBgPng.
function solidColorPng(cssColor, w = 360, h = 440) {
  const zlib = require("zlib");
  const m = cssColor.match(/rgb\((\d+)[,\s]+(\d+)[,\s]+(\d+)\)/);
  let r = 26, g = 26, b = 26;
  if (m) { r = +m[1]; g = +m[2]; b = +m[3]; }
  else if (cssColor.startsWith("#")) {
    const hx = cssColor.slice(1);
    r = parseInt(hx.slice(0,2),16); g = parseInt(hx.slice(2,4),16); b = parseInt(hx.slice(4,6),16);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w,0); ihdr.writeUInt32BE(h,4); ihdr[8]=8; ihdr[9]=2;
  const raw = Buffer.alloc((1 + w*3) * h);
  for (let y=0; y<h; y++) {
    const o = y*(1+w*3);
    for (let x=0; x<w; x++) { raw[o+1+x*3]=r; raw[o+1+x*3+1]=g; raw[o+1+x*3+2]=b; }
  }
  const idat = zlib.deflateSync(raw, {level:1});
  let crc = 0xFFFFFFFF;
  function crc32(buf) {
    crc = 0xFFFFFFFF;
    for (let i=0; i<buf.length; i++) { crc^=buf[i]; for(let j=0;j<8;j++) crc=(crc&1)?0xEDB88320^(crc>>>1):(crc>>>1); }
    return (crc^0xFFFFFFFF)>>>0;
  }
  function chunk(t, d) {
    const c = Buffer.alloc(12+d.length);
    c.writeUInt32BE(d.length,0); c.write(t,4,"ascii"); d.copy(c,8);
    c.writeUInt32BE(crc32(c.slice(4,8+d.length)), 8+d.length); return c;
  }
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk("IHDR",ihdr), chunk("IDAT",idat), chunk("IEND",Buffer.alloc(0))]);
}

// Renders the CSS background pattern as PNG using Electron offscreen.
// Uses the paint event (more reliable than did-finish-load) and a temp file (avoids data: URL limits).
async function renderBgPng(bgCss, overlayColor, overlayOpacity) {
  try {
    const { BrowserWindow } = require("electron");
    const os = require("os");
    const W = 360, H = 440;
    const op = Math.max(0, Math.min(1, (parseFloat(overlayOpacity)||0)/100)).toFixed(3);
    const overlayDiv = parseFloat(op) > 0
      ? `<div style="position:absolute;inset:0;background:${overlayColor};opacity:${op}"></div>` : "";
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0}body{width:${W}px;height:${H}px;overflow:hidden;position:relative}</style></head><body><div style="position:absolute;inset:0;background:${bgCss.replace(/'/g,'"')}"></div>${overlayDiv}</body></html>`;
    const tmpPath = path.join(os.tmpdir(), `dclock-bg-${Date.now()}.html`);
    fs.writeFileSync(tmpPath, html, "utf8");

    return await new Promise((resolve) => {
      let done = false;
      const cleanup = (result) => {
        if (done) return; done = true;
        try { win.destroy(); } catch {}
        try { fs.unlinkSync(tmpPath); } catch {}
        resolve(result);
      };
      const timeout = setTimeout(() => cleanup(null), 6000);
      const win = new BrowserWindow({ width: W, height: H, show: false,
        webPreferences: { offscreen: true, contextIsolation: true, sandbox: false } });
      win.webContents.on("paint", (e, dirty, image) => {
        clearTimeout(timeout);
        cleanup(image.isEmpty() ? null : image.toPNG());
      });
      win.webContents.setFrameRate(30);
      win.loadFile(tmpPath);
    });
  } catch (e) {
    console.error("renderBgPng error:", e.message);
    return null;
  }
}

// Genera strip.png 750×288px por empleado para pases storeCard.
// Strip = color de fondo + logo empresa translúcido de watermark + nombre en 2 líneas + foto cuadrada redondeada.
function _parseRgb(rgbStr) {
  const m = (rgbStr || "").match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])] : [26, 26, 26];
}

function _solidColorStrip(bgColor) {
  try {
    const { nativeImage } = require("electron");
    const W = 750, H = 288;
    const [r, g, b] = _parseRgb(bgColor);
    const pixels = Buffer.alloc(W * H * 4);
    for (let i = 0; i < W * H; i++) {
      pixels[i * 4] = r; pixels[i * 4 + 1] = g; pixels[i * 4 + 2] = b; pixels[i * 4 + 3] = 255;
    }
    const img = nativeImage.createFromBuffer(pixels, { width: W, height: H });
    const buf = img.toPNG();
    return buf.length > 0 ? buf : null;
  } catch (e) {
    console.error("_solidColorStrip error:", e.message);
    return null;
  }
}

async function renderStripPng({ bgColor, logoDataUri, photoDataUri, empName, empLastName, empTitle, fgColor }) {
  try {
    const { BrowserWindow } = require("electron");
    const os = require("os");
    const W = 750, H = 288;

    const photoEl = photoDataUri ? `<div class="photo"><img src="${photoDataUri}"></div>` : '';
    const fg      = fgColor || 'rgb(255,255,255)';

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
.card{width:${W}px;height:${H}px;background:${bgColor.replace(/'/g,'"')};position:relative;display:flex;align-items:center;padding:26px 30px;gap:20px;overflow:hidden}
.info{position:relative;flex:1;min-width:0;color:${fg}}
.firstname{font-size:34px;font-weight:800;letter-spacing:-.6px;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lastname{font-size:27px;font-weight:600;letter-spacing:-.4px;line-height:1.2;opacity:.88;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sep{width:32px;height:2px;background:currentColor;opacity:.22;border-radius:2px;margin:8px 0 6px}
.jobtitle{font-size:16px;font-weight:500;letter-spacing:-.2px;opacity:.82;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2}
.photo{position:relative;width:192px;height:226px;border-radius:16px;overflow:hidden;flex-shrink:0;box-shadow:0 6px 24px rgba(0,0,0,.4);border:2px solid rgba(255,255,255,.22)}
.line-top{position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.55) 30%,rgba(255,255,255,.55) 70%,transparent 100%)}
.line-bottom{position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.22) 30%,rgba(255,255,255,.22) 70%,transparent 100%)}
.photo img{width:100%;height:100%;object-fit:cover}
</style></head><body>
<div class="card">
  <div class="line-top"></div>
  <div class="info">
    <div class="firstname">${empName || ''}</div>
    <div class="lastname">${empLastName || ''}</div>
    <div class="sep"></div>
    ${empTitle ? `<div class="jobtitle">${empTitle}</div>` : ''}
  </div>
  ${photoEl}
  <div class="line-bottom"></div>
</div>
</body></html>`;

    const tmpPath = path.join(os.tmpdir(), `dclock-strip-${Date.now()}.html`);
    fs.writeFileSync(tmpPath, html, "utf8");

    return await new Promise((resolve) => {
      let done = false;
      const cleanup = (result) => {
        if (done) return; done = true;
        try { win.destroy(); } catch {}
        try { fs.unlinkSync(tmpPath); } catch {}
        resolve(result);
      };
      const timeout = setTimeout(() => cleanup(null), 12000);
      const win = new BrowserWindow({ width: W, height: H, show: false,
        webPreferences: { offscreen: true, contextIsolation: true, sandbox: false } });
      win.webContents.once("did-finish-load", () => {
        setTimeout(() => {
          win.webContents.capturePage().then(image => {
            clearTimeout(timeout);
            const buf = image.isEmpty() ? null : image.toPNG();
            console.log(`[Strip] capturePage: ${buf ? buf.length + " bytes" : "VACÍO"}`);
            cleanup(buf);
          }).catch(e => {
            console.error("[Strip] capturePage error:", e.message);
            clearTimeout(timeout); cleanup(null);
          });
        }, 500);
      });
      win.loadFile(tmpPath);
    });
  } catch (e) {
    console.error("renderStripPng error:", e.message);
    return null;
  }
}

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

// ── QR preview for wallet credential ──────────────────
app.get("/api/wallet-qr/:empId", auth, async (req, res) => {
  try {
    const QRCode = require("qrcode");
    const db2 = DB.getDb();
    const emp = db2.prepare("SELECT employee_number, id FROM employees WHERE id = ?").get(req.params.empId);
    if (!emp) return res.status(404).json({ error: "Not found" });
    const companyLogo = db2.prepare("SELECT value FROM config WHERE key='company_logo'").get()?.value || null;
    const data = emp.employee_number || String(emp.id);

    // Genera matriz QR con nivel H para soportar logo al centro
    const qr = QRCode.create(data, { errorCorrectionLevel: "H" });
    const size = qr.modules.size;
    const mods = qr.modules.data;
    const cell = 10;
    const svgPx = size * cell;
    const pad = 12;
    const total = svgPx + pad * 2;

    // Dots redondos para cada módulo oscuro
    let dots = "";
    const rnd = Math.round(cell * 0.32); // radio de esquinas ~30% del cell
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (mods[r * size + c]) {
          const x = pad + c * cell + 1;
          const y = pad + r * cell + 1;
          const w = cell - 2;
          dots += `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="${rnd}" fill="white"/>`;
        }
      }
    }

    // Logo de empresa al centro (22% del area QR, nivel H soporta hasta 30%)
    let logoEl = "";
    if (companyLogo) {
      const ls = Math.round(svgPx * 0.22);
      const lx = pad + Math.round((svgPx - ls) / 2);
      const ly = pad + Math.round((svgPx - ls) / 2);
      const bg = ls + 8;
      const bgx = lx - 4, bgy = ly - 4;
      logoEl = `<rect x="${bgx}" y="${bgy}" width="${bg}" height="${bg}" rx="6" fill="#1c1c1e"/>
<image x="${lx}" y="${ly}" width="${ls}" height="${ls}" href="${companyLogo}" preserveAspectRatio="xMidYMid meet"/>`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${total} ${total}" width="${total}" height="${total}">
<rect width="${total}" height="${total}" rx="14" fill="#1c1c1e"/>
${dots}
${logoEl}
</svg>`;

    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
    res.json({ dataUrl });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
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

    // Layout fijo del storeCard — sin primaryFields (se encima al strip en Apple Wallet).
    // Todo el texto va debajo del strip: secondary + auxiliary.
    const fieldsConfig = { zones: {
      primary:   [],
      secondary: [{ dataKey: "area_name",       label: "ÁREA" },
                  { dataKey: "dept",            label: "DEPTO." }],
      auxiliary: [{ dataKey: "employee_number", label: "NO. EMPLEADO" }],
      back:      [{ dataKey: "fullName",         label: "EMPLEADO" },
                  { dataKey: "companyName",      label: "EMPRESA" },
                  { dataKey: "gender",           label: "GÉNERO" },
                  { dataKey: "email",            label: "EMAIL" },
                  { dataKey: "phone",            label: "TELÉFONO" }],
    }};

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
        .map(f => ({ key: f.dataKey, label: f.label, value: resolveField(f.dataKey) || "—" }));

    const barcodeMsg = emp.employee_number || String(emp.id);

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
      suppressStripShine: true,
      barcodes: [{ message: barcodeMsg, format: "PKBarcodeFormatQR", messageEncoding: "iso-8859-1" }],
      storeCard: {
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

    // Apple Wallet requires images to be actual PNG — JPEG bytes named .png are silently ignored.
    // Use Electron's nativeImage to decode any format (JPEG/PNG/WebP) and re-encode as PNG.
    function toPngBuffer(buffer) {
      try {
        const { nativeImage } = require("electron");
        const ni = nativeImage.createFromBuffer(buffer);
        if (ni.isEmpty()) return buffer;
        return ni.toPNG();
      } catch {
        return buffer;
      }
    }

    const iconPath = path.join(__dirname, "..", "assets", "icon.png");
    const iconBuf  = fs.existsSync(iconPath) ? fs.readFileSync(iconPath) : null;

    const files = { "pass.json": Buffer.from(JSON.stringify(passJson)) };
    if (iconBuf) { files["icon.png"] = iconBuf; files["icon@2x.png"] = iconBuf; }

    // Logo para el pase (logo bar top-left)
    if (companyLogo) {
      const lb = b64ToBuffer(companyLogo);
      if (lb) { const png = toPngBuffer(lb); files["logo.png"] = png; files["logo@2x.png"] = png; }
    }

    // Strip.png — imagen diseñada por empleado (fondo+patrón+foto+info)
    const bgType         = get("wallet_bg_type")         || "preset";
    const bgPreset       = get("wallet_bg_preset")       || "none";
    const bgImage        = get("wallet_bg_image")        || null;
    const overlayColor   = get("wallet_overlay_color")   || "#000000";
    const overlayOpacity = get("wallet_overlay_opacity") || "0";

    const pattern = BG_PRESETS_SERVER[bgPreset] || "";
    let bgCss;
    if (bgType === "image" && bgImage) {
      bgCss = bgColor; // fondo sólido si el usuario eligió imagen (la imagen no aplica en strip)
    } else {
      bgCss = pattern ? `${pattern},${bgColor}` : bgColor;
    }

    const photoDataUri = emp.photo || null;

    const stripBuf = await renderStripPng({
      bgColor,
      logoDataUri:  companyLogo || null,
      photoDataUri,
      empName:      emp.name      || '',
      empLastName:  emp.last_name || '',
      empTitle:     emp.title     || '',
      fgColor,
    });

    if (stripBuf) {
      console.log(`[Pass] Strip HTML OK: ${stripBuf.length} bytes`);
      files["strip.png"]    = stripBuf;
      files["strip@2x.png"] = stripBuf;
    } else {
      console.warn("[Pass] Strip HTML falló — usando fallback color sólido");
      const fb = _solidColorStrip(bgColor);
      if (fb) { files["strip.png"] = fb; files["strip@2x.png"] = fb; }
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

// ── Equipos ───────────────────────────────────────────

const TEAM_SELECT = `
  SELECT t.id, t.name, t.description, t.created_at,
         t.admin_id,
         e.name AS admin_name, e.last_name AS admin_last_name,
         COUNT(DISTINCT tm.employee_id) AS member_count
  FROM teams t
  LEFT JOIN employees e ON e.id = t.admin_id
  LEFT JOIN team_members tm ON tm.team_id = t.id
  GROUP BY t.id ORDER BY t.name
`;

function teamTodayStats(db2, teamId) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  // "presente" = último check-in del día es tipo "entrada"
  const present = db2.prepare(`
    SELECT COUNT(*) AS cnt FROM (
      SELECT ci.employee_id, ci.type
      FROM check_ins ci
      JOIN team_members tm ON tm.employee_id = ci.employee_id
      WHERE tm.team_id = ? AND date(ci.timestamp,'localtime') = ?
      GROUP BY ci.employee_id
      HAVING ci.type = (SELECT type FROM check_ins WHERE employee_id = ci.employee_id
                        AND date(timestamp,'localtime') = ? ORDER BY timestamp DESC LIMIT 1)
      AND ci.type = 'entrada'
    )
  `).get(teamId, today, today);
  return present?.cnt || 0;
}

// GET /api/teams — lista todos los equipos con stats
app.get("/api/teams", auth, (req, res) => {
  const db2 = DB.getDb();
  const teams = db2.prepare(TEAM_SELECT).all();
  const result = teams.map(t => ({ ...t, present_today: teamTodayStats(db2, t.id) }));
  res.json(result);
});

// POST /api/teams — crear equipo
app.post("/api/teams", auth, (req, res) => {
  const { name, description, admin_id } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "El nombre es requerido" });
  const db2 = DB.getDb();
  try {
    const info = db2.prepare(
      "INSERT INTO teams (name, description, admin_id) VALUES (?,?,?)"
    ).run(name.trim(), description?.trim() || null, admin_id || null);
    const team = db2.prepare(TEAM_SELECT + " HAVING t.id = ?").get(info.lastInsertRowid) ||
                 db2.prepare("SELECT * FROM teams WHERE id=?").get(info.lastInsertRowid);
    res.json(team);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/teams/:id — detalle del equipo con miembros y status de hoy
app.get("/api/teams/:id", auth, (req, res) => {
  const db2 = DB.getDb();
  const team = db2.prepare(`
    SELECT t.id, t.name, t.description, t.created_at, t.admin_id,
           e.name AS admin_name, e.last_name AS admin_last_name
    FROM teams t LEFT JOIN employees e ON e.id = t.admin_id
    WHERE t.id = ?
  `).get(req.params.id);
  if (!team) return res.status(404).json({ error: "Equipo no encontrado" });

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  const members = db2.prepare(`
    SELECT e.id, e.employee_number, e.name, e.last_name, e.photo,
           d.name AS department, a.name AS area, j.name AS job_title,
           (SELECT type FROM check_ins
            WHERE employee_id = e.id AND date(timestamp,'localtime') = ?
            ORDER BY timestamp DESC LIMIT 1) AS last_type,
           (SELECT timestamp FROM check_ins
            WHERE employee_id = e.id AND date(timestamp,'localtime') = ?
            ORDER BY timestamp DESC LIMIT 1) AS last_time
    FROM team_members tm
    JOIN employees e ON e.id = tm.employee_id
    LEFT JOIN departments d ON d.id = e.department_id
    LEFT JOIN areas       a ON a.id = e.area_id
    LEFT JOIN job_titles  j ON j.id = e.job_title_id
    WHERE tm.team_id = ?
    ORDER BY e.name, e.last_name
  `).all(today, today, req.params.id);

  res.json({ ...team, members });
});

// PUT /api/teams/:id — actualizar equipo
app.put("/api/teams/:id", auth, (req, res) => {
  const { name, description, admin_id } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "El nombre es requerido" });
  const db2 = DB.getDb();
  db2.prepare("UPDATE teams SET name=?, description=?, admin_id=? WHERE id=?")
     .run(name.trim(), description?.trim() || null, admin_id || null, req.params.id);
  res.json({ ok: true });
});

// DELETE /api/teams/:id — eliminar equipo
app.delete("/api/teams/:id", auth, (req, res) => {
  DB.getDb().prepare("DELETE FROM teams WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// POST /api/teams/:id/members — agregar miembro
app.post("/api/teams/:id/members", auth, (req, res) => {
  const { employee_id } = req.body;
  if (!employee_id) return res.status(400).json({ error: "employee_id requerido" });
  try {
    DB.getDb().prepare("INSERT OR IGNORE INTO team_members (team_id, employee_id) VALUES (?,?)")
      .run(req.params.id, employee_id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /api/teams/:id/members/:empId — quitar miembro
app.delete("/api/teams/:id/members/:empId", auth, (req, res) => {
  DB.getDb().prepare("DELETE FROM team_members WHERE team_id=? AND employee_id=?")
    .run(req.params.id, req.params.empId);
  res.json({ ok: true });
});

// GET /api/mobile/my-team — equipo(s) donde el empleado es admin (para app móvil)
app.get("/api/mobile/my-team", (req, res) => {
  const { employee_id } = req.query;
  if (!employee_id) return res.status(400).json({ error: "employee_id requerido" });
  const db2 = DB.getDb();

  const teams = db2.prepare("SELECT id, name, description FROM teams WHERE admin_id=?").all(employee_id);
  if (!teams.length) return res.json([]);

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' });
  const memberQuery = db2.prepare(`
    SELECT e.id, e.employee_number, e.name, e.last_name, e.photo,
           j.name AS job_title,
           (SELECT type FROM check_ins
            WHERE employee_id = e.id AND date(timestamp,'localtime') = ?
            ORDER BY timestamp DESC LIMIT 1) AS last_type,
           (SELECT timestamp FROM check_ins
            WHERE employee_id = e.id AND date(timestamp,'localtime') = ?
            ORDER BY timestamp DESC LIMIT 1) AS last_time
    FROM team_members tm
    JOIN employees e ON e.id = tm.employee_id
    LEFT JOIN job_titles j ON j.id = e.job_title_id
    WHERE tm.team_id = ?
    ORDER BY e.name, e.last_name
  `);
  const result = teams.map(team => ({
    ...team,
    members: memberQuery.all(today, today, team.id),
    date: today,
  }));
  res.json(result);
});

// GET /api/mobile/my-team/history — historial del equipo por fecha
app.get("/api/mobile/my-team/history", (req, res) => {
  const { employee_id, date } = req.query;
  if (!employee_id || !date) return res.status(400).json({ error: "Parámetros requeridos" });
  const db2 = DB.getDb();

  const teams = db2.prepare("SELECT id, name FROM teams WHERE admin_id=?").all(employee_id);
  if (!teams.length) return res.json([]);

  const memberQuery = db2.prepare(`
    SELECT e.id, e.employee_number, e.name, e.last_name, e.photo,
           j.name AS job_title,
           (SELECT type FROM check_ins
            WHERE employee_id = e.id AND date(timestamp,'localtime') = ?
            ORDER BY timestamp DESC LIMIT 1) AS last_type,
           (SELECT timestamp FROM check_ins
            WHERE employee_id = e.id AND date(timestamp,'localtime') = ?
            ORDER BY timestamp DESC LIMIT 1) AS last_time
    FROM team_members tm
    JOIN employees e ON e.id = tm.employee_id
    LEFT JOIN job_titles j ON j.id = e.job_title_id
    WHERE tm.team_id = ?
    ORDER BY e.name, e.last_name
  `);
  const result = teams.map(team => ({
    ...team,
    members: memberQuery.all(date, date, team.id),
    date,
  }));
  res.json(result);
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

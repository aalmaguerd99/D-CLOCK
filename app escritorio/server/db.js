const Database = require("better-sqlite3");
const bcrypt    = require("bcryptjs");
const crypto    = require("crypto");
const path      = require("path");
const fs        = require("fs");

let db = null;

function rndPassword(len = 12) {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(len);
  return Array.from({ length: len }, (_, i) => chars[bytes[i] % chars.length]).join("");
}

function init(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
  db = new Database(path.join(dataDir, "dclock.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token      TEXT PRIMARY KEY,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS departments (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS job_titles (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS areas (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      type          TEXT NOT NULL DEFAULT 'oficina',
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      created_at    TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      name              TEXT NOT NULL,
      type              TEXT NOT NULL DEFAULT 'trabajo',
      color             TEXT NOT NULL DEFAULT 'morning',
      check_in_time     TEXT NOT NULL DEFAULT '09:00',
      check_out_time    TEXT NOT NULL DEFAULT '18:00',
      days              TEXT NOT NULL DEFAULT '["lun","mar","mie","jue","vie"]',
      tolerance_minutes INTEGER DEFAULT 15,
      created_at        TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS geofences (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      name           TEXT NOT NULL,
      latitude       REAL NOT NULL,
      longitude      REAL NOT NULL,
      radius_meters  INTEGER NOT NULL DEFAULT 100,
      active         INTEGER DEFAULT 1,
      created_at     TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS employees (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_number TEXT UNIQUE NOT NULL,
      name            TEXT NOT NULL,
      last_name       TEXT,
      email           TEXT,
      phone           TEXT,
      nss             TEXT,
      curp            TEXT,
      rfc             TEXT,
      gender          TEXT,
      birth_date      TEXT,
      address         TEXT,
      department_id   INTEGER REFERENCES departments(id)  ON DELETE SET NULL,
      area_id         INTEGER REFERENCES areas(id)        ON DELETE SET NULL,
      job_title_id    INTEGER REFERENCES job_titles(id)   ON DELETE SET NULL,
      schedule_id     INTEGER REFERENCES schedules(id)    ON DELETE SET NULL,
      geofence_id     INTEGER REFERENCES geofences(id)    ON DELETE SET NULL,
      pin             TEXT,
      photo           TEXT,
      active          INTEGER DEFAULT 1,
      created_at      TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS schedule_assignments (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      date        TEXT NOT NULL,
      schedule_id INTEGER NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
      created_at  TEXT DEFAULT (datetime('now','localtime')),
      UNIQUE(employee_id, date)
    );

    CREATE TABLE IF NOT EXISTS check_ins (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL REFERENCES employees(id),
      type        TEXT NOT NULL CHECK(type IN ('entrada','salida')),
      timestamp   TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      latitude    REAL,
      longitude   REAL,
      geofence_id INTEGER REFERENCES geofences(id),
      device_id   TEXT,
      on_time     INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS teams (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      description TEXT,
      admin_id    INTEGER REFERENCES employees(id) ON DELETE SET NULL,
      created_at  TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS team_members (
      team_id     INTEGER NOT NULL REFERENCES teams(id)     ON DELETE CASCADE,
      employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      PRIMARY KEY (team_id, employee_id)
    );

    CREATE INDEX IF NOT EXISTS idx_ci_emp    ON check_ins(employee_id);
    CREATE INDEX IF NOT EXISTS idx_ci_time   ON check_ins(timestamp);
    CREATE INDEX IF NOT EXISTS idx_sa_emp    ON schedule_assignments(employee_id);
    CREATE INDEX IF NOT EXISTS idx_sa_date   ON schedule_assignments(date);
    CREATE INDEX IF NOT EXISTS idx_tm_team   ON team_members(team_id);
    CREATE INDEX IF NOT EXISTS idx_tm_emp    ON team_members(employee_id);
  `);

  // Migrations for existing databases (ignore errors if column already exists)
  const migrations = [
    "ALTER TABLE schedules ADD COLUMN type  TEXT NOT NULL DEFAULT 'trabajo'",
    "ALTER TABLE schedules ADD COLUMN color TEXT NOT NULL DEFAULT 'morning'",
    "ALTER TABLE employees ADD COLUMN area_id INTEGER REFERENCES areas(id) ON DELETE SET NULL",
    "ALTER TABLE employees ADD COLUMN photo TEXT",
    "CREATE TABLE IF NOT EXISTS job_titles (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, created_at TEXT DEFAULT (datetime('now','localtime')))",
    "ALTER TABLE employees ADD COLUMN last_name TEXT",
    "ALTER TABLE employees ADD COLUMN rfc TEXT",
    "ALTER TABLE employees ADD COLUMN gender TEXT",
    "ALTER TABLE employees ADD COLUMN birth_date TEXT",
    "ALTER TABLE employees ADD COLUMN address TEXT",
    "ALTER TABLE employees ADD COLUMN job_title_id INTEGER REFERENCES job_titles(id) ON DELETE SET NULL",
    "ALTER TABLE check_ins ADD COLUMN photo TEXT",
    "ALTER TABLE employees ADD COLUMN face_descriptor TEXT DEFAULT NULL",
    "ALTER TABLE employees ADD COLUMN is_admin INTEGER DEFAULT 0",
    "ALTER TABLE check_ins ADD COLUMN face_verified INTEGER DEFAULT NULL",
  ];
  for (const sql of migrations) {
    try { db.exec(sql); } catch {}
  }

  // One-time fix: add +1 hour to check_ins stored with wrong UTC-7 timezone
  const fixApplied = db.prepare("SELECT value FROM config WHERE key='timestamp_fix_v1'").get();
  if (!fixApplied) {
    const count = db.prepare("SELECT COUNT(*) AS n FROM check_ins").get().n;
    if (count > 0) {
      db.prepare("UPDATE check_ins SET timestamp = datetime(timestamp, '+1 hour')").run();
    }
    db.prepare("INSERT OR REPLACE INTO config VALUES ('timestamp_fix_v1','applied')").run();
  }

  // Create admin on first run
  let plain = db.prepare("SELECT value FROM config WHERE key='admin_password'").get()?.value;
  const isFirstRun = !plain;
  if (isFirstRun) {
    plain = rndPassword();
    const hash = bcrypt.hashSync(plain, 10);
    db.prepare("INSERT OR REPLACE INTO config VALUES ('admin_username','admin')").run();
    db.prepare("INSERT OR REPLACE INTO config VALUES ('admin_password_hash',?)").run(hash);
    db.prepare("INSERT OR REPLACE INTO config VALUES ('admin_password',?)").run(plain);
  }

  return { db, adminPassword: plain, isFirstRun };
}

function getDb()  { return db; }

function createSession() {
  const token   = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  db.prepare("INSERT INTO sessions (token, expires_at) VALUES (?,?)").run(token, expires);
  return token;
}

function validateSession(token) {
  if (!token) return false;
  return !!db.prepare("SELECT 1 FROM sessions WHERE token=? AND expires_at>datetime('now')").get(token);
}

function deleteSession(token) {
  db.prepare("DELETE FROM sessions WHERE token=?").run(token);
}

module.exports = { init, getDb, createSession, validateSession, deleteSession };

require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const path    = require("path");
const crypto  = require("crypto");

const app  = express();
const PORT = process.env.PORT || 4000;
const PASS = process.env.PANEL_PASSWORD || "d99tech2024";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ── Simple session auth via header ── */
function auth(req, res, next) {
  const token = req.headers["x-panel-token"];
  if (token !== PASS) return res.status(401).json({ error: "No autorizado" });
  next();
}

/* ── Generate license key: DCXXX-XXXX-XXXX-XXXX ── */
function genKey() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `DC${seg()}-${seg()}-${seg()}-${seg()}`;
}

/* ────────────────────────────────────────────────────
   POST /api/login
   body: { password }
──────────────────────────────────────────────────── */
app.post("/api/login", (req, res) => {
  const { password } = req.body;
  if (password === PASS) return res.json({ ok: true, token: PASS });
  res.status(401).json({ error: "Contraseña incorrecta" });
});

/* ────────────────────────────────────────────────────
   GET /api/licenses
   Returns all licenses with company name
──────────────────────────────────────────────────── */
app.get("/api/licenses", auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        l.id, l.license_key, l.tier, l.max_employees,
        l.status, l.machine_id,
        l.activated_at, l.expires_at, l.created_at,
        c.name AS company_name, c.contact_email
      FROM licenses l
      JOIN companies c ON c.id = l.company_id
      ORDER BY l.created_at DESC
    `);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

/* ────────────────────────────────────────────────────
   POST /api/licenses
   body: { company_name, contact_email?, tier, months }
──────────────────────────────────────────────────── */
app.post("/api/licenses", auth, async (req, res) => {
  const { company_name, contact_email, tier, months } = req.body;

  if (!company_name || !tier) {
    return res.status(400).json({ error: "company_name y tier son requeridos" });
  }
  if (!["50","100","200","500"].includes(String(tier))) {
    return res.status(400).json({ error: "tier debe ser 50, 100, 200 o 500" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Create company
    const compRes = await client.query(
      `INSERT INTO companies (name, contact_email) VALUES ($1, $2) RETURNING id`,
      [company_name.trim(), contact_email?.trim() || null]
    );
    const companyId = compRes.rows[0].id;

    // Generate unique key
    let key, exists = true;
    while (exists) {
      key = genKey();
      const check = await client.query("SELECT id FROM licenses WHERE license_key=$1", [key]);
      exists = check.rows.length > 0;
    }

    const expiresAt = months
      ? new Date(Date.now() + Number(months) * 30 * 24 * 60 * 60 * 1000)
      : null;

    const licRes = await client.query(
      `INSERT INTO licenses (license_key, company_id, tier, max_employees, status, expires_at)
       VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING *`,
      [key, companyId, String(tier), Number(tier), expiresAt]
    );

    await client.query(
      `INSERT INTO license_audit (license_id, action, details)
       VALUES ($1, 'created', $2::jsonb)`,
      [licRes.rows[0].id, JSON.stringify({ created_by: "panel_admin", company: company_name })]
    );

    await client.query("COMMIT");

    res.status(201).json({
      license_key:  key,
      company_name: company_name.trim(),
      tier:         String(tier),
      max_employees: Number(tier),
      expires_at:   expiresAt,
      status:       "pending",
    });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

/* ────────────────────────────────────────────────────
   PATCH /api/licenses/:id/status
   body: { status: 'active'|'suspended'|'expired' }
──────────────────────────────────────────────────── */
app.patch("/api/licenses/:id/status", auth, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["active", "suspended", "expired", "pending"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Status inválido" });
  }
  try {
    await pool.query(
      `UPDATE licenses SET status=$1, updated_at=NOW() WHERE id=$2`,
      [status, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ────────────────────────────────────────────────────
   DELETE /api/licenses/:id
──────────────────────────────────────────────────── */
app.delete("/api/licenses/:id", auth, async (req, res) => {
  try {
    await pool.query("DELETE FROM licenses WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ── Fallback → index.html ── */
app.get("*", (_, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

app.listen(PORT, () => {
  console.log(`\n  D-CLOCK Panel de Licencias`);
  console.log(`  http://localhost:${PORT}\n`);
});

require("dotenv").config();
const express    = require("express");
const { Pool }   = require("pg");
const path       = require("path");
const crypto     = require("crypto");
const nodemailer = require("nodemailer");

const app  = express();
const PORT = process.env.PORT || 4000;
const PASS = process.env.PANEL_PASSWORD || "d99tech2024";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ── Email transporter (optional — skip if EMAIL_PASS not set) ── */
const emailTransporter = process.env.EMAIL_PASS
  ? nodemailer.createTransport({
      host:   process.env.EMAIL_HOST || "smtp.gmail.com",
      port:   Number(process.env.EMAIL_PORT) || 465,
      secure: Number(process.env.EMAIL_PORT) !== 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  : null;

async function sendLicenseEmail({ to, company_name, license_key, tier, expires_at }) {
  if (!emailTransporter || !to) return;
  const expStr = expires_at
    ? new Date(expires_at).toLocaleDateString("es-MX", { year:"numeric", month:"long", day:"numeric" })
    : "Sin fecha de expiración";

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#F5F1EB;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0D0D0C;padding:24px 32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-.5px;">D-CLOCK</td>
                <td style="padding-left:10px;">
                  <span style="background:#2563EB;color:#fff;font-size:10px;font-weight:700;padding:3px 8px;border-radius:99px;letter-spacing:.05em;text-transform:uppercase;">Licencia</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 32px;">
            <p style="margin:0 0 6px;font-size:13px;color:#78786E;text-transform:uppercase;letter-spacing:.08em;font-weight:700;">Hola,</p>
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0D0D0C;letter-spacing:-.5px;">${esc(company_name)}</h1>
            <p style="margin:0 0 28px;font-size:14px;color:#38382F;line-height:1.6;">
              Tu licencia D-CLOCK ha sido generada. Guarda esta clave en un lugar seguro — la necesitarás para activar el software en tu servidor.
            </p>

            <!-- Key box -->
            <div style="background:#EFF6FF;border:1.5px solid rgba(37,99,235,.2);border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
              <p style="margin:0 0 10px;font-size:10px;font-weight:700;color:#2563EB;text-transform:uppercase;letter-spacing:.1em;">Clave de licencia</p>
              <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:22px;font-weight:700;color:#0D0D0C;letter-spacing:.06em;">${license_key}</p>
            </div>

            <!-- Details -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#78786E;">Plan</td>
                <td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:700;color:#0D0D0C;text-align:right;">${tier} empleados</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-size:13px;color:#78786E;">Estado inicial</td>
                <td style="padding:10px 0;border-bottom:1px solid #F3F4F6;font-size:13px;font-weight:700;color:#D97706;text-align:right;">Pendiente de activación</td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:13px;color:#78786E;">Vigencia</td>
                <td style="padding:10px 0;font-size:13px;font-weight:700;color:#0D0D0C;text-align:right;">${expStr}</td>
              </tr>
            </table>

            <p style="margin:0;font-size:13px;color:#78786E;line-height:1.6;">
              Descarga D-CLOCK desde nuestra página web e ingresa esta clave al momento de la instalación para activar tu licencia.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F5F1EB;padding:20px 32px;text-align:center;border-top:1px solid rgba(200,192,178,.4);">
            <p style="margin:0;font-size:11px;color:#AEAEA4;">D-CLOCK · Sistema de Checador Empresarial · D99-TECH</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await emailTransporter.sendMail({
      from:    process.env.EMAIL_FROM || `D-CLOCK <${process.env.EMAIL_USER}>`,
      to,
      subject: `Tu licencia D-CLOCK — ${company_name}`,
      html,
    });
    console.log(`  ✉  Email enviado a ${to}`);
  } catch (e) {
    console.warn(`  ✉  Email no enviado (${to}): ${e.message}`);
  }
}

function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

/* ── Simple session auth via header ── */
function auth(req, res, next) {
  const token = req.headers["x-panel-token"];
  if (token !== PASS) return res.status(401).json({ error: "No autorizado" });
  next();
}

/* ── Ensure wallet_config table exists ── */
pool.query(`
  CREATE TABLE IF NOT EXISTS wallet_config (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`).catch(e => console.warn("wallet_config table:", e.message));

/* ────────────────────────────────────────────────────
   GET /api/wallet/certs
   Autenticado con license_key del cliente.
   Devuelve los certificados de Apple Wallet si la
   licencia está activa. La app escritorio cachea
   el resultado localmente 7 días.
──────────────────────────────────────────────────── */
app.get("/api/wallet/certs", async (req, res) => {
  const licenseKey = req.headers["x-license-key"];
  if (!licenseKey) return res.status(401).json({ error: "license_key requerida" });

  try {
    // Validate license is active
    const { rows } = await pool.query(
      `SELECT l.status, c.name AS company_name
       FROM licenses l JOIN companies c ON c.id = l.company_id
       WHERE l.license_key = $1`,
      [licenseKey.trim().toUpperCase()]
    );
    if (!rows.length) return res.status(404).json({ error: "Licencia no encontrada" });
    if (rows[0].status !== "active") return res.status(403).json({ error: "Licencia no activa" });

    // Fetch certs from wallet_config
    const cfg = await pool.query("SELECT key, value FROM wallet_config");
    const map = Object.fromEntries(cfg.rows.map(r => [r.key, r.value]));

    const required = ["signer_cert_pem", "signer_key_pem", "wwdr_pem"];
    const missing  = required.filter(k => !map[k]);
    if (missing.length) {
      return res.status(503).json({ error: "Certificados no configurados en el servidor" });
    }

    res.json({
      signer_cert_pem: map.signer_cert_pem,
      signer_key_pem:  map.signer_key_pem,
      wwdr_pem:        map.wwdr_pem,
      pass_type_id:    map.pass_type_id || "pass.com.d99tech.dclock",
      team_id:         map.team_id      || "56SBW74WX9",
    });
  } catch (e) {
    console.error("wallet/certs:", e.message);
    res.status(500).json({ error: e.message });
  }
});

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

    // Send email non-blocking — a failure here never rejects the creation
    if (contact_email) {
      sendLicenseEmail({
        to:           contact_email.trim(),
        company_name: company_name.trim(),
        license_key:  key,
        tier:         String(tier),
        expires_at:   expiresAt,
      }).catch(() => {});
    }

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
   PATCH /api/licenses/:id/tier
   body: { tier: '50'|'100'|'200'|'500' }
──────────────────────────────────────────────────── */
app.patch("/api/licenses/:id/tier", auth, async (req, res) => {
  const { tier } = req.body;
  if (!["50","100","200","500"].includes(String(tier))) {
    return res.status(400).json({ error: "Tier inválido" });
  }
  try {
    // Trigger set_max_employees fires automatically on UPDATE, handles max_employees + updated_at
    await pool.query(
      `UPDATE licenses SET tier=$1::license_tier WHERE id=$2`,
      [String(tier), req.params.id]
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

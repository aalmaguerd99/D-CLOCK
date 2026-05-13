import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { license_key, machine_id } = await req.json();

    if (!license_key || !machine_id) {
      return NextResponse.json({ error: "license_key y machine_id son requeridos" }, { status: 400 });
    }

    const key = String(license_key).trim().toUpperCase();
    const mid = String(machine_id).trim();

    const client = await pool.connect();
    try {
      // Find license with company
      const { rows } = await client.query(
        `SELECT l.id, l.license_key, l.status, l.tier, l.max_employees,
                l.machine_id, l.activated_at, l.expires_at,
                c.name AS company_name
         FROM licenses l
         JOIN companies c ON c.id = l.company_id
         WHERE l.license_key = $1`,
        [key]
      );

      if (rows.length === 0) {
        return NextResponse.json({ error: "Licencia no encontrada" }, { status: 404 });
      }

      const lic = rows[0];

      if (lic.status === "suspended") {
        return NextResponse.json({ error: "Licencia suspendida" }, { status: 403 });
      }
      if (lic.status === "expired") {
        return NextResponse.json({ error: "Licencia expirada" }, { status: 403 });
      }

      // Already activated on a different machine
      if (lic.machine_id && lic.machine_id !== mid) {
        return NextResponse.json(
          { error: "Esta licencia ya está activada en otro equipo. Contacta a soporte." },
          { status: 409 }
        );
      }

      // Activate if pending
      if (lic.status === "pending") {
        await client.query(
          `UPDATE licenses
           SET status = 'active', machine_id = $1, activated_at = NOW(), updated_at = NOW()
           WHERE id = $2`,
          [mid, lic.id]
        );

        await client.query(
          `INSERT INTO license_audit (license_id, action, details, ip_address)
           VALUES ($1, 'activated', $2::jsonb, $3)`,
          [
            lic.id,
            JSON.stringify({ machine_id: mid }),
            req.headers.get("x-forwarded-for") ?? "unknown",
          ]
        );
      }

      return NextResponse.json({
        valid: true,
        company_name: lic.company_name,
        tier: lic.tier,
        max_employees: lic.max_employees,
        expires_at: lic.expires_at,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[license/validate]", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

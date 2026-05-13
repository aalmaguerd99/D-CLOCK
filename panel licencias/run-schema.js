require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const sql = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE license_tier AS ENUM ('50','100','200','500');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE license_status AS ENUM ('pending','active','suspended','expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS companies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS licenses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key   VARCHAR(32) UNIQUE NOT NULL,
  company_id    UUID REFERENCES companies(id) ON DELETE CASCADE,
  tier          license_tier NOT NULL,
  max_employees INTEGER NOT NULL,
  status        license_status DEFAULT 'pending',
  machine_id    VARCHAR(128),
  activated_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS license_audit (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES licenses(id) ON DELETE SET NULL,
  action     VARCHAR(50) NOT NULL,
  details    JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_max_employees()
RETURNS TRIGGER AS $fn$
BEGIN
  NEW.max_employees := NEW.tier::TEXT::INTEGER;
  NEW.updated_at    := NOW();
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_max_employees ON licenses;
CREATE TRIGGER trg_set_max_employees
  BEFORE INSERT OR UPDATE ON licenses
  FOR EACH ROW EXECUTE FUNCTION set_max_employees();

CREATE INDEX IF NOT EXISTS idx_licenses_key     ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_status  ON licenses(status);
CREATE INDEX IF NOT EXISTS idx_licenses_company ON licenses(company_id);
`;

async function run() {
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log("✓ Tablas creadas correctamente en Railway PostgreSQL");

    const { rows } = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name"
    );
    console.log("  Tablas:", rows.map(r => r.table_name).join(", "));
  } catch (e) {
    console.error("ERROR:", e.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();

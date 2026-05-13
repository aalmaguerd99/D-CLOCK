-- D-CLOCK License Database Schema
-- Railway PostgreSQL

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- License tiers
CREATE TYPE license_tier AS ENUM ('50', '100', '200', '500');
CREATE TYPE license_status AS ENUM ('pending', 'active', 'suspended', 'expired');

-- Companies (assigned when license is created)
CREATE TABLE companies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Licenses
CREATE TABLE licenses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key    VARCHAR(32) UNIQUE NOT NULL,
  company_id     UUID REFERENCES companies(id) ON DELETE CASCADE,
  tier           license_tier NOT NULL,
  max_employees  INTEGER NOT NULL,
  status         license_status DEFAULT 'pending',
  machine_id     VARCHAR(128),
  activated_at   TIMESTAMPTZ,
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log
CREATE TABLE license_audit (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id   UUID REFERENCES licenses(id) ON DELETE SET NULL,
  action       VARCHAR(50) NOT NULL,
  details      JSONB,
  ip_address   VARCHAR(45),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate license key function
CREATE OR REPLACE FUNCTION generate_license_key()
RETURNS VARCHAR(32) AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  key   TEXT := '';
  i     INT;
BEGIN
  FOR i IN 1..4 LOOP
    key := key || substring(chars FROM (floor(random() * length(chars)) + 1)::INT FOR 1)
                || substring(chars FROM (floor(random() * length(chars)) + 1)::INT FOR 1)
                || substring(chars FROM (floor(random() * length(chars)) + 1)::INT FOR 1)
                || substring(chars FROM (floor(random() * length(chars)) + 1)::INT FOR 1);
    IF i < 4 THEN key := key || '-'; END IF;
  END LOOP;
  RETURN key;
END;
$$ LANGUAGE plpgsql;

-- Auto-set max_employees from tier
CREATE OR REPLACE FUNCTION set_max_employees()
RETURNS TRIGGER AS $$
BEGIN
  NEW.max_employees := NEW.tier::INTEGER;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_max_employees
BEFORE INSERT OR UPDATE ON licenses
FOR EACH ROW EXECUTE FUNCTION set_max_employees();

-- Indexes
CREATE INDEX idx_licenses_key    ON licenses(license_key);
CREATE INDEX idx_licenses_status ON licenses(status);
CREATE INDEX idx_licenses_company ON licenses(company_id);

// Sube los certificados de Apple Wallet a Railway PostgreSQL.
// Ejecutar una sola vez: node upload-wallet-certs.js
const { Pool } = require("pg");
const fs       = require("fs");
const path     = require("path");

const CERTS_DIR = path.join("C:\\Users\\HP Z2 Mini G4\\Desktop\\dclock-wallet-certs");

const pool = new Pool({
  connectionString: "postgresql://postgres:eIOLVjETJIbDIugeNetuhpsQBfPVLKEI@hopper.proxy.rlwy.net:45516/railway",
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS wallet_config (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    const entries = [
      { key: "signer_cert_pem", file: "pass.pem"  },
      { key: "signer_key_pem",  file: "pass.key"  },
      { key: "wwdr_pem",        file: "wwdr.pem"  },
    ];

    for (const { key, file } of entries) {
      const filePath = path.join(CERTS_DIR, file);
      if (!fs.existsSync(filePath)) {
        console.error(`✗ No encontrado: ${filePath}`);
        process.exit(1);
      }
      const value = fs.readFileSync(filePath, "utf8");
      await client.query(
        "INSERT INTO wallet_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
        [key, value]
      );
      console.log(`✓ ${key} subido (${Math.round(value.length / 1024 * 10) / 10} KB)`);
    }

    // Static values
    await client.query(
      "INSERT INTO wallet_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      ["pass_type_id", "pass.com.d99tech.dclock"]
    );
    await client.query(
      "INSERT INTO wallet_config (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
      ["team_id", "56SBW74WX9"]
    );
    console.log("✓ pass_type_id y team_id guardados");

    console.log("\n✅ Certificados subidos a Railway correctamente.");
  } catch (e) {
    console.error("ERROR:", e.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();

// Ejecutar una sola vez para corregir registros con 1 hora de atraso
// Uso: node fix-timestamps.js
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(
  process.env.APPDATA,
  "D-CLOCK",
  "dclock.db"
);

console.log("Base de datos:", dbPath);

const db = new Database(dbPath);

const antes = db.prepare("SELECT COUNT(*) AS n FROM check_ins").get().n;
console.log(`Registros totales: ${antes}`);

// Muestra algunos registros antes del cambio
const muestra = db.prepare("SELECT id, type, timestamp FROM check_ins ORDER BY timestamp DESC LIMIT 5").all();
console.log("\nÚltimos 5 registros ANTES:");
muestra.forEach(r => console.log(`  ID ${r.id} | ${r.type} | ${r.timestamp}`));

// Aplica +1 hora a todos los timestamps
const result = db.prepare("UPDATE check_ins SET timestamp = datetime(timestamp, '+1 hour')").run();
console.log(`\n✅ Se actualizaron ${result.changes} registros (+1 hora)`);

// Verifica el resultado
const muestraPost = db.prepare("SELECT id, type, timestamp FROM check_ins ORDER BY timestamp DESC LIMIT 5").all();
console.log("\nÚltimos 5 registros DESPUÉS:");
muestraPost.forEach(r => console.log(`  ID ${r.id} | ${r.type} | ${r.timestamp}`));

db.close();
console.log("\nListo. Reinicia D-CLOCK para ver los cambios.");

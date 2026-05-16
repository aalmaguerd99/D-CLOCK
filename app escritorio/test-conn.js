const https = require("https");
const body = JSON.stringify({ license_key: "TEST-0000-0000-0000", machine_id: "TEST" });

const req = https.request({
  hostname: "d-clock-production.up.railway.app",
  port: 443,
  path: "/api/license/validate",
  method: "POST",
  headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
}, (res) => {
  let data = "";
  res.on("data", c => data += c);
  res.on("end", () => {
    console.log("✓ Conexión OK");
    console.log("  Status:", res.statusCode);
    console.log("  Body:", data);
  });
});

req.on("error", (e) => {
  console.error("✗ Error:", e.code, e.message);
});

req.write(body);
req.end();

const path = require("path");
const { execFileSync } = require("child_process");

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== "win32") return;

  const rcedit = path.join(__dirname, "node_modules", "rcedit", "bin", "rcedit-x64.exe");
  const exe    = path.join(context.appOutDir, "D-CLOCK.exe");
  const icon   = path.join(__dirname, "assets", "icon.ico");

  try {
    execFileSync(rcedit, [exe, "--set-icon", icon]);
    console.log("  Icon embedded into D-CLOCK.exe");
  } catch (e) {
    console.warn("  Icon embed failed:", e.message);
  }
};

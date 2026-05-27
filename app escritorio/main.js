const {
  app, BrowserWindow, Tray, Menu,
  ipcMain, nativeImage, shell,
} = require("electron");
const path    = require("path");
const fs      = require("fs");
const os      = require("os");
const https   = require("https");
const NatAPI  = require("nat-api");
const server  = require("./server/local");
const config  = require("./config");

// Reliable HTTPS POST using Node built-in (works in packaged Electron)
function httpsPost(url, data) {
  return new Promise((resolve, reject) => {
    const body   = JSON.stringify(data);
    const parsed = new URL(url);
    const opts   = {
      hostname: parsed.hostname,
      port:     parsed.port || 443,
      path:     parsed.pathname + parsed.search,
      method:   "POST",
      headers:  { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    };
    const req = https.request(opts, (res) => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: {} }); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ── Face recognition worker ───────────────────────────
let faceWorkerWin     = null;
const _faceRequests   = new Map();

function createFaceWorker(port) {
  faceWorkerWin = new BrowserWindow({
    show: false, width: 400, height: 300,
    webPreferences: {
      preload: path.join(__dirname, "face-worker-preload.js"),
      contextIsolation: true, nodeIntegration: false,
    },
  });
  faceWorkerWin.loadURL(`http://localhost:${port}/face-worker.html`);
}

ipcMain.on("face-result", (_, { requestId, descriptor }) => {
  const resolve = _faceRequests.get(requestId);
  if (resolve) { _faceRequests.delete(requestId); resolve(descriptor); }
});

global.processFaceImage = (imageBase64) => new Promise((resolve) => {
  if (!faceWorkerWin) return resolve(null);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  _faceRequests.set(id, resolve);
  faceWorkerWin.webContents.send("process-face", { requestId: id, imageBase64 });
  setTimeout(() => { if (_faceRequests.has(id)) { _faceRequests.delete(id); resolve(null); } }, 15000);
});

// ── Network state (populated after server starts) ────
let cachedPublicIP  = null;
let cachedUpnpOk    = false;
let natClient       = null;

async function getPublicIP() {
  return new Promise((resolve) => {
    https.get("https://api.ipify.org?format=json", (res) => {
      let raw = "";
      res.on("data", c => raw += c);
      res.on("end", () => {
        try { resolve(JSON.parse(raw).ip || null); }
        catch { resolve(null); }
      });
    }).on("error", () => resolve(null));
  });
}

async function openUPnPPort() {
  return new Promise((resolve) => {
    try {
      natClient = new NatAPI({ ttl: 0, description: "D-CLOCK Server" });
      natClient.map(config.LOCAL_PORT, config.LOCAL_PORT, (err) => {
        if (err) {
          console.log("  UPnP: no disponible —", err.message);
          resolve(false);
        } else {
          console.log(`  UPnP: puerto ${config.LOCAL_PORT} abierto en el router`);
          resolve(true);
        }
      });
    } catch (e) {
      console.log("  UPnP error:", e.message);
      resolve(false);
    }
  });
}

async function startNetworkServices() {
  const [publicIP, upnpOk] = await Promise.all([getPublicIP(), openUPnPPort()]);
  cachedPublicIP = publicIP;
  cachedUpnpOk   = upnpOk;
  // Push update to renderer if window is open
  mainWindow?.webContents.send("status-update", { publicIP, upnpOk });
}

// ── Machine ID (stable identifier from MAC address) ──
function getMachineId() {
  const nets = os.networkInterfaces();
  for (const ifaces of Object.values(nets)) {
    for (const iface of ifaces) {
      if (!iface.internal && iface.mac && iface.mac !== "00:00:00:00:00:00") {
        return iface.mac.replace(/:/g, "").toUpperCase();
      }
    }
  }
  return os.hostname().replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 16);
}

// ── License file in AppData ───────────────────────────
const licensePath = () => path.join(app.getPath("userData"), "license.json");

function loadLicense() {
  try {
    if (fs.existsSync(licensePath()))
      return JSON.parse(fs.readFileSync(licensePath(), "utf8"));
  } catch {}
  return null;
}

function saveLicense(data) {
  fs.writeFileSync(licensePath(), JSON.stringify(data, null, 2), "utf8");
}

function clearLicense() {
  try { fs.unlinkSync(licensePath()); } catch {}
}

// ── Local IP addresses ────────────────────────────────
function getLocalIPs() {
  const nets = os.networkInterfaces();
  const ips  = [];
  for (const ifaces of Object.values(nets)) {
    for (const iface of ifaces) {
      if (iface.family === "IPv4" && !iface.internal) ips.push(iface.address);
    }
  }
  return ips;
}

// ── Window ────────────────────────────────────────────
let mainWindow = null;
let tray       = null;

const SIZES = {
  activation: { width: 460, height: 640, resizable: false },
  dashboard:  { width: 900, height: 600, resizable: true  },
};

function createWindow(screen = "activation") {
  const { width, height, resizable } = SIZES[screen];

  mainWindow = new BrowserWindow({
    width, height,
    minWidth:  screen === "dashboard" ? 780 : width,
    minHeight: screen === "dashboard" ? 520 : height,
    resizable,
    center:    true,
    show:      false,
    backgroundColor: "#F5F1EB",
    title:     "D-CLOCK",
    icon:      path.join(__dirname, "assets", "icon.png"),
    webPreferences: {
      preload:          path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration:  false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));

  mainWindow.once("ready-to-show", () => mainWindow.show());

  // Minimize to tray instead of closing if license is active
  mainWindow.on("close", (e) => {
    if (tray && loadLicense()) {
      e.preventDefault();
      mainWindow.hide();
      tray.displayBalloon?.({
        title:   "D-CLOCK sigue activo",
        content: `El servidor local sigue corriendo en el puerto ${server.getPort()}.`,
        iconType: "info",
      });
    }
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

function resizeForDashboard() {
  if (!mainWindow) return;
  const { width, height } = SIZES.dashboard;
  mainWindow.setResizable(true);
  mainWindow.setMinimumSize(780, 520);
  mainWindow.setSize(width, height);
  mainWindow.center();
}

function resizeForActivation() {
  if (!mainWindow) return;
  const { width, height } = SIZES.activation;
  mainWindow.setResizable(false);
  mainWindow.setMinimumSize(width, height);
  mainWindow.setSize(width, height);
  mainWindow.center();
}

// ── Tray ──────────────────────────────────────────────
function createTray() {
  const iconPath = path.join(__dirname, "assets", "icon.png");
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  tray = new Tray(icon);
  tray.setToolTip("D-CLOCK — Sistema Checador");
  tray.on("double-click", () => mainWindow?.show());

  const menu = Menu.buildFromTemplate([
    { label: "Mostrar D-CLOCK",  click: () => mainWindow?.show() },
    { label: "Servidor local",   click: () => shell.openExternal(`http://localhost:${server.getPort()}/api/status`) },
    { type:  "separator" },
    { label: "Salir",            click: () => { tray = null; app.quit(); } },
  ]);
  tray.setContextMenu(menu);
}

// ── App lifecycle ─────────────────────────────────────
app.whenReady().then(async () => {
  const license = loadLicense();
  createWindow(license ? "dashboard" : "activation");
  createTray();

  if (license) {
    try {
      server.configure(app.getPath("userData"));
      await server.start();
      createFaceWorker(server.getPort());
      startNetworkServices(); // non-blocking
    } catch (e) { console.error("Server start failed:", e.message); }
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin" && !tray) app.quit();
});

app.on("before-quit", async () => {
  await server.stop();
});

// ── IPC: get saved license ────────────────────────────
ipcMain.handle("get-license", () => loadLicense());

// ── IPC: activate license ─────────────────────────────
ipcMain.handle("activate", async (_, licenseKey) => {
  const machineId = getMachineId();
  const key       = licenseKey.trim().toUpperCase();

  try {
    const { status, body: data } = await httpsPost(
      `${config.API_URL}/api/license/validate`,
      { license_key: key, machine_id: machineId },
    );

    if (status !== 200 || !data.valid) {
      return { ok: false, error: data.error || "Licencia inválida o ya activada en otro equipo." };
    }

    const licenseData = {
      ...data,
      license_key:  key,
      machine_id:   machineId,
      activated_at: new Date().toISOString(),
    };
    saveLicense(licenseData);

    resizeForDashboard();

    try {
      server.configure(app.getPath("userData"));
      await server.start();
      createFaceWorker(server.getPort());
    } catch (e) { console.error("Server:", e.message); }

    return { ok: true, license: licenseData };
  } catch (e) {
    return { ok: false, error: `Error de conexión [${e.code || e.constructor?.name || "?"}]: ${e.message}` };
  }
});

// ── IPC: get local server info ────────────────────────
ipcMain.handle("get-server-info", () => ({
  ips:           getLocalIPs(),
  port:          server.getPort(),
  hostname:      os.hostname(),
  publicIP:      cachedPublicIP,
  upnpOk:        cachedUpnpOk,
  adminPassword: server.getAdminPassword(),
}));

// ── IPC: deactivate ───────────────────────────────────
ipcMain.handle("deactivate", async () => {
  clearLicense();
  await server.stop();
  resizeForActivation();
  return { ok: true };
});

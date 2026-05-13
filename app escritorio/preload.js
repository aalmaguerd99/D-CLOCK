const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("dclock", {
  // Check saved license on startup
  getLicense:    ()    => ipcRenderer.invoke("get-license"),

  // Activate with a key (calls Railway API)
  activate:      (key) => ipcRenderer.invoke("activate", key),

  // Deactivate and return to activation screen
  deactivate:    ()    => ipcRenderer.invoke("deactivate"),

  // Get local server IP + port info
  getServerInfo: ()    => ipcRenderer.invoke("get-server-info"),

  // Listen for server status updates from main process
  onStatus: (cb) => ipcRenderer.on("status-update", (_, data) => cb(data)),
});

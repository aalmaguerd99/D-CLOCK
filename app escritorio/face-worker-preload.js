const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('__fw', {
  sendResult: (data) => ipcRenderer.send('face-result', data),
  onProcess:  (cb)   => ipcRenderer.on('process-face', (_, d) => cb(d)),
});

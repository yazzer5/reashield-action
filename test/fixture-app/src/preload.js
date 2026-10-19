const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("acmeStudio", {
  verifyLicense: (key) => ipcRenderer.invoke("license:verify", key),
  contentAwareFill: (image, mask) => ipcRenderer.invoke("engine:content-aware-fill", image, mask),
});

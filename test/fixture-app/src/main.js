const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { verifyLicense } = require("./license");
const { applyContentAwareFill } = require("./engine/fill");

ipcMain.handle("license:verify", async (_e, key) => verifyLicense(key));
ipcMain.handle("engine:content-aware-fill", async (_e, img, mask) => applyContentAwareFill(img, mask));

app.whenReady().then(() => {
  const win = new BrowserWindow({ webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true } });
  win.loadFile(path.join(__dirname, "index.html"));
});

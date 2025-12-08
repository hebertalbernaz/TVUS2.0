const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { machineIdSync } = require('node-machine-id');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  mainWindow.loadURL('http://localhost:3000');
  
  // Open DevTools in dev mode
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- IPC HANDLERS (Backend do Desktop) ---

// 1. Hardware Fingerprint Handler
ipcMain.handle('get-machine-id', () => {
    // Retorna o ID único da máquina para anti-pirataria
    // Em dev/container pode não funcionar nativamente, então usamos fallback
    try {
        return machineIdSync();
    } catch (e) {
        console.warn("Failed to get machine ID, using fallback", e);
        return "fallback-dev-machine-id";
    }
});

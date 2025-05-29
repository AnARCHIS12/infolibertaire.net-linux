const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Désactiver les messages d'erreur de Chromium
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-gpu');
app.disableHardwareAcceleration();

// Désactiver les avertissements de la console
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    icon: path.join(__dirname, 'info.png'),
    title: 'InfoLibertaire',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      webviewTag: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: true,
      webSecurity: false // Désactive la sécurité web pour permettre executeJavaScript sur webview
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.on('minimize-window', () => {
  win.minimize();
});

ipcMain.on('maximize-window', () => {
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

ipcMain.on('close-window', () => {
  win.close();
});

// Pengatur Tema Ghostty — proses utama.
// Isinya tinggal urusan jendela; semua logika berkas ada di ghostty.cjs.
const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const ghostty = require('./ghostty.cjs')

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 640,
    title: 'Ghostty Theme Changer',
    backgroundColor: '#121419',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
  return win
}

app.whenReady().then(() => {
  app.setName('Ghostty Theme Changer')
  Menu.setApplicationMenu(null) // tidak ada menu File/Edit bawaan — bukan aplikasi dokumen
  ipcMain.handle('themes:list', () => ghostty.collectThemes())
  ipcMain.handle('state:read', () => ghostty.readState())
  ipcMain.handle('theme:apply', (_e, payload) => ghostty.applyTheme(payload))
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

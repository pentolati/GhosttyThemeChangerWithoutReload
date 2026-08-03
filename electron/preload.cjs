const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ghosttyApi', {
  listThemes: () => ipcRenderer.invoke('themes:list'),
  readState: () => ipcRenderer.invoke('state:read'),
  applyTheme: (payload) => ipcRenderer.invoke('theme:apply', payload),
})

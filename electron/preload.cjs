const { contextBridge, ipcRenderer } = require('electron');

const bridge = {
  desktop: true,
  guides: {
    list: () => ipcRenderer.invoke('guides:list'),
    save: (guide, revision) => ipcRenderer.invoke('guides:save', guide, revision),
    delete: guideId => ipcRenderer.invoke('guides:delete', guideId),
  },
  settings: {
    load: () => ipcRenderer.invoke('settings:load'),
    save: value => ipcRenderer.invoke('settings:save', value),
  },
  ollama: {
    discover: () => ipcRenderer.invoke('ollama:discover'),
    inspect: model => ipcRenderer.invoke('ollama:inspect', model),
    generate: request => ipcRenderer.invoke('ollama:generate', request),
    cancel: id => ipcRenderer.invoke('ollama:cancel', id),
  },
  files: {
    importGuide: () => ipcRenderer.invoke('files:import-guide'),
    exportGuide: (guide, format, content) => ipcRenderer.invoke('files:export-guide', guide, format, content),
    exportPdf: (guide, html) => ipcRenderer.invoke('files:export-pdf', guide, html),
  },
  onPrepareClose: callback => {
    const listener = () => Promise.resolve().then(callback)
      .then(result => ipcRenderer.invoke('close:complete', result || { ok: true }))
      .catch(error => ipcRenderer.invoke('close:complete', { ok: false, error: String(error?.message || error) }));
    ipcRenderer.on('close:prepare', listener);
    return () => ipcRenderer.removeListener('close:prepare', listener);
  },
  onCloseFailed: callback => {
    const listener = (_event, message) => callback(message);
    ipcRenderer.on('close:failed', listener);
    return () => ipcRenderer.removeListener('close:failed', listener);
  },
  retryClose: () => ipcRenderer.invoke('close:retry'),
  discardAndQuit: () => ipcRenderer.invoke('close:discard'),
};

contextBridge.exposeInMainWorld('sideMasterDesktop', bridge);

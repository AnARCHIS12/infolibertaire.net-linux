const { contextBridge, clipboard, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  copyToClipboard: (text) => clipboard.writeText(text),
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
  // Gestion des favoris avec une meilleure gestion des erreurs
  getFavorites: () => {
    try {
      const favoritesData = localStorage.getItem('favorites');
      if (!favoritesData) return {};
      const favorites = JSON.parse(favoritesData);
      return typeof favorites === 'object' ? favorites : {};
    } catch (e) {
      console.error('Erreur lors de la lecture des favoris:', e);
      return {};
    }
  },
  setFavorites: (favorites) => {
    try {
      if (typeof favorites !== 'object') throw new Error('Format de favoris invalide');
      localStorage.setItem('favorites', JSON.stringify(favorites));
      return true;
    } catch (e) {
      console.error('Erreur lors de la sauvegarde des favoris:', e);
      return false;
    }
  }
});

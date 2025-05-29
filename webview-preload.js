const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  // Expose getCurrentPage pour obtenir les infos de la page
  window.getCurrentPage = () => {
    return {
      title: document.title,
      url: window.location.href
    };
  };
});

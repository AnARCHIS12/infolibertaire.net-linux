const webview = document.getElementById('webview');
const favoritesSelect = document.getElementById('favorites');

// Ajout : désactiver le bouton Favori tant que le webview n'est pas prêt
const favoriteBtn = document.querySelector('button[onclick="saveFavorite()"]');
if (favoriteBtn) favoriteBtn.disabled = true;

webview.addEventListener('did-finish-load', () => {
  if (favoriteBtn) favoriteBtn.disabled = false;
});

function reloadPage() {
  webview.reload();
  console.log('Page actualisée');
  setTimeout(() => {
    webview.reload();  // Double reload pour s'assurer que le cache est vidé
  }, 100);
}

// Fonction pour afficher la modale de saisie du favori
function showFavoriteModal(defaultName, onSave) {
  const modal = document.getElementById('favorite-modal');
  const input = document.getElementById('favorite-name');
  const okBtn = document.getElementById('favorite-ok');
  const cancelBtn = document.getElementById('favorite-cancel');
  modal.style.display = 'flex';
  input.value = defaultName || '';
  input.focus();

  function cleanup() {
    modal.style.display = 'none';
    okBtn.removeEventListener('click', onOk);
    cancelBtn.removeEventListener('click', onCancel);
    input.removeEventListener('keydown', onKeyDown);
  }
  function onOk() {
    const val = input.value.trim();
    if (val) onSave(val);
    cleanup();
  }
  function onCancel() {
    cleanup();
  }
  function onKeyDown(e) {
    if (e.key === 'Enter') onOk();
    if (e.key === 'Escape') onCancel();
  }
  okBtn.addEventListener('click', onOk);
  cancelBtn.addEventListener('click', onCancel);
  input.addEventListener('keydown', onKeyDown);
}

// Fonction pour sauvegarder un favori
function saveFavorite() {
  try {
    const url = webview.src;
    showFavoriteModal(url, (name) => {
      // Récupération des favoris existants
      const currentFavorites = window.electronAPI.getFavorites() || {};
      
      // Ajout du nouveau favori
      currentFavorites[name] = { url };
      
      // Sauvegarde des favoris mis à jour
      window.electronAPI.setFavorites(currentFavorites);
      
      // Mise à jour de l'interface
      updateFavoritesMenu();
      
      console.log('Favori sauvegardé :', { name, url });
      alert(`✅ Favori "${name}" ajouté avec succès !`);
    });
  } catch (err) {
    console.error('Erreur lors de la sauvegarde:', err);
    alert('❌ Impossible d\'ajouter le favori. Erreur: ' + err.message);
  }
}

// Fonction pour charger un favori
function loadFavorite(value) {
  if (!value) return;
  
  try {
    const favoriteData = JSON.parse(value);
    webview.loadURL(favoriteData.url);
  } catch (err) {
    // Si ce n'est pas du JSON, c'est probablement une URL directe
    if (value) webview.loadURL(value);
  }
}

// Fonction pour partager l'article actuel
function shareArticle() {
  webview.executeJavaScript(`
    const title = document.title;
    const url = window.location.href;
    title + ' - ' + url
  `).then((textToShare) => {
    window.electronAPI.copyToClipboard(textToShare);
    alert("Le titre et le lien ont été copiés dans le presse-papier !");
  });
}

// Fonction pour mettre à jour le menu des favoris
function updateFavoritesMenu() {
  try {
    // Vider le menu des favoris
    while (favoritesSelect.firstChild) {
      favoritesSelect.removeChild(favoritesSelect.firstChild);
    }

    // Ajouter l'option par défaut
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '🔖 Favoris';
    favoritesSelect.appendChild(defaultOption);

    // Récupérer les favoris via l'API electron
    const favorites = window.electronAPI.getFavorites();
    
    // Trier les favoris par nom
    const sortedNames = Object.keys(favorites).sort((a, b) => 
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    // Ajouter chaque favori au menu
    sortedNames.forEach(name => {
      const favorite = favorites[name];
      const option = document.createElement('option');
      option.textContent = name;
      option.value = JSON.stringify(favorite);
      favoritesSelect.appendChild(option);
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du menu des favoris:', err);
  }
}

// Fonction pour minimiser la fenêtre
function minimizeWindow() {
  window.electronAPI.minimize();
}

// Fonction pour maximiser/restaurer la fenêtre
function maximizeWindow() {
  window.electronAPI.maximize();
}

// Fonction pour fermer la fenêtre
function closeWindow() {
  window.electronAPI.close();
}

// Initialisation du menu des favoris
updateFavoritesMenu();

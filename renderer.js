const webview = document.getElementById('webview');
const favoritesSelect = document.getElementById('favorites');

function reloadPage() {
  webview.reload();
  console.log('Page actualisée');
  setTimeout(() => {
    webview.reload();  // Double reload pour s'assurer que le cache est vidé
  }, 100);
}

// Fonction pour sauvegarder un favori
function saveFavorite() {
  try {
    webview.executeJavaScript(`
      {
        title: document.title,
        url: window.location.href,
        date: new Date().toISOString()
      }
    `).then((pageInfo) => {
      const name = prompt("Nom du favori ?", pageInfo.title);
      if (!name) return;

      let favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
      favorites[name] = {
        url: pageInfo.url,
        date: pageInfo.date,
        title: pageInfo.title
      };
      
      localStorage.setItem('favorites', JSON.stringify(favorites));
      updateFavoritesMenu();
      alert(`✅ Favori "${name}" ajouté avec succès !`);
    }).catch(err => {
      console.error('Erreur lors de la récupération des informations de la page:', err);
      alert('❌ Impossible de sauvegarder ce favori. Veuillez réessayer.');
    });
  } catch (err) {
    console.error('Erreur lors de la sauvegarde du favori:', err);
    alert('❌ Une erreur est survenue lors de la sauvegarde du favori.');
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

    // Récupérer et parser les favoris
    let favorites;
    try {
      favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    } catch (e) {
      console.error('Erreur lors de la lecture des favoris:', e);
      localStorage.setItem('favorites', '{}');
      favorites = {};
    }
    
    // Trier les favoris par nom
    const sortedNames = Object.keys(favorites).sort((a, b) => 
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    // Ajouter chaque favori au menu
    sortedNames.forEach(name => {
      try {
        const favorite = favorites[name];
        const option = document.createElement('option');
        option.textContent = name;
        option.value = JSON.stringify(favorite);
        favoritesSelect.appendChild(option);
      } catch (e) {
        console.error(`Erreur lors de l'ajout du favori "${name}":`, e);
      }
    });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du menu des favoris:', err);
    // Ne pas afficher d'alerte pour éviter de bloquer l'interface
    console.warn('❌ Une erreur est survenue lors de la mise à jour des favoris.');
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

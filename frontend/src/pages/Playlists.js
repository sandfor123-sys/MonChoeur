// Playlists Page
async function renderPlaylists() {
  const app = document.getElementById('app');

  if (!auth.isAuthenticated()) {
    app.innerHTML = `
      <div class="auth-required">
        <div class="container">
          <i class="fas fa-lock"></i>
          <h2>Connexion Requise</h2>
          <p>Vous devez être connecté pour accéder à vos playlists</p>
          <button class="btn btn-primary" id="btnLoginRequired">
            <i class="fas fa-sign-in-alt"></i> Se Connecter
          </button>
        </div>
      </div>
    `;

    document.getElementById('btnLoginRequired').addEventListener('click', () => {
      // TODO: Show login modal
      alert('Formulaire de connexion à implémenter');
    });

    return;
  }

  app.innerHTML = `
    <div class="playlists-page">
      <div class="container">
        <div class="page-header">
          <h1><i class="fas fa-list"></i> Mes Playlists</h1>
          <button class="btn btn-primary" id="btnCreatePlaylist">
            <i class="fas fa-plus"></i> Nouvelle Playlist
          </button>
        </div>
        
        <div id="playlistsContainer" class="playlists-grid">
          <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> Chargement de vos playlists...
          </div>
        </div>
      </div>
    </div>
  `;

  // Load playlists
  await loadPlaylists();

  // Add event listener for create button
  document.getElementById('btnCreatePlaylist').addEventListener('click', createPlaylist);
}

// Load user playlists
async function loadPlaylists() {
  const container = document.getElementById('playlistsContainer');

  try {
    // Fetch from real API
    const playlists = await api.playlists.getAll();

    if (playlists.length === 0) {
      container.innerHTML = `
        <div class="no-playlists">
          <i class="fas fa-music"></i>
          <p>Vous n'avez pas encore de playlist</p>
          <button class="btn btn-primary" onclick="createPlaylist()">
            <i class="fas fa-plus"></i> Créer ma Première Playlist
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = playlists.map(playlist => `
      <div class="playlist-card" data-id="${playlist.id}">
        <div class="playlist-header">
          <h3>${playlist.nom}</h3>
          <div class="playlist-actions">
            <button class="btn-icon" onclick="editPlaylist(${playlist.id})" title="Modifier">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon" onclick="deletePlaylist(${playlist.id})" title="Supprimer">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <p class="playlist-description">${playlist.description || 'Aucune description'}</p>
        
        <div class="playlist-meta">
          <span><i class="fas fa-music"></i> ${playlist.chants_count} chant(s)</span>
          <span><i class="fas fa-calendar"></i> ${new Date(playlist.created_at).toLocaleDateString('fr-FR')}</span>
        </div>
        
        <button class="btn btn-outline btn-sm" onclick="viewPlaylist(${playlist.id})">
          <i class="fas fa-eye"></i> Voir les Chants
        </button>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading playlists:', error);
    container.innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle"></i><p>Erreur lors du chargement des playlists</p></div>';
  }
}

// Create new playlist
async function createPlaylist() {
  const nom = prompt('Nom de la playlist:');
  if (!nom) return;

  const description = prompt('Description (optionnel):');

  try {
    await api.playlists.create({ nom, description });
    alert('Playlist créée avec succès !');
    loadPlaylists();
  } catch (error) {
    alert('Erreur lors de la création: ' + error.message);
  }
}

// Edit playlist
function editPlaylist(playlistId) {
  console.log('Edit playlist:', playlistId);
  alert('Fonctionnalité à implémenter: Modification de playlist');
}

// Delete playlist
async function deletePlaylist(playlistId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette playlist ?')) {
    return;
  }

  try {
    await api.playlists.delete(playlistId);
    alert('Playlist supprimée');
    loadPlaylists();
  } catch (error) {
    console.error('Error deleting playlist:', error);
    alert('Erreur lors de la suppression: ' + error.message);
  }
}

// View playlist details
function viewPlaylist(playlistId) {
  router.navigate(`#playlist/${playlistId}`);
}

// Export functions
window.createPlaylist = createPlaylist;
window.editPlaylist = editPlaylist;
window.deletePlaylist = deletePlaylist;
window.viewPlaylist = viewPlaylist;

// Register route
router.register('playlists', renderPlaylists);

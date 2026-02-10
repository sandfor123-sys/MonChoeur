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
      toast.info('Formulaire de connexion à implémenter');
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
    toast.success('Playlist créée avec succès !');
    loadPlaylists();
  } catch (error) {
    toast.error('Erreur lors de la création: ' + error.message);
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
    toast.success('Playlist supprimée');
    loadPlaylists();
  } catch (error) {
    console.error('Error deleting playlist:', error);
    toast.error('Erreur lors de la suppression: ' + error.message);
  }
}

// View playlist details
async function renderPlaylistDetail(playlistId) {
  const app = document.getElementById('app');

  if (!playlistId) {
    router.navigate('#playlists');
    return;
  }

  app.innerHTML = '<div class="container"><div class="loading"><i class="fas fa-spinner fa-spin"></i> Chargement de la playlist...</div></div>';

  try {
    const playlist = await api.playlists.getById(playlistId);

    app.innerHTML = `
      <div class="playlist-detail-page">
        <div class="container">
          <div class="page-header d-flex justify-between align-center">
            <div>
              <button class="btn btn-sm btn-outline mb-3" onclick="router.navigate('#playlists')">
                <i class="fas fa-arrow-left"></i> Retour aux playlists
              </button>
              <h1><i class="fas fa-list"></i> ${playlist.nom}</h1>
              <p>${playlist.description || 'Aucune description'}</p>
            </div>
            <div class="playlist-detail-actions">
              <button class="btn btn-outline" onclick="showEditPlaylistModal(${playlist.id})">
                <i class="fas fa-edit"></i> Modifier
              </button>
            </div>
          </div>

          <div id="playlistChantsContainer" class="chants-grid">
            ${playlist.chants && playlist.chants.length > 0 ?
        playlist.chants.map(chant => `
                <div class="chant-card" data-id="${chant.id}">
                  <div class="chant-card-header">
                    <h3 class="chant-title">${chant.titre}</h3>
                    <span class="chant-category">${chant.categorie}</span>
                  </div>
                  <div class="chant-card-body">
                    <p class="chant-composer"><i class="fas fa-user"></i> ${chant.compositeur || 'Anonyme'}</p>
                    <div class="chant-meta font-sm">
                      <span>Ajouté le ${new Date(chant.added_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <div class="chant-card-footer">
                    <button class="btn btn-sm btn-primary" onclick="playChant(${chant.id})">
                      <i class="fas fa-play"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="viewChant(${chant.id})">
                      Détails
                    </button>
                    <button class="btn btn-sm btn-danger btn-icon" onclick="removeChantFromPlaylist(${playlist.id}, ${chant.id})" title="Retirer de la playlist">
                      <i class="fas fa-minus"></i>
                    </button>
                  </div>
                </div>
              `).join('') :
        '<p class="text-center w-100">Aucun chant dans cette playlist. <a href="#catalogue">Parcourir le catalogue</a> pour en ajouter.</p>'
      }
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading playlist detail:', error);
    app.innerHTML = '<div class="container"><div class="error">Erreur lors du chargement de la playlist.</div></div>';
  }
}

// Show edit playlist modal
async function showEditPlaylistModal(id) {
  try {
    const playlist = await api.playlists.getById(id);
    const newNom = prompt('Nouveau nom:', playlist.nom);
    if (newNom === null) return;

    const newDesc = prompt('Nouvelle description:', playlist.description || '');
    if (newDesc === null) return;

    await api.playlists.update(id, { nom: newNom, description: newDesc, is_public: playlist.is_public });
    toast.success('Playlist mise à jour !');
    renderPlaylistDetail(id);
  } catch (error) {
    toast.error('Erreur: ' + error.message);
  }
}

// Remove chant from playlist
async function removeChantFromPlaylist(playlistId, chantId) {
  if (!confirm('Voulez-vous retirer ce chant de la playlist ?')) return;

  try {
    await api.playlists.removeChant(playlistId, chantId);
    toast.success('Chant retiré');
    renderPlaylistDetail(playlistId);
  } catch (error) {
    toast.error('Erreur: ' + error.message);
  }
}

// Global scope
window.showEditPlaylistModal = showEditPlaylistModal;
window.removeChantFromPlaylist = removeChantFromPlaylist;

// Register routes
router.register('playlists', renderPlaylists);
router.register('playlist', renderPlaylistDetail);

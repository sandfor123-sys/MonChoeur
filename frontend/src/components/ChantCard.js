// ChantCard Component
function createChantCard(chant) {
  return `
    <div class="chant-card" data-id="${chant.id}">
      <div class="chant-card-header">
        <h3 class="chant-title">${chant.titre}</h3>
        <span class="chant-category">${chant.categorie}</span>
      </div>
      
      <div class="chant-card-body">
        ${chant.compositeur ? `<p class="chant-composer"><i class="fas fa-user"></i> ${chant.compositeur}</p>` : ''}
        ${chant.description ? `<p class="chant-description">${chant.description.substring(0, 100)}...</p>` : ''}
        
        <div class="chant-meta">
          <span class="chant-difficulty difficulty-${chant.difficulte}">
            <i class="fas fa-signal"></i> ${chant.difficulte}
          </span>
          ${chant.temps_liturgique ? `<span class="chant-season"><i class="fas fa-calendar"></i> ${chant.temps_liturgique}</span>` : ''}
        </div>
      </div>
      
      <div class="chant-card-footer">
        <button class="btn btn-sm btn-primary" onclick="playChant(${chant.id})">
          <i class="fas fa-play"></i> Écouter
        </button>
        <button class="btn btn-sm btn-outline" onclick="viewChant(${chant.id})">
          <i class="fas fa-eye"></i> Détails
        </button>
        <button class="btn btn-sm btn-icon" onclick="addToPlaylist(${chant.id})" title="Ajouter à une playlist">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </div>
  `;
}

// Play chant
async function playChant(chantId) {
  try {
    const chant = await api.chants.getById(chantId);
    if (window.audioPlayer) {
      window.audioPlayer.play(chant);
    } else {
      console.error('AudioPlayer not initialized');
    }
  } catch (error) {
    console.error('Error playing chant:', error);
    alert('Erreur lors de la lecture du chant');
  }
}

// View chant details
function viewChant(chantId) {
  router.navigate(`#chant/${chantId}`);
}

// Add to playlist
async function addToPlaylist(chantId) {
  if (!auth.isAuthenticated()) {
    toast.warning('Veuillez vous connecter pour ajouter des chants à vos playlists');
    return;
  }

  const modal = document.getElementById('playlistModal');
  const body = document.getElementById('playlistModalBody');

  modal.style.display = 'block';
  body.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Chargement de vos playlists...</div>';

  // Store chantId for the modal functions
  modal.dataset.chantId = chantId;

  try {
    const playlists = await api.playlists.getAll();

    if (playlists.length === 0) {
      body.innerHTML = '<p class="text-center">Vous n\'avez pas encore de playlist.</p>';
    } else {
      body.innerHTML = `
        <ul class="playlist-selection-list">
          ${playlists.map(p => `
            <li onclick="addChantToPlaylist(${p.id}, ${chantId})">
              <i class="fas fa-list"></i> ${p.nom}
              <span class="count">${p.chants_count} chants</span>
            </li>
          `).join('')}
        </ul>
      `;
    }
  } catch (error) {
    console.error('Error loading playlists for modal:', error);
    body.innerHTML = '<p class="error">Erreur lors du chargement des playlists.</p>';
  }
}

// Close playlist modal
function closePlaylistModal() {
  document.getElementById('playlistModal').style.display = 'none';
}

// Add chant to specific playlist
async function addChantToPlaylist(playlistId, chantId) {
  try {
    await api.playlists.addChant(playlistId, chantId);
    toast.success('Chant ajouté à la playlist !');
    closePlaylistModal();
  } catch (error) {
    if (error.message.includes('Duplicate')) {
      toast.warning('Ce chant est déjà dans cette playlist');
    } else {
      toast.error('Erreur lors de l\'ajout: ' + error.message);
    }
  }
}

// Create new playlist from modal
async function createNewPlaylistFromModal() {
  const nom = prompt('Nom de la nouvelle playlist:');
  if (!nom) return;

  try {
    const newPlaylist = await api.playlists.create({ nom });
    const chantId = document.getElementById('playlistModal').dataset.chantId;
    await addChantToPlaylist(newPlaylist.id, chantId);
  } catch (error) {
    alert('Erreur: ' + error.message);
  }
}

// Global scope
window.closePlaylistModal = closePlaylistModal;
window.addChantToPlaylist = addChantToPlaylist;
window.createNewPlaylistFromModal = createNewPlaylistFromModal;

// Export
window.createChantCard = createChantCard;
window.playChant = playChant;
window.viewChant = viewChant;
window.addToPlaylist = addToPlaylist;

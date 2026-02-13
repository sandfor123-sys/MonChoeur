// ChantCard Component
function createChantCard(chant) {
  return `
    <div class="chant-card glass glow-hover" data-id="${chant.id}">
      <div class="chant-card-header">
        <span class="chant-category-pill">${chant.categorie}</span>
        <h3 class="chant-title">${chant.titre}</h3>
      </div>
      
      <div class="chant-card-body">
        <div class="chant-info-minimal">
          ${chant.compositeur ? `<span class="chant-composer-mini"><i class="fas fa-feather-alt"></i> ${chant.compositeur}</span>` : ''}
          <span class="chant-difficulty-dot difficulty-${chant.difficulte}" title="Difficulté: ${chant.difficulte}"></span>
        </div>
        
        <p class="chant-description-v2">${chant.description ? chant.description.substring(0, 80) + '...' : 'Aucune description disponible.'}</p>
        
        <div class="chant-voices-v2">
          <div class="voice-indicator ${chant.audio_soprano ? 'active' : ''}">S</div>
          <div class="voice-indicator ${chant.audio_alto ? 'active' : ''}">A</div>
          <div class="voice-indicator ${chant.audio_tenor ? 'active' : ''}">T</div>
          <div class="voice-indicator ${chant.audio_basse ? 'active' : ''}">B</div>
          ${chant.partition ? `<div class="voice-indicator active pdf" title="Partition"><i class="fas fa-file-pdf"></i></div>` : ''}
        </div>
      </div>
      
      <div class="chant-card-footer-v2">
        <button class="btn btn-primary btn-sm" onclick="playChant(${chant.id})">
          <i class="fas fa-play"></i> Écouter
        </button>
        <button class="btn btn-ghost btn-sm" onclick="viewChant(${chant.id})" title="Détails">
          <i class="fas fa-info-circle"></i>
        </button>
        <button class="btn btn-ghost btn-sm" onclick="addToPlaylist(${chant.id})" title="Playlists">
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

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
        // TODO: Implement audio player
        console.log('Playing chant:', chant);
        alert(`Lecture de: ${chant.titre}\n(Lecteur audio à implémenter)`);
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
        alert('Veuillez vous connecter pour ajouter des chants à vos playlists');
        return;
    }

    // TODO: Implement playlist selection modal
    console.log('Add to playlist:', chantId);
    alert('Fonctionnalité à implémenter: Sélection de playlist');
}

// Export
window.createChantCard = createChantCard;
window.playChant = playChant;
window.viewChant = viewChant;
window.addToPlaylist = addToPlaylist;

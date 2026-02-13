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
          <div class="d-flex gap-sm">
            <button class="btn btn-outline" id="btnSmartPlaylist">
              <i class="fas fa-magic"></i> Proposition de Messe
            </button>
            <button class="btn btn-primary" id="btnCreatePlaylist">
              <i class="fas fa-plus"></i> Nouvelle Playlist
            </button>
          </div>
        </div>
        
        <div id="smartPlaylistContainer" class="mb-4" style="display: none;"></div>
        
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

  // Add event listeners
  document.getElementById('btnCreatePlaylist').addEventListener('click', createPlaylist);
  document.getElementById('btnSmartPlaylist').addEventListener('click', toggleSmartPlaylist);
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
          
          <div class="playlist-footer-actions mt-4 text-center">
            <button class="btn btn-glass" onclick="sharePlaylist(${playlist.id})">
              <i class="fas fa-share-alt"></i> Partager la feuille de chant
            </button>
          </div>
        </div>
      </div>

      <!-- Share Modal -->
      <div id="shareModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Feuille de Chant</h2>
            <span class="close-modal" onclick="closeModal('shareModal')">&times;</span>
          </div>
          <div class="form-group">
            <textarea id="shareText" class="form-control" rows="15" readonly></textarea>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" onclick="copyShareText()">
              <i class="fas fa-copy"></i> Copier le texte
            </button>
            <button class="btn btn-outline" onclick="closeModal('shareModal')">Fermer</button>
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

// Smart Playlist Wizard Logic
let smartPlaylistVisible = false;
let wizardSteps = ['entree', 'kyrie', 'gloria', 'psaume', 'alleluia', 'sanctus', 'agnus', 'communion', 'envoi'];
let currentWizardStep = 0;
let wizardSelection = {};
let wizardChantsData = [];

async function toggleSmartPlaylist() {
  const container = document.getElementById('smartPlaylistContainer');
  smartPlaylistVisible = !smartPlaylistVisible;

  if (!smartPlaylistVisible) {
    container.style.display = 'none';
    return;
  }

  // Reset wizard
  currentWizardStep = 0;
  wizardSelection = {};

  try {
    const allChants = await api.chants.getAll();
    wizardChantsData = allChants;
    renderWizardStep();
    container.style.display = 'block';
  } catch (error) {
    toast.error('Erreur lors du chargement des chants');
  }
}

function renderWizardStep() {
  const container = document.getElementById('smartPlaylistContainer');
  const cat = wizardSteps[currentWizardStep];
  const candidates = wizardChantsData.filter(c => c.categorie === cat);

  const catLabels = {
    entree: 'Chant d\'Entrée',
    kyrie: 'Kyrie / Pitié',
    gloria: 'Gloria',
    psaume: 'Psaume',
    alleluia: 'Alléluia',
    sanctus: 'Sanctus',
    agnus: 'Agnus Dei',
    communion: 'Communion',
    envoi: 'Chant d\'Envoi'
  };

  container.innerHTML = `
    <div class="glass p-lg animate-fade-in">
      <div class="d-flex justify-between align-center mb-4">
        <h3><i class="fas fa-magic"></i> Préparation de la Messe</h3>
        <button class="btn-icon" onclick="toggleSmartPlaylist()"><i class="fas fa-times"></i></button>
      </div>
      
      <div class="wizard-step">
        <h4 class="mb-3">Choisir pour : <strong>${catLabels[cat]}</strong></h4>
        
        <div class="form-group mb-3">
          <input type="text" id="wizardCustomInput" class="form-control" placeholder="Taper le nom du chant si non répertorié..." value="${wizardSelection[cat]?.isCustom ? wizardSelection[cat].titre : ''}">
        </div>

        <div class="wizard-candidates-grid mb-4">
          ${candidates.length > 0 ? candidates.map(c => `
            <div class="wizard-candidate-card ${wizardSelection[cat]?.id === c.id ? 'active' : ''}" onclick="selectWizardChant(${c.id})">
              <div class="d-flex justify-between">
                <strong>${c.titre}</strong>
                ${wizardSelection[cat]?.id === c.id ? '<i class="fas fa-check-circle text-primary"></i>' : ''}
              </div>
              <p class="text-sm text-muted">${c.compositeur || 'Anonyme'}</p>
            </div>
          `).join('') : '<p class="text-center py-4 bg-light rounded">Aucun chant trouvé dans cette catégorie.</p>'}
        </div>
        
        <div class="wizard-actions d-flex justify-between">
          <button class="btn btn-outline" onclick="wizardPrevStep()" ${currentWizardStep === 0 ? 'disabled' : ''}>
            Précédent
          </button>
          <div class="d-flex gap-sm">
            <span class="badge badge-info d-flex align-items-center">${currentWizardStep + 1} / ${wizardSteps.length}</span>
            <button class="btn btn-primary" onclick="wizardNextStep()">
              ${currentWizardStep === wizardSteps.length - 1 ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Listen for custom input
  document.getElementById('wizardCustomInput').addEventListener('input', (e) => {
    const text = e.target.value;
    if (text.trim()) {
      wizardSelection[cat] = { isCustom: true, titre: text };
    } else if (wizardSelection[cat]?.isCustom) {
      delete wizardSelection[cat];
    }
  });
}

window.selectWizardChant = (id) => {
  const cat = wizardSteps[currentWizardStep];
  if (wizardSelection[cat]?.id === id) {
    delete wizardSelection[cat];
  } else {
    const chant = wizardChantsData.find(c => c.id === id);
    wizardSelection[cat] = chant;
  }
  renderWizardStep();
};

window.wizardNextStep = () => {
  if (currentWizardStep < wizardSteps.length - 1) {
    currentWizardStep++;
    renderWizardStep();
  } else {
    finishWizard();
  }
};

window.wizardPrevStep = () => {
  if (currentWizardStep > 0) {
    currentWizardStep--;
    renderWizardStep();
  }
};

window.wizardSkipStep = () => {
  const cat = wizardSteps[currentWizardStep];
  delete wizardSelection[cat];
  window.wizardNextStep();
};

async function finishWizard() {
  const hasSelection = Object.keys(wizardSelection).length > 0;
  if (!hasSelection) {
    toast.info('Aucun chant sélectionné.');
    return;
  }

  const name = prompt('Nom de la playlist de messe :', 'Messe du ' + new Date().toLocaleDateString());
  if (!name) return;

  const customChants = Object.entries(wizardSelection)
    .filter(([cat, data]) => data.isCustom)
    .map(([cat, data]) => `${cat.toUpperCase()}: ${data.titre}`);

  const description = customChants.length > 0
    ? 'Messe guidée avec chants personnalisés : ' + customChants.join(', ')
    : 'Proposition de messe guidée';

  try {
    const playlist = await api.playlists.create({
      nom: name,
      description: description
    });

    // Add only real chants to the DB
    for (const cat of wizardSteps) {
      if (wizardSelection[cat] && !wizardSelection[cat].isCustom && wizardSelection[cat].id) {
        await api.playlists.addChant(playlist.id, wizardSelection[cat].id);
      }
    }
    toast.success('Playlist de messe créée !');
    loadPlaylists();
    document.getElementById('smartPlaylistContainer').style.display = 'none';
    smartPlaylistVisible = false;
  } catch (error) {
    toast.error('Erreur : Erreur lors de l\'ajout du chant');
    console.error('Wizard error:', error);
  }
}

// Sharing Logic
async function sharePlaylist(id) {
  try {
    const playlist = await api.playlists.getById(id);
    const textarea = document.getElementById('shareText');
    const modal = document.getElementById('shareModal');

    // Priority order for liturgical parts
    const order = ['entree', 'kyrie', 'gloria', 'psaume', 'alleluia', 'sanctus', 'agnus', 'communion', 'envoi', 'autre'];

    let text = `FEUILLE DE CHANT : ${playlist.nom.toUpperCase()}\n`;
    text += `Description : ${playlist.description || '-'}\n`;
    text += `Date générée : ${new Date().toLocaleDateString()}\n`;
    text += `------------------------------------------\n\n`;

    if (playlist.chants && playlist.chants.length > 0) {
      // Sort chants by liturgical order
      const sortedChants = [...playlist.chants].sort((a, b) => {
        return order.indexOf(a.categorie) - order.indexOf(b.categorie);
      });

      sortedChants.forEach((chant, index) => {
        text += `${index + 1}. [${chant.categorie.toUpperCase()}] ${chant.titre}\n`;
        text += `   Auteur/Compositeur : ${chant.compositeur || 'Anonyme'}\n`;
        if (chant.paroles) {
          text += `   Paroles :\n${chant.paroles.substring(0, 150)}...\n`;
        }
        text += `\n`;
      });
    } else {
      text += `Aucun chant dans cette liste.\n`;
    }

    text += `\n------------------------------------------\n`;
    text += `Retrouvez les versions audio sur MonChoeur App.`;

    textarea.value = text;
    modal.style.display = 'block';
  } catch (error) {
    toast.error('Erreur lors du partage: ' + error.message);
  }
}

function copyShareText() {
  const textarea = document.getElementById('shareText');
  textarea.select();
  document.execCommand('copy');
  toast.success('Texte copié dans le presse-papier !');
}

// Global scope
window.viewPlaylist = (id) => router.navigate('#playlist/' + id);
window.viewChant = (id) => router.navigate('#chant/' + id);
window.playChant = async (id) => {
  const chant = await api.chants.getById(id);
  if (window.audioPlayer) window.audioPlayer.play(chant);
};
window.sharePlaylist = sharePlaylist;
window.copyShareText = copyShareText;
window.saveAsPlaylist = saveAsPlaylist;
window.toggleSmartPlaylist = toggleSmartPlaylist;

// Helper function to close modal (if not defined elsewhere)
if (!window.closeModal) {
  window.closeModal = (id) => {
    document.getElementById(id).style.display = 'none';
  };
}

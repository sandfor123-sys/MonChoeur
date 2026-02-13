// Admin Page
async function renderAdmin() {
  if (!auth.isAuthenticated() || !auth.isAdmin()) {
    toast.error('Accès refusé. Cette page est réservée aux administrateurs.');
    router.navigate('#accueil');
    return;
  }

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="admin-page">
      <div class="container">
        <div class="page-header d-flex justify-between align-center">
          <div>
            <h1><i class="fas fa-user-shield"></i> Administration</h1>
            <p>Gérez le catalogue des chants</p>
          </div>
          <div class="d-flex gap-sm">
            <button class="btn btn-outline" id="btnManageUsers">
              <i class="fas fa-users-cog"></i> Utilisateurs
            </button>
            <button class="btn btn-primary" id="btnNewChant">
              <i class="fas fa-plus"></i> Nouveau Chant
            </button>
          </div>
        </div>

        <div id="adminStats" class="admin-stats-grid mb-4">
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-music"></i></div>
            <div class="stat-info">
              <span class="stat-value" id="statTotalChants">-</span>
              <span class="stat-label">Total Chants</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon text-success"><i class="fas fa-check-circle"></i></div>
            <div class="stat-info">
              <span class="stat-value" id="statCompleteChants">-</span>
              <span class="stat-label">Complets (SATB)</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon text-warning"><i class="fas fa-exclamation-triangle"></i></div>
            <div class="stat-info">
              <span class="stat-value" id="statMissingChants">-</span>
              <span class="stat-label">Voix manquantes</span>
            </div>
          </div>
        </div>

        <div class="admin-controls mb-4">
          <div class="search-filter-bar">
            <div class="search-input">
              <i class="fas fa-search"></i>
              <input type="text" id="adminSearchInput" placeholder="Rechercher un chant...">
            </div>
            <div class="filter-select">
              <select id="adminCategoryFilter">
                <option value="all">Toutes les catégories</option>
                <option value="entree">Entrée</option>
                <option value="kyrie">Kyrie</option>
                <option value="gloria">Gloria</option>
                <option value="psaume">Psaume</option>
                <option value="alleluia">Alléluia</option>
                <option value="priere_universelle">Prière Universelle</option>
                <option value="offertoire">Offertoire</option>
                <option value="sanctus">Sanctus</option>
                <option value="agnus">Agnus Dei</option>
                <option value="communion">Communion</option>
                <option value="envoi">Envoi</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>
        </div>

        <div id="adminChantsContainer" class="admin-table-container">
          <div class="loading"><i class="fas fa-spinner fa-spin"></i> Chargement des chants...</div>
        </div>
      </div>
    </div>

    <!-- Modal for Add/Edit Chant -->
    <div id="chantModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="modalTitle">Ajouter un Chant</h2>
          <span class="close-modal">&times;</span>
        </div>
        <form id="chantForm">
          <input type="hidden" id="chantId">
          <div class="form-grid">
            <div class="form-group">
              <label for="titre">Titre *</label>
              <input type="text" id="titre" name="titre" required>
            </div>
            <div class="form-group">
              <label for="compositeur">Compositeur</label>
              <input type="text" id="compositeur" name="compositeur">
            </div>
            <div class="form-group">
              <label for="parolier">Parolier</label>
              <input type="text" id="parolier" name="parolier">
            </div>
            <div class="form-group">
              <label for="categorie">Catégorie *</label>
              <select id="categorie" name="categorie" required>
                <option value="entree">Entrée</option>
                <option value="kyrie">Kyrie</option>
                <option value="gloria">Gloria</option>
                <option value="psaume">Psaume</option>
                <option value="alleluia">Alléluia</option>
                <option value="priere_universelle">Prière Universelle</option>
                <option value="offertoire">Offertoire</option>
                <option value="sanctus">Sanctus</option>
                <option value="agnus">Agnus Dei</option>
                <option value="communion">Communion</option>
                <option value="envoi">Envoi</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div class="form-group">
              <label for="temps_liturgique">Temps Liturgique</label>
              <select id="temps_liturgique" name="temps_liturgique">
                <option value="avent">Avent</option>
                <option value="noel">Noël</option>
                <option value="careme">Carême</option>
                <option value="paques">Pâques</option>
                <option value="pentecote">Pentecôte</option>
                <option value="ordinaire" selected>Temps Ordinaire</option>
                <option value="tous">Tous les temps</option>
              </select>
            </div>
            <div class="form-group">
              <label for="difficulte">Difficulté</label>
              <select id="difficulte" name="difficulte">
                <option value="facile">Facile</option>
                <option value="moyen" selected>Moyen</option>
                <option value="difficile">Difficile</option>
              </select>
            </div>
          </div>
          
          <div class="form-group">
            <label for="paroles">Paroles</label>
            <textarea id="paroles" name="paroles" rows="5"></textarea>
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" name="description" rows="3"></textarea>
          </div>

          <div class="form-section mt-4">
            <label>Fichiers Audio (S, A, T, B)</label>
            <div class="form-grid">
              <div class="form-group">
                <label>Complet</label>
                <div class="drop-zone" id="drop-audio_complet">
                  <p><i class="fas fa-cloud-upload-alt"></i> Glisser ou cliquer</p>
                  <input type="file" id="audio_complet" name="audio_complet" accept="audio/*" onchange="handleFileSelect(this, 'preview-audio_complet')">
                </div>
                <div id="preview-audio_complet" class="preview-container"></div>
              </div>
              <div class="form-group">
                <label>Soprano</label>
                <div class="drop-zone" id="drop-audio_soprano">
                   <p>S</p>
                   <input type="file" id="audio_soprano" name="audio_soprano" accept="audio/*" onchange="handleFileSelect(this, 'preview-audio_soprano')">
                </div>
                <div id="preview-audio_soprano" class="preview-container"></div>
              </div>
              <div class="form-group">
                <label>Alto</label>
                <div class="drop-zone" id="drop-audio_alto">
                   <p>A</p>
                   <input type="file" id="audio_alto" name="audio_alto" accept="audio/*" onchange="handleFileSelect(this, 'preview-audio_alto')">
                </div>
                <div id="preview-audio_alto" class="preview-container"></div>
              </div>
              <div class="form-group">
                <label>Ténor</label>
                <div class="drop-zone" id="drop-audio_tenor">
                   <p>T</p>
                   <input type="file" id="audio_tenor" name="audio_tenor" accept="audio/*" onchange="handleFileSelect(this, 'preview-audio_tenor')">
                </div>
                <div id="preview-audio_tenor" class="preview-container"></div>
              </div>
              <div class="form-group">
                <label>Basse</label>
                <div class="drop-zone" id="drop-audio_basse">
                   <p>B</p>
                   <input type="file" id="audio_basse" name="audio_basse" accept="audio/*" onchange="handleFileSelect(this, 'preview-audio_basse')">
                </div>
                <div id="preview-audio_basse" class="preview-container"></div>
              </div>
              <div class="form-group">
                <label>Partition (PDF)</label>
                <div class="drop-zone" id="drop-partition">
                    <p><i class="fas fa-file-pdf"></i> PDF</p>
                    <input type="file" id="partition" name="partition" accept=".pdf" onchange="handleFileSelect(this, 'preview-partition')">
                </div>
                <div id="preview-partition" class="preview-container"></div>
              </div>
            </div>
            
            <div id="mediaStatus" class="mt-2 text-sm text-muted"></div>
            
            <!-- Progress Bar -->
            <div id="uploadProgress" class="mt-2" style="display: none;">
                <label>Progression de l'envoi:</label>
                <div class="progress-bar">
                    <div class="progress-fill" id="uploadProgressBar" style="width: 0%"></div>
                </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline close-modal">Annuler</button>
            <button type="submit" class="btn btn-primary" id="btnSaveChant">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Event Listeners for search and filters
  const searchInput = document.getElementById('adminSearchInput');
  const categoryFilter = document.getElementById('adminCategoryFilter');

  const updateFilters = () => {
    loadAdminChants(searchInput.value, categoryFilter.value);
  };

  searchInput.addEventListener('input', updateFilters);
  categoryFilter.addEventListener('change', updateFilters);

  document.getElementById('btnManageUsers').addEventListener('click', () => router.navigate('#admin-users'));
  document.getElementById('btnNewChant').addEventListener('click', () => showChantModal());
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('chantModal').style.display = 'none';
    });
  });

  document.getElementById('chantForm').addEventListener('submit', handleChantSubmit);

  // Initial load
  loadAdminChants();
}

async function loadAdminChants(search = '', category = 'all') {
  const container = document.getElementById('adminChantsContainer');
  try {
    const filters = {};
    if (search) filters.search = search;
    if (category !== 'all') filters.categorie = category;

    const chants = await api.chants.getAll(filters);

    // Update Stats Safely
    const statTotal = document.getElementById('statTotalChants');
    const statComplete = document.getElementById('statCompleteChants');
    const statMissing = document.getElementById('statMissingChants');

    if (statTotal) statTotal.textContent = chants.length;
    let completeCount = chants.filter(c => c.audio_count >= 4).length;
    if (statComplete) statComplete.textContent = completeCount;
    if (statMissing) statMissing.textContent = chants.length - completeCount;

    if (chants.length === 0) {
      container.innerHTML = '<p class="text-center">Aucun chant au catalogue.</p>';
      return;
    }

    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Catégorie</th>
            <th>Compositeur</th>
            <th>Médias</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${chants.map(chant => `
            <tr>
              <td>${chant.titre}</td>
              <td><span class="badge">${chant.categorie}</span></td>
              <td>${chant.compositeur || '-'}</td>
              <td>
                <div class="voice-indicators">
                  ${['complet', 'soprano', 'alto', 'tenor', 'basse'].map(v => {
      let hasVoice = false;
      if (v === 'complet') {
        hasVoice = (chant.audio || []).some(a => a.type === 'complet');
      } else {
        hasVoice = (chant.audio || []).some(a => a.type === 'voix_separee' && a.voix === v);
      }
      const label = v.charAt(0).toUpperCase();
      return `<span class="voice-tag ${hasVoice ? 'active' : ''}" title="${v}">${label}</span>`;
    }).join('')}
                </div>
              </td>
              <td class="admin-actions">
                <button class="btn btn-sm btn-outline" onclick="editChant(${chant.id})">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmDeleteChant(${chant.id}, '${chant.titre.replace(/'/g, "\\'")}')">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Error loading admin chants:', error);
    container.innerHTML = '<p class="error">Erreur lors du chargement des chants.</p>';
  }
}

async function showChantModal(chantId = null) {
  const modal = document.getElementById('chantModal');
  const form = document.getElementById('chantForm');
  const title = document.getElementById('modalTitle');

  form.reset();
  const mediaStatus = document.getElementById('mediaStatus');
  mediaStatus.innerHTML = '';
  document.querySelectorAll('.preview-container').forEach(el => el.innerHTML = '');
  document.querySelectorAll('.drop-zone').forEach(zone => {
    zone.classList.remove('has-file');
    const badge = zone.querySelector('.file-present-badge');
    if (badge) badge.remove();
    // Restore default text if it was modified
    const p = zone.querySelector('p');
    if (p) {
      if (zone.id.includes('complet')) p.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Glisser ou cliquer';
      else if (zone.id.includes('soprano')) p.innerHTML = 'S';
      else if (zone.id.includes('alto')) p.innerHTML = 'A';
      else if (zone.id.includes('tenor')) p.innerHTML = 'T';
      else if (zone.id.includes('basse')) p.innerHTML = 'B';
      else if (zone.id.includes('partition')) p.innerHTML = '<i class="fas fa-file-pdf"></i> PDF';
    }
  });
  document.getElementById('uploadProgress').style.display = 'none';

  if (chantId) {
    title.textContent = 'Modifier le Chant';
    try {
      const chant = await api.chants.getById(chantId);
      document.getElementById('chantId').value = chant.id;
      document.getElementById('titre').value = chant.titre;
      document.getElementById('compositeur').value = chant.compositeur || '';
      document.getElementById('parolier').value = chant.parolier || '';
      document.getElementById('categorie').value = chant.categorie;
      document.getElementById('temps_liturgique').value = chant.temps_liturgique || 'ordinaire';
      document.getElementById('difficulte').value = chant.difficulte || 'moyen';
      document.getElementById('paroles').value = chant.paroles || '';
      document.getElementById('description').value = chant.description || '';

      // Visual feedback for existing files
      const voiceTypes = ['complet', 'soprano', 'alto', 'tenor', 'basse'];
      voiceTypes.forEach(type => {
        let hasFile = false;
        if (type === 'complet') {
          hasFile = (chant.audio || []).some(a => a.type === 'complet');
        } else {
          hasFile = (chant.audio || []).some(a => a.type === 'voix_separee' && a.voix === type);
        }

        const zone = document.getElementById(`drop-audio_${type}`);
        if (zone && hasFile) {
          zone.classList.add('has-file');
          const p = zone.querySelector('p');
          if (p) {
            p.innerHTML = `<i class="fas fa-check-circle text-success"></i> ${type === 'complet' ? 'Audio Complet' : type.charAt(0).toUpperCase()} (Présent)`;
            const badge = document.createElement('div');
            badge.className = 'file-present-badge';
            badge.innerHTML = '<i class="fas fa-cloud"></i> Sur le serveur';
            zone.appendChild(badge);
          }
        }
      });

      // Partition check
      if (chant.partitions && chant.partitions.length > 0) {
        const partZone = document.getElementById('drop-partition');
        if (partZone) {
          partZone.classList.add('has-file');
          const p = partZone.querySelector('p');
          if (p) p.innerHTML = '<i class="fas fa-file-pdf text-success"></i> Partition (Présente)';
          const badge = document.createElement('div');
          badge.className = 'file-present-badge';
          badge.innerHTML = '<i class="fas fa-cloud"></i> Sur le serveur';
          partZone.appendChild(badge);
        }
      }

      if (chant.audio && chant.audio.length > 0) {
        const voiceLabels = {
          complet: 'Complet',
          soprano: 'S',
          alto: 'A',
          tenor: 'T',
          basse: 'B'
        };
        const voiceStatus = chant.audio.map(a => {
          const key = a.type === 'complet' ? 'complet' : a.voix;
          return `<span><i class="fas fa-check-circle text-success"></i> ${voiceLabels[key] || key}</span>`;
        }).join(' ');
        mediaStatus.innerHTML = `Audio(s) présent(s): ${voiceStatus}`;
      }
      if (chant.partitions && chant.partitions.length > 0) {
        mediaStatus.innerHTML += (mediaStatus.innerHTML ? '<br>' : '') + `Partition présente <i class="fas fa-file-pdf text-success"></i>`;
      }
    } catch (error) {
      toast.error('Erreur lors de la récupération des détails');
      return;
    }
  } else {
    title.textContent = 'Ajouter un Chant';
  }

  modal.style.display = 'block';
  setTimeout(setupDragAndDrop, 100);
}

async function handleChantSubmit(e) {
  e.preventDefault();
  const formData = new FormData();

  // Basic fields
  formData.append('titre', document.getElementById('titre').value);
  formData.append('compositeur', document.getElementById('compositeur').value);
  formData.append('parolier', document.getElementById('parolier').value);
  formData.append('categorie', document.getElementById('categorie').value);
  formData.append('temps_liturgique', document.getElementById('temps_liturgique').value);
  formData.append('difficulte', document.getElementById('difficulte').value);
  formData.append('paroles', document.getElementById('paroles').value);
  formData.append('description', document.getElementById('description').value);

  // Audio files
  const voiceFields = ['audio_complet', 'audio_soprano', 'audio_alto', 'audio_tenor', 'audio_basse'];
  voiceFields.forEach(field => {
    const input = document.getElementById(field);
    if (input && input.files[0]) {
      formData.append(field, input.files[0]);
    }
  });

  // Partition
  const partitionInput = document.getElementById('partition');
  if (partitionInput && partitionInput.files[0]) {
    formData.append('partition', partitionInput.files[0]);
  }

  const chantId = document.getElementById('chantId').value;
  const btnSave = document.getElementById('btnSaveChant');
  const progressContainer = document.getElementById('uploadProgress');
  const progressBar = document.getElementById('uploadProgressBar');

  btnSave.disabled = true;
  btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
  progressContainer.style.display = 'block';
  progressBar.style.width = '0%';

  try {
    const onProgress = (percent) => {
      progressBar.style.width = `${percent}%`;
    };

    if (chantId) {
      await api.chants.updateWithProgress(chantId, formData, onProgress);
      toast.success('Chant mis à jour avec succès');
    } else {
      await api.chants.uploadWithProgress(formData, onProgress);
      toast.success('Chant créé avec succès');
    }
    document.getElementById('chantModal').style.display = 'none';
    loadAdminChants();
  } catch (error) {
    console.error('Submit error:', error);
    toast.error('Erreur: ' + error.message);
  } finally {
    btnSave.disabled = false;
    btnSave.innerHTML = 'Enregistrer';
  }
}

async function confirmDeleteChant(id, name) {
  if (confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ? Cette action est irréversible et supprimera également les fichiers associés sur le cloud.`)) {
    try {
      await api.chants.delete(id);
      toast.success('Supprimé avec succès');
      loadAdminChants();
    } catch (error) {
      toast.error('Erreur lors de la suppression: ' + error.message);
    }
  }
}

function setupDragAndDrop() {
  const dropZones = document.querySelectorAll('.drop-zone');

  dropZones.forEach(zone => {
    const input = zone.querySelector('input[type="file"]');
    const previewId = input.getAttribute('onchange').match(/'([^']+)'/)[1];

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      zone.addEventListener(eventName, () => zone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, () => zone.classList.remove('dragover'), false);
    });

    zone.addEventListener('drop', e => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        input.files = files;
        handleFileSelect(input, previewId);
      }
    }, false);
  });
}

function handleFileSelect(input, previewId) {
  const preview = document.getElementById(previewId);
  if (input.files && input.files[0]) {
    const file = input.files[0];
    preview.innerHTML = `
      <div class="file-preview-item">
        <i class="fas ${file.type.includes('audio') ? 'fa-music' : 'fa-file-pdf'}"></i>
        <span>${file.name}</span>
        <span class="file-size">(${(file.size / 1024).toFixed(1)} KB)</span>
      </div>
    `;
  }
}

// Global scope for onclicks
window.editChant = showChantModal;
window.confirmDeleteChant = confirmDeleteChant;
window.handleFileSelect = handleFileSelect;

// Register route
router.register('admin', renderAdmin);

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
          <button class="btn btn-primary" id="btnNewChant">
            <i class="fas fa-plus"></i> Nouveau Chant
          </button>
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
                <label for="audio_complet">Complet</label>
                <input type="file" id="audio_complet" name="audio_complet" accept="audio/*">
              </div>
              <div class="form-group">
                <label for="audio_soprano">Soprano</label>
                <input type="file" id="audio_soprano" name="audio_soprano" accept="audio/*">
              </div>
              <div class="form-group">
                <label for="audio_alto">Alto</label>
                <input type="file" id="audio_alto" name="audio_alto" accept="audio/*">
              </div>
              <div class="form-group">
                <label for="audio_tenor">Ténor</label>
                <input type="file" id="audio_tenor" name="audio_tenor" accept="audio/*">
              </div>
              <div class="form-group">
                <label for="audio_basse">Basse</label>
                <input type="file" id="audio_basse" name="audio_basse" accept="audio/*">
              </div>
              <div class="form-group">
                <label for="partition">Partition (PDF)</label>
                <input type="file" id="partition" name="partition" accept=".pdf">
              </div>
            </div>
            <div id="mediaStatus" class="mt-2 text-sm text-muted"></div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-outline close-modal">Annuler</button>
            <button type="submit" class="btn btn-primary" id="btnSaveChant">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Load admin chants
  await loadAdminChants();

  // Event Listeners
  document.getElementById('btnNewChant').addEventListener('click', () => showChantModal());
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('chantModal').style.display = 'none';
    });
  });

  document.getElementById('chantForm').addEventListener('submit', handleChantSubmit);
}

async function loadAdminChants() {
  const container = document.getElementById('adminChantsContainer');
  try {
    const chants = await api.chants.getAll();

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
                ${chant.audio_count > 0 ? '<i class="fas fa-volume-up" title="Audio présent"></i>' : ''}
                ${chant.partition_count > 0 ? '<i class="fas fa-file-pdf" title="Partition présente"></i>' : ''}
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
  document.getElementById('mediaStatus').innerHTML = '';

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

      if (chant.audio && chant.audio.length > 0) {
        const voiceStatus = chant.audio.map(a => `<span><i class="fas fa-check-circle text-success"></i> ${a.voix}</span>`).join(' ');
        document.getElementById('mediaStatus').innerHTML = `Audio(s) présent(s): ${voiceStatus}`;
      }
      if (chant.partitions && chant.partitions.length > 0) {
        document.getElementById('mediaStatus').innerHTML += `<br>Partition présente <i class="fas fa-file-pdf text-success"></i>`;
      }
    } catch (error) {
      toast.error('Erreur lors de la récupération des détails');
      return;
    }
  } else {
    title.textContent = 'Ajouter un Chant';
  }

  modal.style.display = 'block';
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

  btnSave.disabled = true;
  btnSave.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';

  try {
    if (chantId) {
      await api.chants.update(chantId, formData);
      toast.success('Chant mis à jour avec succès');
    } else {
      await api.chants.create(formData);
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

// Global scope for onclicks
window.editChant = showChantModal;
window.confirmDeleteChant = confirmDeleteChant;

// Register route
router.register('admin', renderAdmin);

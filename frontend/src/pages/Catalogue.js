// Catalogue Page
async function renderCatalogue() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="catalogue-page">
      <div class="container">
        <div class="page-header">
          <h1><i class="fas fa-book"></i> Catalogue de Chants</h1>
          <p>Explorez notre collection de chants liturgiques</p>
        </div>
        
        <div class="catalogue-filters">
          <div class="filter-group">
            <label for="filterCategorie">Catégorie:</label>
            <select id="filterCategorie" class="filter-select">
              <option value="">Toutes</option>
              <option value="entree">Entrée</option>
              <option value="kyrie">Kyrie</option>
              <option value="gloria">Gloria</option>
              <option value="alleluia">Alléluia</option>
              <option value="offertoire">Offertoire</option>
              <option value="sanctus">Sanctus</option>
              <option value="agnus">Agnus Dei</option>
              <option value="communion">Communion</option>
              <option value="envoi">Envoi</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="filterTemps">Temps liturgique:</label>
            <select id="filterTemps" class="filter-select">
              <option value="">Tous</option>
              <option value="avent">Avent</option>
              <option value="noel">Noël</option>
              <option value="careme">Carême</option>
              <option value="paques">Pâques</option>
              <option value="pentecote">Pentecôte</option>
              <option value="ordinaire">Temps Ordinaire</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label for="filterDifficulte">Difficulté:</label>
            <select id="filterDifficulte" class="filter-select">
              <option value="">Toutes</option>
              <option value="facile">Facile</option>
              <option value="moyen">Moyen</option>
              <option value="difficile">Difficile</option>
            </select>
          </div>
          
          <div class="filter-group">
            <input type="text" id="searchInput" class="search-input" placeholder="Rechercher un chant...">
          </div>
          
          <button class="btn btn-outline" id="btnResetFilters">
            <i class="fas fa-redo"></i> Réinitialiser
          </button>
        </div>
        
        <div id="chantsContainer" class="chants-grid">
          <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> Chargement des chants...
          </div>
        </div>
      </div>
    </div>
  `;

  // Load chants
  await loadChants();

  // Add event listeners for filters
  document.getElementById('filterCategorie').addEventListener('change', loadChants);
  document.getElementById('filterTemps').addEventListener('change', loadChants);
  document.getElementById('filterDifficulte').addEventListener('change', loadChants);
  document.getElementById('searchInput').addEventListener('input', debounce(loadChants, 500));
  document.getElementById('btnResetFilters').addEventListener('click', resetFilters);
}

// Load chants with filters
async function loadChants() {
  const container = document.getElementById('chantsContainer');

  try {
    const filters = {
      categorie: document.getElementById('filterCategorie').value,
      temps_liturgique: document.getElementById('filterTemps').value,
      difficulte: document.getElementById('filterDifficulte').value,
      search: document.getElementById('searchInput').value
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (!filters[key]) delete filters[key];
    });

    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Chargement...</div>';

    // Fetch from real API
    const chants = await api.chants.getAll(filters);

    if (chants.length === 0) {
      container.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>Aucun chant trouvé</p></div>';
      return;
    }

    container.innerHTML = chants.map(chant => createChantCard(chant)).join('');

  } catch (error) {
    console.error('Error loading chants:', error);
    container.innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle"></i><p>Erreur lors du chargement des chants</p></div>';
  }
}

// Reset filters
function resetFilters() {
  document.getElementById('filterCategorie').value = '';
  document.getElementById('filterTemps').value = '';
  document.getElementById('filterDifficulte').value = '';
  document.getElementById('searchInput').value = '';
  loadChants();
}

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Register route
router.register('catalogue', renderCatalogue);

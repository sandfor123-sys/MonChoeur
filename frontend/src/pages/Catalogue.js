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
        
        <div class="catalogue-controls glass mb-4">
          <div class="catalogue-search-bar">
            <i class="fas fa-search"></i>
            <input type="text" id="searchInput" placeholder="Rechercher par titre, paroles, compositeur...">
          </div>
          <div class="catalogue-filters-v2">
            <div class="filter-item">
              <i class="fas fa-tag"></i>
              <select id="filterCategorie">
                <option value="">Toutes les catégories</option>
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
              </select>
            </div>
            
            <div class="filter-item">
              <i class="fas fa-calendar-alt"></i>
              <select id="filterTemps">
                <option value="">Tous les temps</option>
                <option value="avent">Avent</option>
                <option value="noel">Noël</option>
                <option value="careme">Carême</option>
                <option value="paques">Pâques</option>
                <option value="pentecote">Pentecôte</option>
                <option value="ordinaire">Temps Ordinaire</option>
              </select>
            </div>

            <button class="btn btn-icon-only" id="btnResetFilters" title="Réinitialiser">
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>
        
        <div id="chantsContainer" class="chants-grid">
          ${renderSkeletons(6)}
        </div>
      </div>
    </div>
  `;

  // Global variables for local filtering
  let allChants = [];
  let currentFilters = {
    categorie: '',
    temps_liturgique: '',
    search: ''
  };

  // Function to display chants in the container
  function displayChants(chantsToDisplay) {
    const container = document.getElementById('chantsContainer');
    if (chantsToDisplay.length === 0) {
      container.innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>Aucun chant trouvé</p></div>';
    } else {
      container.innerHTML = chantsToDisplay.map(chant => createChantCard(chant)).join('');
    }
  }

  // Load chants
  await loadChants();

  // Search event handler with immediate filtering
  document.getElementById('searchInput').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    currentFilters.search = term;

    if (allChants.length > 0) {
      // Local filter for "magic" instant feel
      const filtered = allChants.filter(chant => {
        const matchesSearch = !term ||
          chant.titre.toLowerCase().includes(term) ||
          (chant.compositeur && chant.compositeur.toLowerCase().includes(term)) ||
          (chant.paroles && chant.paroles.toLowerCase().includes(term));

        const matchesCategory = !currentFilters.categorie || chant.categorie === currentFilters.categorie;
        const matchesTemps = !currentFilters.temps_liturgique || chant.temps_liturgique === currentFilters.temps_liturgique;

        return matchesSearch && matchesCategory && matchesTemps;
      });
      displayChants(filtered);
    } else {
      loadChants();
    }
  });

  // Category and Temps listeners should also trigger local filter if data exists
  const handleFilterChange = () => {
    currentFilters.categorie = document.getElementById('filterCategorie').value;
    currentFilters.temps_liturgique = document.getElementById('filterTemps').value;

    if (allChants.length > 0) {
      const filtered = allChants.filter(chant => {
        const matchesCategory = !currentFilters.categorie || chant.categorie === currentFilters.categorie;
        const matchesTemps = !currentFilters.temps_liturgique || chant.temps_liturgique === currentFilters.temps_liturgique;
        const matchesSearch = !currentFilters.search ||
          chant.titre.toLowerCase().includes(currentFilters.search) ||
          (chant.compositeur && chant.compositeur.toLowerCase().includes(currentFilters.search));

        return matchesCategory && matchesTemps && matchesSearch;
      });
      displayChants(filtered);
    } else {
      loadChants();
    }
  };

  document.getElementById('filterCategorie').addEventListener('change', handleFilterChange);
  document.getElementById('filterTemps').addEventListener('change', handleFilterChange);
  document.getElementById('btnResetFilters').addEventListener('click', resetFilters);

  // Load chants with filters
  async function loadChants() {
    const container = document.getElementById('chantsContainer');

    try {
      currentFilters = {
        categorie: document.getElementById('filterCategorie').value,
        temps_liturgique: document.getElementById('filterTemps').value,
        search: document.getElementById('searchInput').value
      };

      // Remove empty filters for API call
      const apiFilters = { ...currentFilters };
      Object.keys(apiFilters).forEach(key => {
        if (!apiFilters[key]) delete apiFilters[key];
      });

      // Show skeletons during load if it's not a background refresh
      if (container.innerHTML.includes('no-results') || container.innerHTML.includes('error') || container.innerHTML.includes('loading') || !allChants.length) {
        container.innerHTML = renderSkeletons(6);
      }

      // Fetch from real API
      const chants = await api.chants.getAll(apiFilters);
      allChants = chants; // Store all fetched chants for potential local filtering

      displayChants(chants);

    } catch (error) {
      console.error('Error loading chants:', error);
      container.innerHTML = '<div class="error"><i class="fas fa-exclamation-triangle"></i><p>Erreur lors du chargement des chants</p></div>';
    }
  }

  // Reset filters
  function resetFilters() {
    document.getElementById('filterCategorie').value = '';
    document.getElementById('filterTemps').value = '';
    document.getElementById('searchInput').value = '';
    loadChants();
  }
}

function renderSkeletons(count) {
  return Array(count).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text" style="width: 40%"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text" style="width: 80%"></div>
      <div class="mt-4 d-flex gap-2">
        <div class="skeleton" style="width: 80px; height: 32px"></div>
        <div class="skeleton" style="width: 80px; height: 32px"></div>
      </div>
    </div>
  `).join('');
}

// Register route
router.register('catalogue', renderCatalogue);

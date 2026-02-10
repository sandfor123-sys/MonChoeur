// Accueil Page
async function renderAccueil() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            <i class="fas fa-music"></i>
            Bienvenue sur MonChœur
          </h1>
          <p class="hero-subtitle">
            Votre plateforme d'apprentissage de chants choraux pour la messe
          </p>
          <p class="hero-description">
            Découvrez notre catalogue de chants liturgiques, écoutez les différentes voix,
            téléchargez les partitions et créez vos playlists personnalisées.
          </p>
          <div class="hero-actions">
            <a href="#catalogue" class="btn btn-primary btn-lg">
              <i class="fas fa-book"></i> Explorer le Catalogue
            </a>
            ${!auth.isAuthenticated() ? `
              <button class="btn btn-outline btn-lg" id="btnHeroRegister">
                <i class="fas fa-user-plus"></i> S'inscrire Gratuitement
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
    
    <div class="features">
      <div class="container">
        <h2 class="section-title text-center">Chants Récents</h2>
        <div id="featuredChants" class="chants-grid">
           <div class="loading text-center"><i class="fas fa-spinner fa-spin"></i> Chargement...</div>
        </div>
        <div class="text-center mt-4">
           <a href="#catalogue" class="btn btn-outline">Voir tout le catalogue</a>
        </div>
      </div>
    </div>
    
    <div class="features">
      <div class="container">
        <h2 class="section-title text-center">Fonctionnalités</h2>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-book-open"></i>
            </div>
            <h3>Catalogue Complet</h3>
            <p>Accédez à une large sélection de chants liturgiques organisés par catégorie et temps liturgique</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-headphones"></i>
            </div>
            <h3>Écoute Audio</h3>
            <p>Écoutez chaque chant avec la possibilité d'isoler les différentes voix (soprano, alto, ténor, basse)</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-file-pdf"></i>
            </div>
            <h3>Partitions</h3>
            <p>Téléchargez les partitions au format PDF pour chaque voix</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-list"></i>
            </div>
            <h3>Playlists Personnalisées</h3>
            <p>Créez et organisez vos propres listes de chants pour vos répétitions et célébrations</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="cta-section">
      <div class="container">
        <h2>Prêt à commencer ?</h2>
        <p>Rejoignez notre communauté de choristes et améliorez votre pratique du chant liturgique</p>
        ${!auth.isAuthenticated() ? `
          <button class="btn btn-secondary btn-lg" id="btnCtaRegister">
            <i class="fas fa-user-plus"></i> Créer un Compte Gratuit
          </button>
        ` : `
          <a href="#catalogue" class="btn btn-secondary btn-lg">
            <i class="fas fa-music"></i> Commencer à Chanter
          </a>
        `}
      </div>
    </div>
  `;

  // Load featured chants
  loadFeaturedChants();

  // Add event listeners
  const btnHeroRegister = document.getElementById('btnHeroRegister');
  const btnCtaRegister = document.getElementById('btnCtaRegister');

  if (btnHeroRegister) {
    btnHeroRegister.addEventListener('click', () => {
      router.navigate('#register');
    });
  }

  if (btnCtaRegister) {
    btnCtaRegister.addEventListener('click', () => {
      router.navigate('#register');
    });
  }
}

// Load featured chants from API
async function loadFeaturedChants() {
  const container = document.getElementById('featuredChants');
  if (!container) return;

  try {
    const chants = await api.chants.getAll();

    if (chants.length === 0) {
      container.innerHTML = '<p class="text-center">Aucun chant disponible pour le moment.</p>';
      return;
    }

    // Take only the 3 most recent
    const featured = chants.slice(0, 3);
    container.innerHTML = featured.map(chant => createChantCard(chant)).join('');
  } catch (error) {
    console.error('Error loading featured chants:', error);
    container.innerHTML = '<p class="text-center error">Erreur lors du chargement des chants.</p>';
  }
}

// Register route
router.register('accueil', renderAccueil);

// Accueil Page
async function renderAccueil() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="hero-humble">
      <div class="container">
        <div class="hero-content-v3 animate-fade-in">
          <span class="hero-mission-tag">Servir la Liturgie</span>
          <h1 class="hero-title-v3">Apprendre et chanter en chœur</h1>
          <p class="hero-subtitle-v3">
            Un compagnon simple pour aider chaque choriste à maîtriser sa voix 
            et servir au mieux la prière de l'assemblée.
          </p>
          <div class="hero-actions-v3">
            <a href="#catalogue" class="btn btn-primary btn-lg">
              <i class="fas fa-book-open"></i> Parcourir le Catalogue
            </a>
            ${!auth.isAuthenticated() ? `
              <button class="btn btn-outline btn-lg" id="btnHeroRegister">
                Nous rejoindre
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
    
    <div class="features-section">
      <div class="container">
        <div class="section-header text-center animate-fade-in">
          <h2 class="section-title">Comment ça <span class="text-gradient">marche</span> ?</h2>
          <p class="section-subtitle">Une approche moderne pour l'apprentissage du chant choral</p>
        </div>
        
        <div class="features-grid-v2">
          <div class="feature-card-premium glass glow-hover animate-slide-up">
            <div class="feature-icon-v2">
              <i class="fas fa-layer-group"></i>
            </div>
            <h3>Apprentissage par Voix</h3>
            <p>Isolez votre pupitre (Soprano, Alto, Ténor ou Basse) pour vous concentrer sur votre mélodie.</p>
          </div>
          
          <div class="feature-card-premium glass glow-hover animate-slide-up" style="animation-delay: 0.1s">
            <div class="feature-icon-v2">
              <i class="fas fa-file-invoice"></i>
            </div>
            <h3>Partitions Accessibles</h3>
            <p>Consultez les partitions PDF directement depuis votre navigateur ou téléchargez-les pour vos répétitions.</p>
          </div>
          
          <div class="feature-card-premium glass glow-hover animate-slide-up" style="animation-delay: 0.2s">
            <div class="feature-icon-v2">
              <i class="fas fa-list-ul"></i>
            </div>
            <h3>Listes de Célébration</h3>
            <p>Préparez vos messes en créant des playlists et partagez-les avec les autres membres du chœur.</p>
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

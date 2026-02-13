// Apropos Page
async function renderApropos() {
    const app = document.getElementById('app');

    app.innerHTML = `
    <div class="apropos-page">
      <div class="container py-xl">
        <div class="content-humble animate-fade-in">
          <h1 class="page-title-humble">Notre Mission</h1>
          <div class="mission-text">
            <p>
              <strong>MonChœur</strong> est né d'un désir simple : aider les choristes, serviteurs de la liturgie, 
              à préparer leur cœur et leur voix pour la prière commune.
            </p>
            <p>
              Apprendre un nouveau chant ne doit pas être un obstacle à la ferveur. En facilitant 
              l'écoute et l'apprentissage des différentes voix (Soprano, Alto, Ténor, Basse), 
              nous souhaitons offrir à chaque chœur un outil au service de l'excellence et de l'unité.
            </p>
          </div>

          <div class="mission-values grid-2-columns">
            <div class="value-item glass">
              <i class="fas fa-hands-helping"></i>
              <h3>Service</h3>
              <p>Un outil conçu pour les paroisses et les communautés, sans autre but que le service du chant choral.</p>
            </div>
            <div class="value-item glass">
              <i class="fas fa-graduation-cap"></i>
              <h3>Pédagogie</h3>
              <p>Rendre accessible l'apprentissage technique pour que seule reste la joie de chanter ensemble.</p>
            </div>
          </div>

          <div class="mission-footer text-center">
            <p><em>"Chanter, c'est prier deux fois."</em> — Saint Augustin</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Export for use in router
window.renderApropos = renderApropos;

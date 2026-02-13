// Profil Page
async function renderProfil() {
    const app = document.getElementById('app');

    if (!auth.isAuthenticated()) {
        router.navigate('#accueil');
        toast.warning('Vous devez être connecté pour accéder à votre profil');
        return;
    }

    const user = auth.getCurrentUser();

    app.innerHTML = `
    <div class="profil-page">
      <div class="container">
        <div class="page-header">
          <h1><i class="fas fa-user-circle"></i> Mon Profil</h1>
          <p>Gérez vos informations personnelles et vos préférences</p>
        </div>

        <div class="detail-content-grid">
          <div class="card">
            <h3>Informations Personnelles</h3>
            <form id="profileForm" class="mt-3">
              <div class="form-group">
                <label for="username">Nom d'utilisateur</label>
                <input type="text" id="username" value="${user.username}" required>
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" value="${user.email}" disabled>
                <small class="text-muted">L'email ne peut pas être modifié</small>
              </div>
              <button type="submit" class="btn btn-primary" id="btnUpdateProfile">
                <i class="fas fa-save"></i> Mettre à jour le profil
              </button>
            </form>

            <hr class="my-4">

            <h3>Sécurité</h3>
            <form id="passwordForm" class="mt-3">
              <div class="form-group">
                <label for="currentPassword">Mot de passe actuel</label>
                <input type="password" id="currentPassword" required>
              </div>
              <div class="form-group">
                <label for="newPassword">Nouveau mot de passe</label>
                <input type="password" id="newPassword" required minlength="6">
              </div>
              <div class="form-group">
                <label for="confirmPassword">Confirmer le nouveau mot de passe</label>
                <input type="password" id="confirmPassword" required minlength="6">
              </div>
              <button type="submit" class="btn btn-outline" id="btnUpdatePassword">
                <i class="fas fa-lock"></i> Changer le mot de passe
              </button>
            </form>
          </div>

          <div class="sidebar">
            <div class="card bg-light">
              <h3>Résumé</h3>
              <div class="profile-stats mt-3">
                <div class="stat-item">
                  <span class="stat-label">Rôle</span>
                  <span class="badge badge-info">${user.role === 'admin' ? 'Administrateur' : 'Choriste'}</span>
                </div>
                <div class="stat-item mt-2">
                  <span class="stat-label">Membre depuis</span>
                  <span class="stat-value">${new Date().toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
              <div class="mt-4">
                <button class="btn btn-danger w-100" onclick="auth.logout()">
                  <i class="fas fa-sign-out-alt"></i> Déconnexion
                </button>
              </div>
            </div>
            
            <div class="card mt-3">
              <h3>Mes Playlists</h3>
              <p class="font-sm text-muted">Accédez rapidement à vos listes de chants favorites.</p>
              <a href="#playlists" class="btn btn-outline btn-sm w-100 mt-2">
                <i class="fas fa-list"></i> Voir mes playlists
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

    // Add event listeners
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('passwordForm').addEventListener('submit', handlePasswordUpdate);
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;

    try {
        // API call would go here
        toast.success('Profil mis à jour ! (Simulation)');
        // Update local user data
        const user = auth.getCurrentUser();
        user.username = username;
        localStorage.setItem('user', JSON.stringify(user));
        updateAuthUI();
    } catch (error) {
        toast.error('Erreur: ' + error.message);
    }
}

async function handlePasswordUpdate(e) {
    e.preventDefault();
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;

    if (newPass !== confirm) {
        toast.error('Les mots de passe ne correspondent pas');
        return;
    }

    try {
        // API call would go here
        toast.success('Mot de passe changé ! (Simulation)');
        e.target.reset();
    } catch (error) {
        toast.error('Erreur: ' + error.message);
    }
}

// Global scope
window.renderProfil = renderProfil;

// Register route
router.register('profil', renderProfil);

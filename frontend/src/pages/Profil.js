// Profil Page
async function renderProfil() {
  const app = document.getElementById('app');

  if (!auth.isAuthenticated()) {
    // Show login/register forms instead of redirecting
    app.innerHTML = `
        <div class="profil-page">
          <div class="container">
            <div class="page-header">
              <h1><i class="fas fa-user-circle"></i> Connexion</h1>
              <p>Connectez-vous pour accéder à votre profil et vos playlists</p>
            </div>

            <div class="auth-container">
              <div class="auth-tabs">
                <button class="auth-tab active" data-tab="login">Connexion</button>
                <button class="auth-tab" data-tab="register">Créer un compte</button>
              </div>

              <!-- Login Form -->
              <div class="auth-form-container" id="loginForm">
                <form id="formLogin" class="auth-form">
                  <div class="form-group">
                    <label for="loginEmail">Email</label>
                    <input type="email" id="loginEmail" required placeholder="votre@email.com">
                  </div>
                  <div class="form-group">
                    <label for="loginPassword">Mot de passe</label>
                    <input type="password" id="loginPassword" required placeholder="••••••••">
                  </div>
                  <button type="submit" class="btn btn-primary w-100">
                    <i class="fas fa-sign-in-alt"></i> Se connecter
                  </button>
                </form>
              </div>

              <!-- Register Form -->
              <div class="auth-form-container hidden" id="registerForm">
                <form id="formRegister" class="auth-form">
                  <div class="form-group">
                    <label for="registerUsername">Nom d'utilisateur</label>
                    <input type="text" id="registerUsername" required placeholder="Votre nom">
                  </div>
                  <div class="form-group">
                    <label for="registerEmail">Email</label>
                    <input type="email" id="registerEmail" required placeholder="votre@email.com">
                  </div>
                  <div class="form-group">
                    <label for="registerPassword">Mot de passe</label>
                    <input type="password" id="registerPassword" required minlength="6" placeholder="••••••••">
                  </div>
                  <div class="form-group">
                    <label for="registerConfirm">Confirmer le mot de passe</label>
                    <input type="password" id="registerConfirm" required minlength="6" placeholder="••••••••">
                  </div>
                  <button type="submit" class="btn btn-primary w-100">
                    <i class="fas fa-user-plus"></i> Créer mon compte
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        `;

    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;

        // Update active tab
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show/hide forms
        document.getElementById('loginForm').classList.toggle('hidden', targetTab !== 'login');
        document.getElementById('registerForm').classList.toggle('hidden', targetTab !== 'register');
      });
    });

    // Login form handler
    document.getElementById('formLogin').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      try {
        await auth.login(email, password);
        toast.success('Connexion réussie !');
        renderProfil(); // Reload to show profile
      } catch (error) {
        toast.error(error.message);
      }
    });

    // Register form handler
    document.getElementById('formRegister').addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('registerUsername').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      const confirm = document.getElementById('registerConfirm').value;

      if (password !== confirm) {
        toast.error('Les mots de passe ne correspondent pas');
        return;
      }

      try {
        await auth.register(username, email, password);
        toast.success('Compte créé ! Vous êtes maintenant connecté.');
        renderProfil(); // Reload to show profile
      } catch (error) {
        toast.error(error.message);
      }
    });

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

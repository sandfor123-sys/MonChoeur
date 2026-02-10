// Main Application Entry Point
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎵 MonChoeur Application Starting...');

    // Initialize router
    router.init();

    // Setup navigation toggle for mobile
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Setup auth buttons
    const btnLogin = document.getElementById('btnLogin');
    const btnRegister = document.getElementById('btnRegister');

    if (btnLogin) {
        btnLogin.addEventListener('click', showLoginModal);
    }

    if (btnRegister) {
        btnRegister.addEventListener('click', showRegisterModal);
    }

    // Update UI based on auth status
    updateAuthUI();

    console.log('✅ Application Ready');
});

// Show login modal
function showLoginModal() {
    // TODO: Implement modal
    const email = prompt('Email:');
    if (!email) return;

    const password = prompt('Mot de passe:');
    if (!password) return;

    auth.login(email, password)
        .then(() => {
            alert('Connexion réussie!');
            updateAuthUI();
            router.navigate('#accueil');
        })
        .catch(error => {
            alert('Erreur de connexion: ' + error.message);
        });
}

// Show register modal
function showRegisterModal() {
    // TODO: Implement modal
    const username = prompt('Nom d\'utilisateur:');
    if (!username) return;

    const email = prompt('Email:');
    if (!email) return;

    const password = prompt('Mot de passe:');
    if (!password) return;

    auth.register({ username, email, password })
        .then(() => {
            alert('Inscription réussie!');
            updateAuthUI();
            router.navigate('#accueil');
        })
        .catch(error => {
            alert('Erreur d\'inscription: ' + error.message);
        });
}

// Update UI based on authentication status
function updateAuthUI() {
    const navActions = document.querySelector('.nav-actions');

    if (auth.isAuthenticated()) {
        const user = auth.getCurrentUser();
        navActions.innerHTML = `
      ${auth.isAdmin() ? '<a href="#admin" class="nav-link"><i class="fas fa-cog"></i> Admin</a>' : ''}
      <span class="user-greeting">Bonjour, ${user.username}</span>
      <button class="btn btn-outline" onclick="auth.logout()">
        <i class="fas fa-sign-out-alt"></i> Déconnexion
      </button>
    `;
    } else {
        navActions.innerHTML = `
      <button class="btn btn-outline" id="btnLogin">Connexion</button>
      <button class="btn btn-primary" id="btnRegister">S'inscrire</button>
    `;

        // Re-attach event listeners
        document.getElementById('btnLogin').addEventListener('click', showLoginModal);
        document.getElementById('btnRegister').addEventListener('click', showRegisterModal);
    }
}

// Export functions
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.updateAuthUI = updateAuthUI;

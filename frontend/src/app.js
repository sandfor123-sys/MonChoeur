// Main Application Entry Point
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎵 MonChoeur Application Starting...');

    // Initialize router
    router.register('accueil', renderAccueil);
    router.register('catalogue', renderCatalogue);
    router.register('playlists', renderPlaylists);
    router.register('apropos', renderApropos);
    router.register('admin', renderAdmin);
    router.register('admin-users', renderAdminUsers);
    router.register('profil', renderProfil);
    router.register('chant', renderDetailChant);

    router.init();

    // Create Modals Container if it doesn't exist
    if (!document.getElementById('modalsContainer')) {
        const modalDiv = document.createElement('div');
        modalDiv.id = 'modalsContainer';
        document.body.appendChild(modalDiv);
    }
    renderAuthModals();

    // Setup navigation toggle for mobile
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Update UI based on auth status
    updateAuthUI();

    console.log('✅ Application Ready');
});

function renderAuthModals() {
    const container = document.getElementById('modalsContainer');
    container.innerHTML = `
        <!-- Login Modal -->
        <div id="loginModal" class="modal">
            <div class="modal-content modal-sm">
                <div class="modal-header">
                    <h2>Connexion</h2>
                    <span class="close-modal" onclick="closeModal('loginModal')">&times;</span>
                </div>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="loginEmail">Email</label>
                        <input type="email" id="loginEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Mot de passe</label>
                        <input type="password" id="loginPassword" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Se connecter</button>
                    <p class="text-center mt-3 font-sm">
                        Pas encore de compte ? <a href="javascript:void(0)" onclick="switchModal('loginModal', 'registerModal')">S'inscrire</a>
                    </p>
                </form>
            </div>
        </div>

        <!-- Register Modal -->
        <div id="registerModal" class="modal">
            <div class="modal-content modal-sm">
                <div class="modal-header">
                    <h2>Inscription</h2>
                    <span class="close-modal" onclick="closeModal('registerModal')">&times;</span>
                </div>
                <form id="registerForm">
                    <div class="form-group">
                        <label for="regUsername">Nom d'utilisateur</label>
                        <input type="text" id="regUsername" required>
                    </div>
                    <div class="form-group">
                        <label for="regEmail">Email</label>
                        <input type="email" id="regEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="regPassword">Mot de passe</label>
                        <input type="password" id="regPassword" required minlength="6">
                    </div>
                    <button type="submit" class="btn btn-primary w-100">Créer un compte</button>
                    <p class="text-center mt-3 font-sm">
                        Déjà un compte ? <a href="javascript:void(0)" onclick="switchModal('registerModal', 'loginModal')">Se connecter</a>
                    </p>
                </form>
            </div>
        </div>
    `;

    // Listeners
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function switchModal(from, to) {
    closeModal(from);
    document.getElementById(to).style.display = 'block';
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await auth.login(email, password);
        toast.success('Connexion réussie !');
        closeModal('loginModal');
        updateAuthUI();
        router.navigate('#accueil');
    } catch (error) {
        toast.error('Erreur: ' + error.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    try {
        await auth.register({ username, email, password });
        toast.success('Inscription réussie !');
        closeModal('registerModal');
        updateAuthUI();
        router.navigate('#accueil');
    } catch (error) {
        toast.error('Erreur: ' + error.message);
    }
}

// Update UI based on authentication status
function updateAuthUI() {
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;

    if (auth.isAuthenticated()) {
        const user = auth.getCurrentUser();
        navActions.innerHTML = `
      ${auth.isAdmin() ? '<a href="#admin" class="nav-link"><i class="fas fa-cog"></i> Admin</a>' : ''}
      <a href="#profil" class="nav-link"><i class="fas fa-user"></i> Profil</a>
      <button class="btn btn-outline" onclick="auth.logout()">
        <i class="fas fa-sign-out-alt"></i>
      </button>
    `;
    } else {
        navActions.innerHTML = `
      <button class="btn btn-outline" onclick="showLoginModal()">Connexion</button>
      <button class="btn btn-primary" onclick="showRegisterModal()">S'inscrire</button>
    `;
    }
}

// Global scope
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.closeModal = closeModal;
window.switchModal = switchModal;
window.updateAuthUI = updateAuthUI;
window.renderProfil = typeof renderProfil !== 'undefined' ? renderProfil : () => { };

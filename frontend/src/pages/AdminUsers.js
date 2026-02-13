// Admin Users Management Page
async function renderAdminUsers() {
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
            <h1><i class="fas fa-users-cog"></i> Gestion Utilisateurs</h1>
            <p>Gérez les comptes et les permissions</p>
          </div>
          <button class="btn btn-outline" onclick="router.navigate('#admin')">
            <i class="fas fa-arrow-left"></i> Retour au Catalogue
          </button>
        </div>

        <div class="admin-controls mb-4">
          <div class="search-filter-bar">
            <div class="search-input">
              <i class="fas fa-search"></i>
              <input type="text" id="userSearchInput" placeholder="Rechercher par nom ou email...">
            </div>
          </div>
        </div>

        <div id="usersContainer" class="admin-table-container">
          <div class="loading"><i class="fas fa-spinner fa-spin"></i> Chargement des utilisateurs...</div>
        </div>
      </div>
    </div>
  `;

  // Load users
  await loadAdminUsers();

  // Search listener
  document.getElementById('userSearchInput').addEventListener('input', (e) => {
    filterUsers(e.target.value);
  });
}

let allUsers = [];

async function loadAdminUsers() {
  const container = document.getElementById('usersContainer');
  try {
    allUsers = await api.admin.getUsers();
    renderUserTable(allUsers);
  } catch (error) {
    console.error('Error loading users:', error);
    container.innerHTML = '<p class="error">Erreur lors du chargement des utilisateurs.</p>';
  }
}

function renderUserTable(users) {
  const container = document.getElementById('usersContainer');

  if (users.length === 0) {
    container.innerHTML = '<p class="text-center">Aucun utilisateur trouvé.</p>';
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Utilisateur</th>
          <th>Email</th>
          <th>Rôle</th>
          <th>Date d'inscription</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(user => `
          <tr data-id="${user.id}">
            <td><strong>${user.username}</strong></td>
            <td>${user.email}</td>
            <td>
              <span class="badge ${user.role === 'admin' ? 'badge-primary' : 'badge-outline'}">
                ${user.role}
              </span>
            </td>
            <td>${new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
            <td class="admin-actions">
              <select class="form-select-sm" onchange="changeUserRole(${user.id}, this.value, event)">
                <option value="user" ${user.role === 'user' ? 'selected' : ''}>Mettre en User</option>
                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Mettre en Admin</option>
              </select>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function filterUsers(query) {
  const q = query.toLowerCase();
  const filtered = allUsers.filter(u =>
    u.username.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q)
  );
  renderUserTable(filtered);
}

async function changeUserRole(userId, newRole, event) {
  try {
    const btn = event.target;
    btn.disabled = true;
    await api.admin.updateUserRole(userId, newRole);
    toast.success('Rôle mis à jour avec succès');
    // Refresh local data to reflect in search
    const user = allUsers.find(u => u.id === userId);
    if (user) user.role = newRole;
    btn.disabled = false;
  } catch (error) {
    toast.error('Erreur: ' + error.message);
    btn.disabled = false;
  }
}

// Global scope
window.changeUserRole = changeUserRole;

// Register route
router.register('admin-users', renderAdminUsers);

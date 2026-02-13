// Mobile Bottom Navigation Active State
document.addEventListener('DOMContentLoaded', () => {
    const updateBottomNav = () => {
        const currentHash = window.location.hash.slice(1).split('/')[0] || 'accueil';
        const navItems = document.querySelectorAll('.nav-item-mobile');

        navItems.forEach(item => {
            const page = item.getAttribute('data-page');
            if (page === currentHash) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update profile tab text based on login status
        const profileTab = document.getElementById('profileNavItem');
        if (profileTab) {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            const span = profileTab.querySelector('span');
            if (user) {
                span.textContent = 'Profil';
            } else {
                span.textContent = 'Connexion';
            }
        }
    };

    // Update on page load
    updateBottomNav();

    // Update on hash change
    window.addEventListener('hashchange', updateBottomNav);

    // Update on storage change (login/logout)
    window.addEventListener('storage', updateBottomNav);
});

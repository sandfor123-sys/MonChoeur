// Mobile Sidebar Navigation
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuBtn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('sidebarClose');

    // Open sidebar
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar?.classList.add('open');
            overlay?.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Close sidebar
    const closeSidebar = () => {
        sidebar?.classList.remove('open');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
    }

    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    // Update active nav item
    const updateActiveNav = () => {
        const currentHash = window.location.hash.slice(1).split('/')[0] || 'accueil';
        const navItems = document.querySelectorAll('.sidebar-nav-item');

        navItems.forEach(item => {
            const page = item.getAttribute('data-page');
            if (page === currentHash) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Close sidebar after navigation on mobile
        closeSidebar();
    };

    // Update on page load
    updateActiveNav();

    // Update on hash change
    window.addEventListener('hashchange', updateActiveNav);

    // Swipe to close gesture
    let touchStartX = 0;
    let touchEndX = 0;

    if (sidebar) {
        sidebar.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        sidebar.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) {
                closeSidebar();
            }
        });
    }
});

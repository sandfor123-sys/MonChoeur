// Simple SPA Router
const router = {
    routes: {},
    currentRoute: null,

    // Register a route
    register(path, handler) {
        this.routes[path] = handler;
    },

    // Navigate to a route
    navigate(path) {
        // Update URL without reload
        window.history.pushState({}, '', path);
        this.loadRoute(path);
    },

    // Load and execute route handler
    async loadRoute(path) {
        // Extract route path from hash or path
        const fullPath = path.replace('#', '').split('?')[0] || 'accueil';
        const parts = fullPath.split('/');
        const routeName = parts[0];
        const param = parts[1];

        this.currentRoute = routeName;

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${routeName}`) {
                link.classList.add('active');
            }
        });

        // Execute route handler with safety
        try {
            const handler = this.routes[routeName];
            if (handler) {
                await handler(param);
            } else {
                console.warn(`Route not found: ${routeName}`);
                this.navigate('#accueil');
            }
        } catch (error) {
            console.error('Routing Error:', error);
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = `
                    <div class="container py-xl text-center">
                        <i class="fas fa-exclamation-triangle text-warning mb-4" style="font-size: 3rem;"></i>
                        <h2>Oops ! Une erreur est survenue</h2>
                        <p class="text-muted mb-4">Nous n'avons pas pu charger cette page. Il se peut qu'il y ait un problème de connexion.</p>
                        <button class="btn btn-primary" onclick="window.location.reload()">
                            <i class="fas fa-sync"></i> Recharger la page
                        </button>
                    </div>
                `;
            }
            toast.error('Erreur de chargement: ' + error.message);
        }
    },

    // Initialize router
    init() {
        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.loadRoute(window.location.hash);
        });

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            this.loadRoute(window.location.hash);
        });

        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link')) {
                e.preventDefault();
                const href = e.target.getAttribute('href');
                this.navigate(href);
            }
        });

        // Load initial route
        const initialRoute = window.location.hash || '#accueil';
        this.loadRoute(initialRoute);
    }
};

// Export for use in other files
window.router = router;

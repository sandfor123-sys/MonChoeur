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
        // Extract route name from hash or path
        const route = path.replace('#', '').split('?')[0] || 'accueil';

        this.currentRoute = route;

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${route}`) {
                link.classList.add('active');
            }
        });

        // Execute route handler
        const handler = this.routes[route];
        if (handler) {
            await handler();
        } else {
            console.warn(`Route not found: ${route}`);
            this.navigate('#accueil');
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

// Client-side Router for SPA navigation
class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.currentPage = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the router
     */
    init() {
        // Set up routes
        this.setupRoutes();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Handle initial route
        this.handleInitialRoute();
        
        this.isInitialized = true;
        console.log('✅ Router initialized');
    }

    /**
     * Set up application routes
     */
    setupRoutes() {
        this.routes.set('/', {
            component: 'MapPage',
            title: 'Free Water Tips - Find Water Sources Near You',
            description: 'Discover free water sources in your area with our interactive map.',
            requiresAuth: false
        });

        this.routes.set('/contribute', {
            component: 'ContributePage',
            title: 'Contribute - Free Water Tips',
            description: 'Help others by adding new water sources to our community database.',
            requiresAuth: false
        });

        this.routes.set('/about', {
            component: 'AboutPage',
            title: 'About - Free Water Tips',
            description: 'Learn more about our mission to provide free access to clean water information.',
            requiresAuth: false
        });

        // Add more routes as needed
        this.routes.set('/privacy', {
            component: 'StaticPage',
            title: 'Privacy Policy - Free Water Tips',
            description: 'Our commitment to protecting your privacy and personal data.',
            requiresAuth: false,
            content: 'privacy'
        });

        this.routes.set('/terms', {
            component: 'StaticPage',
            title: 'Terms of Service - Free Water Tips',
            description: 'Terms and conditions for using our service.',
            requiresAuth: false,
            content: 'terms'
        });
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            this.handleRouteChange(window.location.pathname, false);
        });

        // Handle navigation clicks
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href]');
            
            if (link && this.isInternalLink(link)) {
                event.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });

        // Handle form submissions that should navigate
        document.addEventListener('submit', (event) => {
            const form = event.target;
            const action = form.getAttribute('action');
            
            if (action && this.isInternalPath(action)) {
                event.preventDefault();
                this.navigate(action);
            }
        });
    }

    /**
     * Handle initial route on page load
     */
    handleInitialRoute() {
        const path = window.location.pathname;
        this.handleRouteChange(path, false);
    }

    /**
     * Navigate to a new route
     * @param {string} path - Route path
     * @param {boolean} pushState - Whether to push new state to history
     */
    navigate(path, pushState = true) {
        if (path === this.currentRoute) {
            return; // Already on this route
        }

        this.handleRouteChange(path, pushState);
    }

    /**
     * Handle route change
     * @param {string} path - Route path
     * @param {boolean} pushState - Whether to push new state to history
     */
    async handleRouteChange(path, pushState = true) {
        try {
            // Clean up path
            path = this.cleanPath(path);
            
            // Check if route exists
            const route = this.routes.get(path);
            
            if (!route) {
                console.warn(`Route not found: ${path}`);
                this.handle404(path);
                return;
            }

            // Check authentication if required
            if (route.requiresAuth && !this.isAuthenticated()) {
                this.redirectToLogin(path);
                return;
            }

            // Update browser history
            if (pushState) {
                window.history.pushState({ path }, route.title, path);
            }

            // Update page metadata
            this.updateMetadata(route);

            // Hide current page
            await this.hideCurrentPage();

            // Load and show new page
            await this.showPage(route, path);

            // Update navigation state
            this.updateNavigation(path);

            // Update current route
            this.currentRoute = path;

            console.log(`✅ Navigated to: ${path}`);

        } catch (error) {
            console.error('❌ Navigation failed:', error);
            Toast.error('Navigation failed. Please try again.');
        }
    }

    /**
     * Clean and normalize path
     * @param {string} path - Raw path
     * @returns {string} Cleaned path
     */
    cleanPath(path) {
        // Remove trailing slash (except for root)
        if (path.length > 1 && path.endsWith('/')) {
            path = path.slice(0, -1);
        }
        
        // Ensure starts with slash
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        return path;
    }

    /**
     * Update page metadata
     * @param {Object} route - Route configuration
     */
    updateMetadata(route) {
        // Update page title
        document.title = route.title;

        // Update meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = 'description';
            document.head.appendChild(metaDescription);
        }
        metaDescription.content = route.description;

        // Update canonical URL
        let canonicalLink = document.querySelector('link[rel="canonical"]');
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.rel = 'canonical';
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = window.location.origin + this.currentRoute;
    }

    /**
     * Hide current page
     */
    async hideCurrentPage() {
        if (this.currentPage) {
            // Call page cleanup if available
            if (typeof this.currentPage.onHide === 'function') {
                await this.currentPage.onHide();
            }
        }

        // Hide all page containers
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
        });
    }

    /**
     * Show page for route
     * @param {Object} route - Route configuration
     * @param {string} path - Route path
     */
    async showPage(route, path) {
        try {
            // Get or create page component
            const pageComponent = await this.getPageComponent(route);
            
            // Initialize page if needed
            if (pageComponent && typeof pageComponent.init === 'function' && !pageComponent.isLoaded) {
                await pageComponent.init();
            }

            // Show page container
            const pageId = this.getPageId(path);
            const pageElement = document.getElementById(pageId);
            
            if (pageElement) {
                pageElement.classList.add('active');
            }

            // Call page show callback
            if (pageComponent && typeof pageComponent.onShow === 'function') {
                await pageComponent.onShow();
            }

            this.currentPage = pageComponent;

        } catch (error) {
            console.error('Failed to show page:', error);
            throw error;
        }
    }

    /**
     * Get page component instance
     * @param {Object} route - Route configuration
     * @returns {Object} Page component instance
     */
    async getPageComponent(route) {
        const ComponentClass = window[route.component];
        
        if (!ComponentClass) {
            console.error(`Component not found: ${route.component}`);
            return null;
        }

        // Create instance if it doesn't exist
        const instanceName = route.component.toLowerCase() + 'Instance';
        
        if (!window.app[instanceName]) {
            window.app[instanceName] = new ComponentClass();
        }

        return window.app[instanceName];
    }

    /**
     * Get page element ID from path
     * @param {string} path - Route path
     * @returns {string} Page element ID
     */
    getPageId(path) {
        if (path === '/') return 'map-page';
        if (path === '/contribute') return 'contribute-page';
        if (path === '/about') return 'about-page';
        return 'default-page';
    }

    /**
     * Update navigation active states
     * @param {string} path - Current path
     */
    updateNavigation(path) {
        // Update nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            if (href === path) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update mobile menu if open
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && mobileMenu.classList.contains('open')) {
            mobileMenu.classList.remove('open');
        }
    }

    /**
     * Handle 404 errors
     * @param {string} path - Requested path
     */
    handle404(path) {
        console.warn(`404 - Page not found: ${path}`);
        
        // Show 404 message
        Toast.error('Page not found');
        
        // Redirect to home page
        setTimeout(() => {
            this.navigate('/', true);
        }, 2000);
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        // Implement authentication check if needed
        // For now, always return true since no auth is required
        return true;
    }

    /**
     * Redirect to login page
     * @param {string} returnPath - Path to return to after login
     */
    redirectToLogin(returnPath) {
        console.log('Redirecting to login...');
        // Implement login redirect if authentication is added
    }

    /**
     * Check if link is internal
     * @param {HTMLElement} link - Link element
     * @returns {boolean} True if internal link
     */
    isInternalLink(link) {
        const href = link.getAttribute('href');
        
        if (!href) return false;
        
        // Check if it's an absolute URL
        if (href.startsWith('http://') || href.startsWith('https://')) {
            return href.startsWith(window.location.origin);
        }
        
        // Check if it's a relative URL
        return href.startsWith('/') || href.startsWith('#') || !href.includes(':');
    }

    /**
     * Check if path is internal
     * @param {string} path - Path to check
     * @returns {boolean} True if internal path
     */
    isInternalPath(path) {
        if (!path) return false;
        
        return path.startsWith('/') && !path.startsWith('//');
    }

    /**
     * Get current route
     * @returns {string} Current route path
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Check if currently on specified route
     * @param {string} path - Path to check
     * @returns {boolean} True if on specified route
     */
    isCurrentRoute(path) {
        return this.cleanPath(path) === this.currentRoute;
    }

    /**
     * Get route parameters (for future use with parameterized routes)
     * @param {string} path - Route path
     * @returns {Object} Route parameters
     */
    getRouteParams(path) {
        // Simple implementation - can be enhanced for complex routing
        const params = {};
        
        // Extract query parameters
        const url = new URL(window.location.origin + path);
        url.searchParams.forEach((value, key) => {
            params[key] = value;
        });
        
        return params;
    }

    /**
     * Build URL with parameters
     * @param {string} path - Base path
     * @param {Object} params - Parameters to add
     * @returns {string} Complete URL
     */
    buildUrl(path, params = {}) {
        const url = new URL(window.location.origin + path);
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                url.searchParams.set(key, value);
            }
        });
        
        return url.pathname + url.search;
    }

    /**
     * Refresh current route
     */
    refresh() {
        if (this.currentRoute) {
            this.handleRouteChange(this.currentRoute, false);
        }
    }

    /**
     * Go back in history
     */
    goBack() {
        window.history.back();
    }

    /**
     * Go forward in history
     */
    goForward() {
        window.history.forward();
    }
}

// Make Router available globally
window.Router = Router;

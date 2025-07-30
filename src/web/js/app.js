// Main Application Entry Point
class FreeWaterTipsApp {
    constructor() {
        this.isInitialized = false;
        this.currentPage = 'map';
        this.router = null;
        this.mapPage = null;
        this.contributePage = null;
        this.aboutPage = null;
    }

    async init() {
        try {
            this.showLoading();

            await window.Settings.load();
            console.log('✅ Settings loaded');

            const validation = window.Settings.isConfigured();
            if (!validation.isValid) {
                this.showConfigurationError(validation.errors);
                return;
            }
            console.log('✅ Configuration validated');

            await this.initializeServices();
            await this.initializePages();

            this.initializeRouter();
            this.setupNavigation();
            this.hideLoading();

            this.isInitialized = true;
            console.log('✅ Free Water Tips app initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen) loadingScreen.classList.remove('hidden');
        if (app) app.classList.add('hidden');
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen) loadingScreen.classList.add('hidden');
        if (app) app.classList.remove('hidden');
    }

    showConfigurationError(errors) {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="loading-content">
                    <div style="color: #F44336; font-size: 48px; margin-bottom: 16px;">⚠️</div>
                    <h2 style="color: #F44336;">Configuration Required</h2>
                    <div style="max-width: 500px; text-align: left; margin: 24px auto;">
                        <p>The following configuration is missing:</p>
                        <ul style="margin: 16px 0; padding-left: 20px;">
                            ${errors.map(error => `<li>${error}</li>`).join('')}
                        </ul>
                        <p><strong>For local development:</strong></p>
                        <ol style="margin: 16px 0; padding-left: 20px;">
                            <li>Copy <code>config.example.json</code> to <code>config.json</code></li>
                            <li>Configure your API keys in <code>config.json</code></li>
                            <li>Refresh the page</li>
                        </ol>
                    </div>
                </div>
            `;
        }
    }

    async initializeServices() {
        // Initialize API client
        if (window.ApiClient) {
            window.apiClient = new ApiClient(window.Settings.getApiBaseUrl());
        }

        // Test API connectivity (optional)
        try {
            if (window.apiClient) {
                await window.apiClient.get('/health');
                console.log('✅ API connection successful');
            }
        } catch (error) {
            console.warn('⚠️ API not available:', error.message);
        }
    }

    async initializePages() {
        // Initialize Map Page
        if (window.MapPage) {
            this.mapPage = new MapPage();
            await this.mapPage.init();
        }

        // Initialize Contribute Page
        if (window.ContributePage) {
            this.contributePage = new ContributePage();
            await this.contributePage.init();
        }

        // Initialize About Page
        if (window.AboutPage) {
            this.aboutPage = new AboutPage();
            await this.aboutPage.init();
        }
    }

    initializeRouter() {
        if (window.Router) {
            this.router = new Router({
                'map': () => this.showPage('map'),
                'contribute': () => this.showPage('contribute'),
                'about': () => this.showPage('about')
            });
            
            // Start router
            this.router.init();
        }
    }

    setupNavigation() {
        // Mobile navigation toggle
        const navToggle = document.getElementById('nav-toggle');
        const navOverlay = document.getElementById('nav-overlay');
        
        if (navToggle && navOverlay) {
            navToggle.addEventListener('click', () => {
                console.log('Toggle clicked!');
                navOverlay.classList.toggle('show');
            });
        }

        // Close menu when clicking overlay (but not the content)
        if (navOverlay) {
            navOverlay.addEventListener('click', (e) => {
                // Only close if clicking the overlay itself, not the content
                if (e.target === navOverlay) {
                    navOverlay.classList.remove('show');
                }
            });
        }

        // Close menu when pressing escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navOverlay && navOverlay.classList.contains('show')) {
                navOverlay.classList.remove('show');
            }
        });

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                
                // Close mobile menu when a link is clicked
                if (navOverlay && navOverlay.classList.contains('show')) {
                    navOverlay.classList.remove('show');
                }
                
                if (page) {
                    // Update URL
                    window.location.hash = page;
                }
            });
        });
    }

    showPage(pageName) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('active');
            }
        });

        // Update current page
        this.currentPage = pageName;

        // Trigger page-specific initialization
        if (pageName === 'map' && this.mapPage) {
            this.mapPage.onShow();
        } else if (pageName === 'contribute' && this.contributePage) {
            this.contributePage.onShow();
        } else if (pageName === 'about' && this.aboutPage) {
            this.aboutPage.onShow();
        }
    }

    showError(message) {
        if (window.Toast) {
            Toast.show(message, 'error');
        } else {
            alert(message);
        }
    }

    // Utility method to get current page
    getCurrentPage() {
        return this.currentPage;
    }

    // Utility method to check if app is initialized
    isReady() {
        return this.isInitialized;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.app = new FreeWaterTipsApp();
    
    // Initialize the app
    window.app.init();
});

// Handle page visibility changes (useful for maps)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.app && window.app.isReady()) {
        // Page became visible, refresh if needed
        if (window.app.getCurrentPage() === 'map' && window.app.mapPage) {
            window.app.mapPage.onShow();
        }
    }
});

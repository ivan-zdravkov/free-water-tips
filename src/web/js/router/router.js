class Router {
    constructor() {
        this.routes = new Map();
        this.currentPage = 'map';
        this.init();
    }

    init() {
        // Set up navigation event listeners
        this.setupNavigation();
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            const page = event.state?.page || this.getPageFromHash();
            this.navigateTo(page, false);
        });

        // Handle initial page load
        const initialPage = this.getPageFromHash() || 'map';
        this.navigateTo(initialPage, true);
    }

    setupNavigation() {
        // Get all navigation links
        const navLinks = document.querySelectorAll('.nav-link[data-page]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateTo(page, true);
            });
        });
    }

    getPageFromHash() {
        const hash = window.location.hash.substring(1); // Remove #
        return hash || 'map';
    }

    navigateTo(page, updateHistory = true) {
        if (!page || this.currentPage === page) {
            return;
        }

        console.log(`Navigating to: ${page}`);

        // Hide current page
        const currentPageElement = document.getElementById(`${this.currentPage}-page`);
        if (currentPageElement) {
            currentPageElement.classList.remove('active');
        }

        // Show new page
        const newPageElement = document.getElementById(`${page}-page`);
        if (newPageElement) {
            newPageElement.classList.add('active');
            this.currentPage = page;
        } else {
            console.error(`Page element not found: ${page}-page`);
            return;
        }

        // Update navigation active state
        this.updateNavigation(page);

        // Update URL and browser history
        if (updateHistory) {
            const newUrl = `#${page}`;
            history.pushState({ page }, '', newUrl);
        }

        // Update page title
        this.updatePageTitle(page);

        // Trigger page-specific initialization if needed
        this.initializePage(page);
    }

    updateNavigation(activePage) {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('data-page');
            if (linkPage === activePage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    updatePageTitle(page) {
        const titles = {
            'map': 'Find Water - Free Water Tips',
            'contribute': 'Contribute - Free Water Tips',
            'about': 'About - Free Water Tips'
        };
        
        document.title = titles[page] || 'Free Water Tips';
    }

    initializePage(page) {
        // Initialize page-specific functionality
        switch (page) {
            case 'map':
                if (window.MapPage && typeof window.MapPage.init === 'function') {
                    window.MapPage.init();
                }
                break;
            case 'contribute':
                if (window.ContributePage && typeof window.ContributePage.init === 'function') {
                    window.ContributePage.init();
                }
                break;
            case 'about':
                if (window.AboutPage && typeof window.AboutPage.init === 'function') {
                    window.AboutPage.init();
                }
                break;
        }
    }

    // Public method to programmatically navigate
    goTo(page) {
        this.navigateTo(page, true);
    }

    // Get current page
    getCurrentPage() {
        return this.currentPage;
    }
}

// Initialize router when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.router = new Router();
    });
} else {
    window.router = new Router();
}

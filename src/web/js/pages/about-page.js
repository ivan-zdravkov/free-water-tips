// About Page Component
class AboutPage {
    constructor() {
        this.isLoaded = false;
        this.stats = {
            totalLocations: 0,
            totalContributors: 0,
            countriesServed: 0,
            lastUpdated: null
        };
    }

    /**
     * Initialize the about page
     */
    async init() {
        try {
            // Set up event listeners
            this.setupEventListeners();
            
            // Load statistics
            await this.loadStats();
            
            // Set up animations
            this.setupAnimations();

            this.isLoaded = true;
            console.log('✅ About page initialized');

        } catch (error) {
            console.error('❌ Failed to initialize about page:', error);
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Mobile share links
        const mobileShareLinks = document.querySelectorAll('.mobile-share-link');
        mobileShareLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleShare(e));
        });
    }

    /**
     * Load application statistics
     */
    async loadStats() {
        var stats = {};
        
        try {
            const apiClient = window.apiClient || new ApiClient(window.Settings.getApiBaseUrl());
            stats = await apiClient.getStats();
        } catch (error) {
            console.error('Failed to load stats:', error);
        }

        this.stats = {
            totalLocations: stats.totalLocations || 0,
            totalContributors: stats.totalContributors || 0,
            countriesServed: stats.countriesServed || 0,
            lastUpdated: stats.lastUpdated || new Date().toISOString()
        };

        this.updateStatsDisplay();
    }

    /**
     * Update statistics display
     */
    updateStatsDisplay() {
        // Animate numbers
        this.animateNumber('total-locations', this.stats.totalLocations);
        this.animateNumber('total-contributors', this.stats.totalContributors);
        this.animateNumber('countries-served', this.stats.countriesServed);
        
        // Update last updated date
        const lastUpdatedEl = document.getElementById('last-updated');
        if (lastUpdatedEl && this.stats.lastUpdated) {
            const date = new Date(this.stats.lastUpdated);
            lastUpdatedEl.textContent = `Last updated: ${Utils.formatDate(date)}`;
        }
    }

    /**
     * Animate number counter
     * @param {string} elementId - Element ID to animate
     * @param {number} targetValue - Target number to count to
     */
    animateNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOut);
            element.textContent = Utils.formatNumber(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = Utils.formatNumber(targetValue);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Set up scroll animations
     */
    setupAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe all animatable elements
        const animatableElements = document.querySelectorAll('.animate-on-scroll');
        animatableElements.forEach(el => observer.observe(el));
    }

    /**
     * Handle social sharing
     * @param {Event} event - Click event
     */
    handleShare(event) {
        event.preventDefault();
        
        // Get platform from the clicked element or its parent
        const target = event.target.closest('[data-platform]') || event.target;
        const platform = target.dataset.platform;
        const url = encodeURIComponent(window.location.origin);
        const text = encodeURIComponent('Find free water sources near you with Free Water Tips!');
        
        let shareUrl = '';
        
        switch (platform) {
            case 'twitter':
            case 'x':
                shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${text}%20${url}`;
                break;
            case 'instagram':
                // Instagram doesn't support direct URL sharing, so we'll copy to clipboard
                Utils.copyToClipboard(`${decodeURIComponent(text)} ${window.location.origin}`);
                Toast.success('Link copied! Paste it in your Instagram story or bio.');
                return;
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
                break;
            case 'discord':
                // Discord doesn't support direct URL sharing, so we'll copy to clipboard
                Utils.copyToClipboard(`${decodeURIComponent(text)} ${window.location.origin}`);
                Toast.success('Link copied! Paste it in your Discord channel or DM.');
                return;
            case 'messenger':
                shareUrl = `https://www.facebook.com/dialog/send?link=${url}&app_id=1&redirect_uri=${url}`;
                break;
            case 'viber':
                shareUrl = `viber://forward?text=${text}%20${url}`;
                break;
            case 'reddit':
                shareUrl = `https://www.reddit.com/submit?url=${url}&title=${text}`;
                break;
            case 'share':
            default:
                // Generic share or copy to clipboard
                if (navigator.share) {
                    navigator.share({
                        title: 'Free Water Tips',
                        text: 'Find free water sources near you!',
                        url: window.location.origin
                    }).catch(console.error);
                } else {
                    Utils.copyToClipboard(window.location.origin);
                    Toast.success('Link copied to clipboard!');
                }
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=550,height=400');
        }
    }

    /**
     * Called when page becomes visible
     */
    onShow() {
        // Refresh stats when page becomes visible
        if (this.isLoaded) {
            this.loadStats();
        } else {
            // If not loaded yet, initialize
            this.init();
        }

        // Reset scroll position for better UX
        window.scrollTo(0, 0);
    }
}

// Make AboutPage available globally
window.AboutPage = AboutPage;

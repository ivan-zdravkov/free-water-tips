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
        // FAQ toggles
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => this.toggleFaq(item));
            }
        });

        // Contact form submission
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }

        // Newsletter signup
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSubmit(e));
        }

        // Social sharing buttons
        const shareButtons = document.querySelectorAll('.share-btn');
        shareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleShare(e));
        });

        // Back to top button
        const backToTopBtn = document.getElementById('back-to-top');
        if (backToTopBtn) {
            backToTopBtn.addEventListener('click', () => this.scrollToTop());
            
            // Show/hide based on scroll position
            window.addEventListener('scroll', () => {
                const shouldShow = window.pageYOffset > 300;
                backToTopBtn.style.display = shouldShow ? 'block' : 'none';
            });
        }
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
     * Toggle FAQ item
     * @param {HTMLElement} faqItem - FAQ item element
     */
    toggleFaq(faqItem) {
        const answer = faqItem.querySelector('.faq-answer');
        const question = faqItem.querySelector('.faq-question');
        
        if (!answer || !question) return;

        const isOpen = faqItem.classList.contains('open');
        
        // Close all other FAQ items
        const allFaqItems = document.querySelectorAll('.faq-item');
        allFaqItems.forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('open');
                const otherAnswer = item.querySelector('.faq-answer');
                if (otherAnswer) {
                    otherAnswer.style.maxHeight = '0';
                }
            }
        });

        // Toggle current item
        if (isOpen) {
            faqItem.classList.remove('open');
            answer.style.maxHeight = '0';
        } else {
            faqItem.classList.add('open');
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    }

    /**
     * Handle contact form submission
     * @param {Event} event - Form submit event
     */
    async handleContactSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        try {
            Utils.toggleButtonLoading(submitBtn, true);
            
            const formData = new FormData(form);
            const contactData = {
                name: formData.get('name'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };

            // Validate form data
            if (!this.validateContactForm(contactData)) {
                return;
            }

            // Submit to API
            const apiClient = window.apiClient || new ApiClient(window.Settings.getApiBaseUrl());
            const result = await apiClient.submitContact(contactData);
            
            if (result.success) {
                Toast.success('Thank you for your message! We\'ll get back to you soon.');
                form.reset();
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
            
        } catch (error) {
            console.error('Contact form submission failed:', error);
            Toast.error('Failed to send message. Please try again or email us directly.');
        } finally {
            Utils.toggleButtonLoading(submitBtn, false);
        }
    }

    /**
     * Validate contact form data
     * @param {Object} data - Form data
     * @returns {boolean} True if valid
     */
    validateContactForm(data) {
        if (!data.name || data.name.trim().length < 2) {
            Toast.error('Please enter your full name');
            return false;
        }

        if (!data.email || !Utils.isValidEmail(data.email)) {
            Toast.error('Please enter a valid email address');
            return false;
        }

        if (!data.subject || data.subject.trim().length < 5) {
            Toast.error('Please enter a subject for your message');
            return false;
        }

        if (!data.message || data.message.trim().length < 10) {
            Toast.error('Please enter a message (at least 10 characters)');
            return false;
        }

        return true;
    }

    /**
     * Handle newsletter signup
     * @param {Event} event - Form submit event
     */
    async handleNewsletterSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const emailInput = form.querySelector('input[type="email"]');
        
        try {
            Utils.toggleButtonLoading(submitBtn, true);
            
            const email = emailInput.value.trim();
            
            if (!email || !Utils.isValidEmail(email)) {
                Toast.error('Please enter a valid email address');
                return;
            }

            // Submit to API
            const apiClient = window.apiClient || new ApiClient(window.Settings.getApiBaseUrl());
            const result = await apiClient.subscribeNewsletter(email);
            
            if (result.success) {
                Toast.success('Thank you for subscribing to our newsletter!');
                form.reset();
            } else {
                throw new Error(result.message || 'Subscription failed');
            }
            
        } catch (error) {
            console.error('Newsletter subscription failed:', error);
            
            if (error.message.includes('already subscribed')) {
                Toast.info('You\'re already subscribed to our newsletter!');
            } else {
                Toast.error('Failed to subscribe. Please try again later.');
            }
        } finally {
            Utils.toggleButtonLoading(submitBtn, false);
        }
    }

    /**
     * Handle social sharing
     * @param {Event} event - Click event
     */
    handleShare(event) {
        event.preventDefault();
        
        const platform = event.target.dataset.platform;
        const url = encodeURIComponent(window.location.origin);
        const text = encodeURIComponent('Find free water sources near you with Free Water Tips!');
        
        let shareUrl = '';
        
        switch (platform) {
            case 'twitter':
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
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
                break;
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
     * Scroll to top of page
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * Get application version info
     */
    getVersionInfo() {
        return {
            version: '1.0.0',
            buildDate: '2024-01-15',
            commit: 'abc123f'
        };
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

    /**
     * Get team member information
     */
    getTeamInfo() {
        return [
            {
                name: 'Sarah Johnson',
                role: 'Founder & CEO',
                bio: 'Environmental advocate with 10+ years experience in sustainable technology.',
                avatar: '/images/team/sarah.jpg'
            },
            {
                name: 'Mike Chen',
                role: 'Lead Developer',
                bio: 'Full-stack developer passionate about creating impactful web applications.',
                avatar: '/images/team/mike.jpg'
            },
            {
                name: 'Elena Rodriguez',
                role: 'Community Manager',
                bio: 'Building communities around environmental and social causes.',
                avatar: '/images/team/elena.jpg'
            }
        ];
    }

    /**
     * Get frequently asked questions
     */
    getFaqData() {
        return [
            {
                question: 'Is this service really free?',
                answer: 'Yes! Free Water Tips is completely free to use. We believe access to clean water information should be available to everyone.'
            },
            {
                question: 'How accurate is the location data?',
                answer: 'Our location data is crowd-sourced and verified by our community. We encourage users to report any inaccuracies so we can keep our database up-to-date.'
            },
            {
                question: 'Can I add water sources in my area?',
                answer: 'Absolutely! We rely on community contributions to build our database. You can easily add new water sources through our contribution form.'
            },
            {
                question: 'How do you verify submitted locations?',
                answer: 'All submitted locations go through a moderation process where we verify the information and check for duplicates before adding them to our public database.'
            },
            {
                question: 'What types of water sources do you include?',
                answer: 'We include public water fountains, restaurants and cafes that provide free water, parks with water access, and other publicly accessible clean water sources.'
            },
            {
                question: 'Is my location data private?',
                answer: 'We respect your privacy. Location data is only used to show you nearby water sources and is not stored or shared with third parties.'
            }
        ];
    }
}

// Add CSS for About page animations
const aboutPageStyles = `
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-on-scroll.fade-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .stats-card {
        transition: transform 0.3s ease;
    }
    
    .stats-card:hover {
        transform: translateY(-5px);
    }
    
    .faq-item {
        transition: all 0.3s ease;
    }
    
    .faq-question {
        cursor: pointer;
        transition: color 0.2s ease;
    }
    
    .faq-question:hover {
        color: #2196F3;
    }
    
    .faq-answer {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
    }
    
    .faq-item.open .faq-answer {
        padding-top: 16px;
    }
    
    .share-btn {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .share-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    #back-to-top {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2196F3;
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: background-color 0.3s ease, transform 0.3s ease;
        z-index: 1000;
        display: none;
    }
    
    #back-to-top:hover {
        background: #1976D2;
        transform: scale(1.1);
    }
    
    .version-info {
        font-size: 12px;
        color: #666;
        text-align: center;
        margin-top: 20px;
        padding: 20px;
        border-top: 1px solid #e0e0e0;
    }
`;

// Inject About page styles
const aboutStyleSheet = document.createElement('style');
aboutStyleSheet.textContent = aboutPageStyles;
document.head.appendChild(aboutStyleSheet);

// Make AboutPage available globally
window.AboutPage = AboutPage;

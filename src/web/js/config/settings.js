// Settings Configuration Class
// This class loads configuration from a JSON file
// For local development, copy config.example.json to config.json and fill in your values
// For production, config.json is automatically generated from GitHub Secrets

class Settings {
    constructor() {
        this.config = null;
        this.isLoaded = false;
        this.loadPromise = null;
    }

    /**
     * Load configuration from JSON file
     * @returns {Promise<Object>} Configuration object
     */
    async load() {
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this._loadConfig();
        return this.loadPromise;
    }

    /**
     * Internal method to load configuration
     * @private
     */
    async _loadConfig() {
        try {
            // Try to load from config.json first (local development or production)
            const response = await fetch('./js/config/config.json');
            
            if (response.ok) {
                this.config = await response.json();
            } else {
                // Fallback to example config for development
                console.warn('config.json not found, falling back to example config');
                const fallbackResponse = await fetch('./js/config/config.example.json');
                this.config = await fallbackResponse.json();
            }

            this.isLoaded = true;
            console.log('✅ Settings loaded successfully');
            return this.config;

        } catch (error) {
            console.error('❌ Failed to load configuration:', error);
            
            // Use hardcoded fallback if all else fails
            this.config = {
                GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY',
                API_BASE_URL: 'YOUR_API_BASE_URL',
                ENVIRONMENT: 'development'
            };
            
            this.isLoaded = true;
            return this.config;
        }
    }

    /**
     * Get Google Maps API key
     * @returns {string} API key
     */
    getGoogleMapsApiKey() {
        if (!this.isLoaded) {
            throw new Error('Settings not loaded. Call Settings.load() first.');
        }
        
        const key = this.config.GOOGLE_MAPS_API_KEY;
        if (!key || key === 'YOUR_GOOGLE_MAPS_API_KEY') {
            throw new Error('GOOGLE_MAPS_API_KEY is not configured. Please set up your API key.');
        }
        
        return key;
    }

    /**
     * Get the appropriate API base URL based on environment
     * @returns {string} API base URL
     */
    getApiBaseUrl() {
        if (!this.isLoaded) {
            throw new Error('Settings not loaded. Call Settings.load() first.');
        }

        // In development (localhost), use local API
        if (this.isLocalhost()) {
            return 'http://localhost:7071/api';
        }
        
        // In production, use the configured production URL
        const apiUrl = this.config.API_BASE_URL;
        if (!apiUrl || apiUrl === 'YOUR_API_BASE_URL') {
            throw new Error('API_BASE_URL is not configured for production environment.');
        }
        
        return apiUrl;
    }

    /**
     * Get current environment
     * @returns {string} Environment name
     */
    getEnvironment() {
        if (!this.isLoaded) {
            throw new Error('Settings not loaded. Call Settings.load() first.');
        }

        return this.config.ENVIRONMENT || (this.isLocalhost() ? 'development' : 'production');
    }

    /**
     * Check if running on localhost
     * @returns {boolean} True if localhost
     */
    isLocalhost() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.startsWith('192.168.') ||
               window.location.hostname.endsWith('.local');
    }

    /**
     * Check if running in development mode
     * @returns {boolean} True if development
     */
    isDevelopment() {
        return this.getEnvironment() === 'development' || this.isLocalhost();
    }

    /**
     * Check if running in production mode
     * @returns {boolean} True if production
     */
    isProduction() {
        return this.getEnvironment() === 'production' && !this.isLocalhost();
    }

    /**
     * Check if all required settings are configured
     * @returns {Object} Validation result
     */
    isConfigured() {
        if (!this.isLoaded) {
            return {
                isValid: false,
                missingKeys: ['Settings not loaded'],
                errors: ['Call Settings.load() first']
            };
        }

        const errors = [];
        const missingKeys = [];

        // Check Google Maps API Key
        try {
            this.getGoogleMapsApiKey();
        } catch (error) {
            missingKeys.push('GOOGLE_MAPS_API_KEY');
            errors.push(error.message);
        }

        // Check API URL (only required in production)
        if (!this.isLocalhost()) {
            try {
                this.getApiBaseUrl();
            } catch (error) {
                missingKeys.push('API_BASE_URL');
                errors.push(error.message);
            }
        }

        return {
            isValid: errors.length === 0,
            missingKeys,
            errors,
            environment: this.getEnvironment(),
            isLocalhost: this.isLocalhost()
        };
    }

    /**
     * Get all configuration values (for debugging)
     * @returns {Object} Configuration object
     */
    getAll() {
        if (!this.isLoaded) {
            throw new Error('Settings not loaded. Call Settings.load() first.');
        }

        // Return a copy to prevent modification
        return { ...this.config };
    }

    /**
     * Validate and throw errors for missing configuration
     * @throws {Error} If configuration is invalid
     */
    validate() {
        const validation = this.isConfigured();
        
        if (!validation.isValid) {
            const errorMessage = `Configuration validation failed:\n${validation.errors.join('\n')}`;
            throw new Error(errorMessage);
        }
        
        console.log('✅ Configuration validation passed');
    }
}

// Create and export singleton instance
window.Settings = new Settings();

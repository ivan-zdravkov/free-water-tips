// Map Page Component
class MapPage {
    constructor() {
        this.mapService = null;
        this.apiClient = null;
        this.locations = [];
        this.isLoaded = false;
        this.searchTimeout = null;
    }

    /**
     * Initialize the map page
     */
    async init() {
        try {
            // Initialize services
            this.mapService = new MapService();
            this.apiClient = window.apiClient || new ApiClient(window.Settings.getApiBaseUrl());

            // Initialize Google Maps
            await this.mapService.init('google-map');

            // Set up event listeners
            this.setupEventListeners();

            // Load initial locations
            await this.loadLocations();

            this.isLoaded = true;
            console.log('✅ Map page initialized');

        } catch (error) {
            console.error('❌ Failed to initialize map page:', error);
            Toast.error('Failed to load map. Please check your internet connection and refresh the page.');
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Locate user button
        const locateBtn = document.getElementById('locate-btn');
        if (locateBtn) {
            locateBtn.addEventListener('click', () => this.locateUser());
        }

        // Search toggle button
        const searchToggle = document.getElementById('search-toggle');
        const searchPanel = document.getElementById('search-panel');
        if (searchToggle && searchPanel) {
            searchToggle.addEventListener('click', () => {
                searchPanel.classList.toggle('hidden');
                const searchInput = document.getElementById('search-input');
                if (!searchPanel.classList.contains('hidden') && searchInput) {
                    searchInput.focus();
                }
            });
        }

        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }

        // Search button
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    this.performSearch(searchInput.value);
                }
            });
        }

        // Close location info
        const closeInfo = document.getElementById('close-info');
        if (closeInfo) {
            closeInfo.addEventListener('click', () => {
                this.mapService.closeInfoWindow();
            });
        }
    }

    /**
     * Load water locations from API
     */
    async loadLocations() {
        try {
            console.log('Loading water locations...');
            
            this.locations = await this.apiClient.getLocations();
            
            if (this.locations.length > 0) {
                this.mapService.addLocationMarkers(this.locations);
                console.log(`✅ Loaded ${this.locations.length} water locations`);
            } else {
                console.log('ℹ️ No water locations found');
                Toast.info('No water locations found in your area. Be the first to add one!');
            }

        } catch (error) {
            console.error('❌ Failed to load locations:', error);
            Toast.error('Failed to load water locations. Using sample data.');
            
            // Load sample locations as fallback
            this.locations = this.apiClient.getMockLocations();
            this.mapService.addLocationMarkers(this.locations);
        }
    }

    /**
     * Locate user and show nearby locations
     */
    async locateUser() {
        const locateBtn = document.getElementById('locate-btn');
        
        try {
            // Show loading state
            Utils.toggleButtonLoading(locateBtn, true);

            // Get user location
            const position = await Utils.getCurrentLocation();
            
            // Show user location on map
            this.mapService.showUserLocation(position);

            // Load nearby locations
            await this.loadNearbyLocations(position);

            Toast.success('Location found! Showing nearby water sources.');

        } catch (error) {
            console.error('❌ Failed to get user location:', error);
            Toast.error(error.message || 'Failed to get your location. Please enable location services.');
        } finally {
            Utils.toggleButtonLoading(locateBtn, false);
        }
    }

    /**
     * Load nearby locations based on user position
     * @param {Object} position - User coordinates {lat, lng}
     */
    async loadNearbyLocations(position) {
        try {
            const nearbyLocations = await this.apiClient.getNearbyLocations(
                position.lat, 
                position.lng, 
                5000 // 5km radius
            );

            if (nearbyLocations.length > 0) {
                this.locations = nearbyLocations;
                this.mapService.addLocationMarkers(this.locations);
                
                Toast.success(`Found ${nearbyLocations.length} water source${nearbyLocations.length === 1 ? '' : 's'} nearby!`);
            } else {
                Toast.info('No water sources found nearby. Try expanding your search area.');
            }

        } catch (error) {
            console.error('❌ Failed to load nearby locations:', error);
            Toast.warning('Could not load nearby locations. Showing all available locations.');
        }
    }

    /**
     * Perform search for locations
     * @param {string} query - Search query
     */
    async performSearch(query) {
        const searchResults = document.getElementById('search-results');
        
        if (!query.trim()) {
            if (searchResults) {
                searchResults.innerHTML = '';
            }
            return;
        }

        try {
            console.log('Searching for:', query);

            // Search via API
            const results = await this.apiClient.searchLocations(query);
            
            // Also try Google Places search if available
            if (this.mapService.isApiLoaded()) {
                try {
                    const placeResults = await this.mapService.searchPlaces(query);
                    // Combine and deduplicate results if needed
                    console.log('Google Places results:', placeResults.length);
                } catch (error) {
                    console.warn('Google Places search failed:', error);
                }
            }

            this.displaySearchResults(results);

            if (results.length > 0) {
                this.mapService.addLocationMarkers(results);
            }

        } catch (error) {
            console.error('❌ Search failed:', error);
            Toast.error('Search failed. Please try again.');
        }
    }

    /**
     * Display search results in the search panel
     * @param {Array} results - Search results
     */
    displaySearchResults(results) {
        const searchResults = document.getElementById('search-results');
        if (!searchResults) return;

        if (results.length === 0) {
            searchResults.innerHTML = `
                <div style="padding: 16px; text-align: center; color: #666;">
                    No locations found. Try a different search term.
                </div>
            `;
            return;
        }

        searchResults.innerHTML = results.map(location => `
            <div class="search-result-item" onclick="window.app.mapPage.selectSearchResult('${location.id}')">
                <div class="result-name">${Utils.sanitizeHtml(location.name)}</div>
                <div class="result-address">${Utils.sanitizeHtml(location.address)}</div>
                <div class="result-type">${this.formatLocationType(location.type)}</div>
                ${location.distance ? `<div class="result-distance">${Utils.formatDistance(location.distance)} away</div>` : ''}
            </div>
        `).join('');
    }

    /**
     * Handle search result selection
     * @param {string} locationId - Selected location ID
     */
    selectSearchResult(locationId) {
        const location = this.locations.find(loc => loc.id === locationId);
        if (!location) return;

        // Center map on selected location
        this.mapService.map.setCenter(location.coordinates);
        this.mapService.map.setZoom(16);

        // Show location info
        const marker = this.mapService.markers.find(m => 
            m.getTitle() === location.name
        );
        
        if (marker) {
            this.mapService.showLocationInfo(location, marker);
        }

        // Hide search panel on mobile
        if (Utils.isMobile()) {
            const searchPanel = document.getElementById('search-panel');
            if (searchPanel) {
                searchPanel.classList.add('hidden');
            }
        }
    }

    /**
     * Format location type for display
     * @param {string} type - Location type
     * @returns {string} Formatted type
     */
    formatLocationType(type) {
        const types = {
            'restaurant': 'Restaurant',
            'cafe': 'Cafe',
            'fast-food': 'Fast Food',
            'public-fountain': 'Public Fountain',
            'park': 'Park',
            'library': 'Library',
            'gym': 'Gym',
            'shopping-center': 'Shopping Center',
            'other': 'Other'
        };
        return types[type] || 'Location';
    }

    /**
     * Called when page becomes visible
     */
    onShow() {
        if (this.isLoaded && this.mapService && this.mapService.map) {
            // Trigger map resize to ensure proper rendering
            google.maps.event.trigger(this.mapService.map, 'resize');
            
            // Re-fit bounds if we have markers
            if (this.mapService.markers.length > 0) {
                setTimeout(() => {
                    this.mapService.fitToMarkers();
                }, 100);
            }
        }
    }

    /**
     * Refresh locations data
     */
    async refresh() {
        if (this.isLoaded) {
            await this.loadLocations();
        }
    }
}

// Add CSS for search results
const searchResultStyles = `
    .search-result-item {
        padding: 12px;
        border-bottom: 1px solid #e0e0e0;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }
    
    .search-result-item:hover {
        background-color: #f5f5f5;
    }
    
    .search-result-item:last-child {
        border-bottom: none;
    }
    
    .result-name {
        font-weight: 500;
        color: #333;
        margin-bottom: 4px;
    }
    
    .result-address {
        font-size: 14px;
        color: #666;
        margin-bottom: 4px;
    }
    
    .result-type {
        font-size: 12px;
        color: #2196F3;
        text-transform: uppercase;
        font-weight: 500;
    }
    
    .result-distance {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
    }
    
    .location-address {
        color: #666;
        margin-bottom: 8px;
    }
    
    .location-distance {
        color: #2196F3;
        font-weight: 500;
        margin-bottom: 8px;
    }
    
    .location-rating {
        color: #FF9800;
        margin-bottom: 8px;
    }
    
    .location-description {
        margin-bottom: 16px;
        line-height: 1.4;
    }
    
    .location-features {
        margin-bottom: 16px;
    }
    
    .feature-tag {
        display: inline-block;
        background: #e3f2fd;
        color: #1976d2;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        margin-right: 8px;
        margin-bottom: 4px;
    }
    
    .feature-tag.accessible {
        background: #e8f5e8;
        color: #2e7d32;
    }
    
    .feature-tag.always-open {
        background: #e3f2fd;
        color: #1976d2;
    }
    
    .location-actions {
        display: flex;
        gap: 8px;
    }
`;

// Inject search result styles
const searchResultStyleSheet = document.createElement('style');
searchResultStyleSheet.textContent = searchResultStyles;
document.head.appendChild(searchResultStyleSheet);

// Make MapPage available globally
window.MapPage = MapPage;

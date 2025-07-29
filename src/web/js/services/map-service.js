// Google Maps Service
class MapService {
    constructor() {
        this.map = null;
        this.markers = [];
        this.infoWindow = null;
        this.userLocationMarker = null;
        this.isLoaded = false;
        this.loadPromise = null;
    }

    /**
     * Initialize Google Maps
     * @param {string} containerId - Map container element ID
     * @param {Object} options - Map options
     * @returns {Promise<google.maps.Map>} Google Maps instance
     */
    async init(containerId, options = {}) {
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this.loadGoogleMaps().then(() => {
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Map container with ID '${containerId}' not found`);
            }

            console.log('🗺️ Initializing Google Maps...');
            
            const defaultOptions = {
                center: { lat: 40.7128, lng: -74.0060 }, // New York City
                zoom: 13,
                styles: this.getMapStyles(),
                zoomControl: true,
                mapTypeControl: false,
                scaleControl: true,
                streetViewControl: false,
                rotateControl: false,
                fullscreenControl: true
            };

            this.map = new google.maps.Map(container, { ...defaultOptions, ...options });
            this.infoWindow = new google.maps.InfoWindow();
            this.isLoaded = true;

            console.log('✅ Google Maps initialized successfully');

            // Set up map event listeners
            this.setupMapListeners();

            return this.map;
        }).catch((error) => {
            console.error('❌ Map initialization failed:', error);
            throw error;
        });

        return this.loadPromise;
    }

    /**
     * Load Google Maps JavaScript API
     * @returns {Promise} Promise that resolves when Maps API is loaded
     */
    async loadGoogleMaps() {
        if (window.google && window.google.maps) {
            console.log('✅ Google Maps API already loaded');
            return Promise.resolve();
        }

        const apiKey = window.Settings.getGoogleMapsApiKey();
        console.log('🔑 Using Google Maps API key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT SET');
        
        if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
            throw new Error('Google Maps API key is not configured');
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => {
                console.log('✅ Google Maps API loaded successfully');
                resolve();
            };
            script.onerror = (error) => {
                console.error('❌ Failed to load Google Maps API:', error);
                reject(new Error('Failed to load Google Maps API'));
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Get custom map styles
     * @returns {Array} Map styles array
     */
    getMapStyles() {
        return [
            {
                featureType: 'poi.business',
                stylers: [{ visibility: 'off' }]
            },
            {
                featureType: 'transit',
                elementType: 'labels.icon',
                stylers: [{ visibility: 'off' }]
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#e9e9e9' }]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#9e9e9e' }]
            }
        ];
    }

    /**
     * Set up map event listeners
     */
    setupMapListeners() {
        if (!this.map) return;

        // Handle map clicks
        this.map.addListener('click', (e) => {
            this.closeInfoWindow();
        });

        // Handle zoom changes
        this.map.addListener('zoom_changed', () => {
            console.log('Map zoom changed to:', this.map.getZoom());
        });
    }

    /**
     * Add markers for water locations
     * @param {Array} locations - Array of location objects
     */
    addLocationMarkers(locations) {
        this.clearMarkers();

        locations.forEach(location => {
            const marker = new google.maps.Marker({
                position: location.coordinates,
                map: this.map,
                title: location.name,
                icon: this.getMarkerIcon(location.type),
                animation: google.maps.Animation.DROP
            });

            // Add click listener to show info window
            marker.addListener('click', () => {
                this.showLocationInfo(location, marker);
            });

            this.markers.push(marker);
        });

        // Fit map to show all markers
        if (locations.length > 0) {
            this.fitToMarkers();
        }
    }

    /**
     * Get custom marker icon based on location type
     * @param {string} type - Location type
     * @returns {Object} Marker icon configuration
     */
    getMarkerIcon(type) {
        const iconColor = this.getTypeColor(type);
        
        return {
            url: `https://maps.google.com/mapfiles/ms/icons/${iconColor}-dot.png`,
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 32)
        };
    }

    /**
     * Get color for location type
     * @param {string} type - Location type
     * @returns {string} Color name
     */
    getTypeColor(type) {
        const colors = {
            'restaurant': 'red',
            'cafe': 'orange',
            'fast-food': 'yellow',
            'public-fountain': 'blue',
            'park': 'green',
            'library': 'purple',
            'gym': 'pink',
            'shopping-center': 'ltblue',
            'other': 'gray'
        };
        return colors[type] || 'blue';
    }

    /**
     * Show location information in info window
     * @param {Object} location - Location data
     * @param {google.maps.Marker} marker - Marker instance
     */
    showLocationInfo(location, marker) {
        const content = this.createInfoWindowContent(location);
        
        this.infoWindow.setContent(content);
        this.infoWindow.open(this.map, marker);

        // Also show location details panel
        this.showLocationPanel(location);
    }

    /**
     * Create info window content HTML
     * @param {Object} location - Location data
     * @returns {string} HTML content
     */
    createInfoWindowContent(location) {
        const distance = location.distance ? Utils.formatDistance(location.distance) : '';
        const rating = location.rating ? '★'.repeat(Math.floor(location.rating)) : '';
        
        return `
            <div style="max-width: 250px; padding: 8px;">
                <h3 style="margin: 0 0 8px 0; color: #2196F3;">${Utils.sanitizeHtml(location.name)}</h3>
                <p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">
                    ${Utils.sanitizeHtml(location.address)}
                </p>
                ${distance ? `<p style="margin: 0 0 4px 0; font-size: 14px; color: #666;">${distance} away</p>` : ''}
                ${rating ? `<p style="margin: 0 0 4px 0; font-size: 14px;">${rating}</p>` : ''}
                ${location.description ? `<p style="margin: 8px 0 0 0; font-size: 14px;">${Utils.sanitizeHtml(location.description)}</p>` : ''}
                <div style="margin-top: 8px;">
                    ${location.accessible ? '<span style="background: #4CAF50; color: white; padding: 2px 6px; border-radius: 12px; font-size: 12px; margin-right: 4px;">♿ Accessible</span>' : ''}
                    ${location.alwaysAvailable ? '<span style="background: #2196F3; color: white; padding: 2px 6px; border-radius: 12px; font-size: 12px;">24/7</span>' : ''}
                </div>
            </div>
        `;
    }

    /**
     * Show location details in side panel
     * @param {Object} location - Location data
     */
    showLocationPanel(location) {
        const panel = document.getElementById('location-info');
        const details = document.getElementById('location-details');
        
        if (panel && details) {
            details.innerHTML = this.createLocationPanelContent(location);
            panel.classList.remove('hidden');
        }
    }

    /**
     * Create location panel content HTML
     * @param {Object} location - Location data
     * @returns {string} HTML content
     */
    createLocationPanelContent(location) {
        const distance = location.distance ? Utils.formatDistance(location.distance) : '';
        const rating = location.rating ? '★'.repeat(Math.floor(location.rating)) : '';
        
        return `
            <h3>${Utils.sanitizeHtml(location.name)}</h3>
            <p class="location-address">${Utils.sanitizeHtml(location.address)}</p>
            ${distance ? `<p class="location-distance">${distance} away</p>` : ''}
            ${rating ? `<p class="location-rating">${rating} (${location.rating}/5)</p>` : ''}
            ${location.description ? `<p class="location-description">${Utils.sanitizeHtml(location.description)}</p>` : ''}
            <div class="location-features">
                ${location.accessible ? '<span class="feature-tag accessible">♿ Wheelchair Accessible</span>' : ''}
                ${location.alwaysAvailable ? '<span class="feature-tag always-open">🕐 24/7 Available</span>' : ''}
            </div>
            <div class="location-actions">
                <button class="btn btn-primary" onclick="MapService.getDirections(${location.coordinates.lat}, ${location.coordinates.lng})">
                    <span class="material-icons">directions</span>
                    Get Directions
                </button>
            </div>
        `;
    }

    /**
     * Close info window and location panel
     */
    closeInfoWindow() {
        if (this.infoWindow) {
            this.infoWindow.close();
        }
        
        const panel = document.getElementById('location-info');
        if (panel) {
            panel.classList.add('hidden');
        }
    }

    /**
     * Show user's current location on map
     * @param {Object} position - User's coordinates {lat, lng}
     */
    showUserLocation(position) {
        if (!this.map) return;

        // Remove existing user location marker
        if (this.userLocationMarker) {
            this.userLocationMarker.setMap(null);
        }

        // Create user location marker
        this.userLocationMarker = new google.maps.Marker({
            position: position,
            map: this.map,
            title: 'Your Location',
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(24, 24),
                anchor: new google.maps.Point(12, 12)
            }
        });

        // Center map on user location
        this.map.setCenter(position);
        this.map.setZoom(15);
    }

    /**
     * Clear all markers from map
     */
    clearMarkers() {
        this.markers.forEach(marker => {
            marker.setMap(null);
        });
        this.markers = [];
    }

    /**
     * Fit map bounds to show all markers
     */
    fitToMarkers() {
        if (this.markers.length === 0) return;

        const bounds = new google.maps.LatLngBounds();
        this.markers.forEach(marker => {
            bounds.extend(marker.getPosition());
        });

        // Include user location if available
        if (this.userLocationMarker) {
            bounds.extend(this.userLocationMarker.getPosition());
        }

        this.map.fitBounds(bounds);
        
        // Ensure minimum zoom level
        google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
            if (this.map.getZoom() > 16) {
                this.map.setZoom(16);
            }
        });
    }

    /**
     * Get directions to a location
     * @param {number} lat - Destination latitude
     * @param {number} lng - Destination longitude
     */
    static getDirections(lat, lng) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(url, '_blank');
    }

    /**
     * Search for places using Google Places API
     * @param {string} query - Search query
     * @returns {Promise<Array>} Search results
     */
    async searchPlaces(query) {
        if (!this.map) {
            throw new Error('Map not initialized');
        }

        return new Promise((resolve, reject) => {
            const service = new google.maps.places.PlacesService(this.map);
            const request = {
                query: query,
                fields: ['name', 'geometry', 'formatted_address', 'place_id']
            };

            service.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    resolve(results);
                } else {
                    reject(new Error(`Places search failed: ${status}`));
                }
            });
        });
    }

    /**
     * Get current map center
     * @returns {Object} Center coordinates {lat, lng}
     */
    getCenter() {
        if (!this.map) return null;
        
        const center = this.map.getCenter();
        return {
            lat: center.lat(),
            lng: center.lng()
        };
    }

    /**
     * Check if Maps API is loaded
     * @returns {boolean} True if loaded
     */
    isApiLoaded() {
        return this.isLoaded && window.google && window.google.maps;
    }
}

// Make MapService available globally
window.MapService = MapService;

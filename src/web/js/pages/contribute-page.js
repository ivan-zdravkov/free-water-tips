// Contribute Page Component
class ContributePage {
    constructor() {
        this.form = null;
        this.mapService = null;
        this.selectedLocation = null;
        this.isLoaded = false;
        this.currentStep = 1;
        this.totalSteps = 3;
    }

    /**
     * Initialize the contribute page
     */
    async init() {
        try {
            // Initialize map service for location selection
            this.mapService = new MapService();
            
            // Set up form and event listeners
            this.setupForm();
            this.setupEventListeners();
            
            // Initialize small map for location selection
            await this.initLocationPicker();

            this.isLoaded = true;
            console.log('✅ Contribute page initialized');

        } catch (error) {
            console.error('❌ Failed to initialize contribute page:', error);
            Toast.error('Failed to load contribution form.');
        }
    }

    /**
     * Set up the contribution form
     */
    setupForm() {
        this.form = document.getElementById('contribute-form');
        if (!this.form) {
            console.error('Contribute form not found');
            return;
        }

        // Initialize form validation
        this.setupFormValidation();
        
        // Show first step
        this.showStep(1);
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Step navigation
        const nextButtons = document.querySelectorAll('.next-step');
        const prevButtons = document.querySelectorAll('.prev-step');

        nextButtons.forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });

        prevButtons.forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });

        // Location picker button
        const locationBtn = document.getElementById('pick-location-btn');
        if (locationBtn) {
            locationBtn.addEventListener('click', () => this.openLocationPicker());
        }

        // Use current location button
        const currentLocationBtn = document.getElementById('current-location-btn');
        if (currentLocationBtn) {
            currentLocationBtn.addEventListener('click', () => this.useCurrentLocation());
        }

        // Location type selection
        const typeInputs = document.querySelectorAll('input[name="type"]');
        typeInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handleTypeChange(e));
        });

        // Photo upload
        const photoUpload = document.getElementById('photo-upload');
        if (photoUpload) {
            photoUpload.addEventListener('change', (e) => this.handlePhotoUpload(e));
        }

        // Feature checkboxes
        const featureCheckboxes = document.querySelectorAll('input[name="features"]');
        featureCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateFeaturesSummary());
        });
    }

    /**
     * Initialize location picker map
     */
    async initLocationPicker() {
        try {
            const mapContainer = document.getElementById('location-picker-map');
            if (!mapContainer) return;

            await this.mapService.init('location-picker-map', {
                zoom: 13,
                center: { lat: 37.7749, lng: -122.4194 } // Default to San Francisco
            });

            // Add click listener to map for location selection
            this.mapService.map.addListener('click', (event) => {
                this.selectMapLocation(event.latLng);
            });

            // Try to center on user's location
            try {
                const position = await Utils.getCurrentLocation();
                this.mapService.map.setCenter(position);
            } catch (error) {
                console.log('Could not get user location for map centering');
            }

        } catch (error) {
            console.error('Failed to initialize location picker:', error);
        }
    }

    /**
     * Set up form validation
     */
    setupFormValidation() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    /**
     * Validate a single form field
     * @param {HTMLElement} field - Form field to validate
     */
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (field.type === 'email' && value && !Utils.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }

        // Phone validation
        if (field.type === 'tel' && value && !Utils.isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }

        // URL validation
        if (field.type === 'url' && value && !Utils.isValidUrl(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid URL';
        }

        this.showFieldError(field, isValid ? '' : errorMessage);
        return isValid;
    }

    /**
     * Show field error message
     * @param {HTMLElement} field - Form field
     * @param {string} message - Error message
     */
    showFieldError(field, message) {
        this.clearFieldError(field);

        if (message) {
            field.classList.add('error');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = message;
            
            field.parentNode.appendChild(errorDiv);
        }
    }

    /**
     * Clear field error message
     * @param {HTMLElement} field - Form field
     */
    clearFieldError(field) {
        field.classList.remove('error');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    /**
     * Move to next step
     */
    nextStep() {
        if (this.validateCurrentStep() && this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.showStep(this.currentStep);
        }
    }

    /**
     * Move to previous step
     */
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }

    /**
     * Show specific step
     * @param {number} step - Step number to show
     */
    showStep(step) {
        // Hide all steps
        const steps = document.querySelectorAll('.form-step');
        steps.forEach(stepEl => stepEl.classList.remove('active'));

        // Show current step
        const currentStepEl = document.getElementById(`step-${step}`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }

        // Update progress indicator
        this.updateProgressIndicator(step);

        // Update button states
        this.updateStepButtons(step);
    }

    /**
     * Update progress indicator
     * @param {number} currentStep - Current step number
     */
    updateProgressIndicator(currentStep) {
        const progressSteps = document.querySelectorAll('.progress-step');
        
        progressSteps.forEach((step, index) => {
            const stepNum = index + 1;
            
            if (stepNum < currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepNum === currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }

    /**
     * Update step navigation buttons
     * @param {number} currentStep - Current step number
     */
    updateStepButtons(currentStep) {
        const prevButtons = document.querySelectorAll('.prev-step');
        const nextButtons = document.querySelectorAll('.next-step');
        const submitButton = document.querySelector('.submit-btn');

        // Previous buttons
        prevButtons.forEach(btn => {
            btn.style.display = currentStep > 1 ? 'inline-block' : 'none';
        });

        // Next buttons
        nextButtons.forEach(btn => {
            btn.style.display = currentStep < this.totalSteps ? 'inline-block' : 'none';
        });

        // Submit button
        if (submitButton) {
            submitButton.style.display = currentStep === this.totalSteps ? 'inline-block' : 'none';
        }
    }

    /**
     * Validate current step
     * @returns {boolean} True if current step is valid
     */
    validateCurrentStep() {
        const currentStepEl = document.getElementById(`step-${this.currentStep}`);
        if (!currentStepEl) return true;

        const requiredFields = currentStepEl.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // Step-specific validation
        if (this.currentStep === 1 && !this.selectedLocation) {
            Toast.error('Please select a location for the water source');
            isValid = false;
        }

        return isValid;
    }

    /**
     * Handle location type change
     * @param {Event} event - Change event
     */
    handleTypeChange(event) {
        const type = event.target.value;
        const customTypeInput = document.getElementById('custom-type');
        
        if (customTypeInput) {
            customTypeInput.style.display = type === 'other' ? 'block' : 'none';
            if (type === 'other') {
                customTypeInput.focus();
            }
        }
    }

    /**
     * Open location picker modal
     */
    openLocationPicker() {
        const modal = document.getElementById('location-picker-modal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Trigger map resize
            setTimeout(() => {
                if (this.mapService && this.mapService.map) {
                    google.maps.event.trigger(this.mapService.map, 'resize');
                }
            }, 100);
        }
    }

    /**
     * Close location picker modal
     */
    closeLocationPicker() {
        const modal = document.getElementById('location-picker-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Use current location
     */
    async useCurrentLocation() {
        const btn = document.getElementById('current-location-btn');
        
        try {
            Utils.toggleButtonLoading(btn, true);
            
            const position = await Utils.getCurrentLocation();
            this.selectLocation(position);
            
            Toast.success('Current location selected');
            
        } catch (error) {
            console.error('Failed to get current location:', error);
            Toast.error('Failed to get current location. Please enable location services.');
        } finally {
            Utils.toggleButtonLoading(btn, false);
        }
    }

    /**
     * Select location from map click
     * @param {google.maps.LatLng} latLng - Selected coordinates
     */
    selectMapLocation(latLng) {
        const position = {
            lat: latLng.lat(),
            lng: latLng.lng()
        };
        
        this.selectLocation(position);
        this.closeLocationPicker();
    }

    /**
     * Select a location
     * @param {Object} position - Location coordinates {lat, lng}
     */
    async selectLocation(position) {
        this.selectedLocation = position;
        
        // Update map marker
        if (this.mapService && this.mapService.map) {
            // Clear existing markers
            this.mapService.clearMarkers();
            
            // Add new marker
            const marker = new google.maps.Marker({
                position: position,
                map: this.mapService.map,
                title: 'Selected Location',
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#2196F3',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2
                }
            });
            
            this.mapService.markers = [marker];
            this.mapService.map.setCenter(position);
        }

        // Try to get address from coordinates
        try {
            const address = await this.mapService.reverseGeocode(position);
            this.updateLocationDisplay(address);
        } catch (error) {
            console.warn('Could not get address for location:', error);
            this.updateLocationDisplay(`${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`);
        }
    }

    /**
     * Update location display
     * @param {string} address - Location address or coordinates
     */
    updateLocationDisplay(address) {
        const locationDisplay = document.getElementById('selected-location');
        if (locationDisplay) {
            locationDisplay.textContent = address;
            locationDisplay.style.display = 'block';
        }

        const locationInput = document.getElementById('location-address');
        if (locationInput) {
            locationInput.value = address;
        }
    }

    /**
     * Handle photo upload
     * @param {Event} event - File input change event
     */
    handlePhotoUpload(event) {
        const files = event.target.files;
        const preview = document.getElementById('photo-preview');
        
        if (!preview) return;

        // Clear existing previews
        preview.innerHTML = '';

        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = `Photo ${index + 1}`;
                    img.className = 'preview-image';
                    
                    const container = document.createElement('div');
                    container.className = 'preview-container';
                    container.appendChild(img);
                    
                    // Add remove button
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'remove-photo';
                    removeBtn.innerHTML = '×';
                    removeBtn.onclick = () => this.removePhoto(container, index);
                    
                    container.appendChild(removeBtn);
                    preview.appendChild(container);
                };
                
                reader.readAsDataURL(file);
            }
        });
    }

    /**
     * Remove photo from preview
     * @param {HTMLElement} container - Photo container element
     * @param {number} index - Photo index
     */
    removePhoto(container, index) {
        container.remove();
        
        // Update file input (this is tricky with file inputs)
        const photoUpload = document.getElementById('photo-upload');
        if (photoUpload) {
            // Note: Cannot directly modify files array, would need to use FormData for actual submission
            console.log(`Photo ${index} removed from preview`);
        }
    }

    /**
     * Update features summary
     */
    updateFeaturesSummary() {
        const checkboxes = document.querySelectorAll('input[name="features"]:checked');
        const summary = document.getElementById('features-summary');
        
        if (!summary) return;

        if (checkboxes.length === 0) {
            summary.textContent = 'No special features selected';
            return;
        }

        const features = Array.from(checkboxes).map(cb => cb.value);
        summary.textContent = `Selected features: ${features.join(', ')}`;
    }

    /**
     * Handle form submission
     * @param {Event} event - Form submit event
     */
    async handleFormSubmit(event) {
        event.preventDefault();
        
        if (!this.validateCurrentStep()) {
            return;
        }

        const submitBtn = document.querySelector('.submit-btn');
        
        try {
            Utils.toggleButtonLoading(submitBtn, true);
            
            const formData = new FormData(this.form);
            
            // Add location data
            if (this.selectedLocation) {
                formData.append('latitude', this.selectedLocation.lat);
                formData.append('longitude', this.selectedLocation.lng);
            }

            // Submit to API
            const apiClient = window.apiClient || new ApiClient(window.Settings.getApiBaseUrl());
            const result = await apiClient.submitLocation(formData);
            
            if (result.success) {
                Toast.success('Thank you! Your water source has been submitted for review.');
                this.resetForm();
                
                // Navigate back to map
                setTimeout(() => {
                    if (window.app && window.app.router) {
                        window.app.router.navigate('/');
                    }
                }, 2000);
            } else {
                throw new Error(result.message || 'Submission failed');
            }
            
        } catch (error) {
            console.error('Submission failed:', error);
            Toast.error('Failed to submit water source. Please try again.');
        } finally {
            Utils.toggleButtonLoading(submitBtn, false);
        }
    }

    /**
     * Reset form to initial state
     */
    resetForm() {
        if (this.form) {
            this.form.reset();
        }
        
        this.selectedLocation = null;
        this.currentStep = 1;
        this.showStep(1);
        
        // Clear photo preview
        const preview = document.getElementById('photo-preview');
        if (preview) {
            preview.innerHTML = '';
        }
        
        // Hide location display
        const locationDisplay = document.getElementById('selected-location');
        if (locationDisplay) {
            locationDisplay.style.display = 'none';
        }
        
        // Clear all field errors
        const errorFields = this.form.querySelectorAll('.error');
        errorFields.forEach(field => this.clearFieldError(field));
    }

    /**
     * Called when page becomes visible
     */
    onShow() {
        if (this.isLoaded && this.mapService && this.mapService.map) {
            // Trigger map resize
            setTimeout(() => {
                google.maps.event.trigger(this.mapService.map, 'resize');
            }, 100);
        }
    }
}

// Make ContributePage available globally
window.ContributePage = ContributePage;

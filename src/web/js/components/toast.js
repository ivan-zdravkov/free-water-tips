// Toast Notification Component
class Toast {
    static container = null;
    static toasts = [];

    /**
     * Initialize toast container
     */
    static init() {
        if (!this.container) {
            this.container = document.getElementById('toast-container');
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'toast-container';
                this.container.className = 'toast-container';
                document.body.appendChild(this.container);
            }
        }
    }

    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in milliseconds (0 for persistent)
     * @returns {HTMLElement} Toast element
     */
    static show(message, type = 'info', duration = 4000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getIcon(type)}</span>
                <span class="toast-message">${Utils.sanitizeHtml(message)}</span>
                <button class="toast-close" aria-label="Close">
                    <span class="material-icons">close</span>
                </button>
            </div>
        `;

        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.hide(toast);
        });

        // Add to container
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => {
                this.hide(toast);
            }, duration);
        }

        return toast;
    }

    /**
     * Hide a specific toast
     * @param {HTMLElement} toast - Toast element to hide
     */
    static hide(toast) {
        if (!toast || !toast.parentNode) return;

        toast.classList.add('hiding');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            
            // Remove from toasts array
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
    }

    /**
     * Hide all toasts
     */
    static hideAll() {
        this.toasts.forEach(toast => {
            this.hide(toast);
        });
    }

    /**
     * Get icon for toast type
     * @param {string} type - Toast type
     * @returns {string} Icon HTML
     */
    static getIcon(type) {
        const icons = {
            'success': '<span class="material-icons">check_circle</span>',
            'error': '<span class="material-icons">error</span>',
            'warning': '<span class="material-icons">warning</span>',
            'info': '<span class="material-icons">info</span>'
        };
        return icons[type] || icons.info;
    }

    /**
     * Show success toast
     * @param {string} message - Success message
     * @param {number} duration - Duration in milliseconds
     */
    static success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }

    /**
     * Show error toast
     * @param {string} message - Error message
     * @param {number} duration - Duration in milliseconds (0 for persistent)
     */
    static error(message, duration = 6000) {
        return this.show(message, 'error', duration);
    }

    /**
     * Show warning toast
     * @param {string} message - Warning message
     * @param {number} duration - Duration in milliseconds
     */
    static warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    /**
     * Show info toast
     * @param {string} message - Info message
     * @param {number} duration - Duration in milliseconds
     */
    static info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }
}

// Additional CSS for toast animations
const toastStyles = `
    .toast {
        transform: translateX(100%);
        transition: transform 0.3s ease, opacity 0.3s ease;
        opacity: 0;
    }
    
    .toast.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .toast.hiding {
        transform: translateX(100%);
        opacity: 0;
    }
    
    .toast-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .toast-icon {
        flex-shrink: 0;
    }
    
    .toast-message {
        flex: 1;
        line-height: 1.4;
    }
    
    .toast-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: inherit;
        opacity: 0.7;
        transition: opacity 0.2s ease, background-color 0.2s ease;
    }
    
    .toast-close:hover {
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.1);
    }
    
    .toast-close .material-icons {
        font-size: 18px;
    }
`;

// Inject toast styles
const toastStyleSheet = document.createElement('style');
toastStyleSheet.textContent = toastStyles;
document.head.appendChild(toastStyleSheet);

// Make Toast available globally
window.Toast = Toast;

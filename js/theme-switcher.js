// Theme Switcher JavaScript
class ThemeSwitcher {
    constructor() {
        this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
        this.init();
    }

    init() {
        this.findSwitcher(); // Changed from createSwitcher
        this.applyTheme(this.currentTheme);
        this.bindEvents();
    }

    getSystemTheme() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    getStoredTheme() {
        return localStorage.getItem('theme');
    }

    storeTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.storeTheme(theme);
        this.updateSwitcherIcon();
        
        // Update particle network colors if it exists
        if (window.particleNetwork && window.particleNetwork.config) {
            window.particleNetwork.config.colors = this.getParticleColors(theme);
        }
    }

    getParticleColors(theme) {
        return {
            particles: ['#667eea'],
            connections: '#667eea'
        };
    }

    toggleTheme(event) {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        
        // Check if the browser supports View Transitions
        if (!document.startViewTransition) {
            this.applyTheme(newTheme);
            return;
        }

        // Remove focus from button to prevent style glitches
        if (this.switcherElement) {
            this.switcherElement.blur();
        }

        // Disable CSS transitions during the view transition to prevent flickering
        document.documentElement.classList.add('disable-transitions');
        document.documentElement.style.pointerEvents = 'none';

        // Get click coordinates or center of screen
        const x = event ? event.clientX : window.innerWidth / 2;
        const y = event ? event.clientY : window.innerHeight / 2;
        
        // Calculate distance to the furthest corner
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
            this.applyTheme(newTheme);
        });

        transition.ready.then(() => {
            if (newTheme === 'dark') {
                // Light -> Dark: Expand the new dark layer
                document.documentElement.animate(
                    { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
                    { duration: 500, easing: 'ease-in', pseudoElement: '::view-transition-new(root)' }
                );
            } else {
                // Dark -> Light: Shrink the old dark layer (Reverse effect)
                document.documentElement.animate(
                    { clipPath: [`circle(${endRadius}px at ${x}px ${y}px)`, `circle(0px at ${x}px ${y}px)`] },
                    { duration: 500, easing: 'ease-out', pseudoElement: '::view-transition-old(root)' }
                );
            }
        });

        // Re-enable transitions after the animation is complete
        transition.finished.then(() => {
            document.documentElement.classList.remove('disable-transitions');
            document.documentElement.style.pointerEvents = '';
        });
    }

    findSwitcher() {
        // Find the switcher button that is now hardcoded in the HTML
        this.switcherElement = document.getElementById('theme-switcher');
        if (!this.switcherElement) {
            console.error('Theme switcher button with id "theme-switcher" not found!');
        }
    }

    updateSwitcherIcon() {
        if (!this.switcherElement) return;
        const icon = this.switcherElement.querySelector('i');
        const label = this.switcherElement.querySelector('span');
        
        if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-moon'; // Moon for dark mode
            if (label) label.textContent = 'وضع غامق';
        } else {
            icon.className = 'fas fa-sun'; // Sun for light mode
            if (label) label.textContent = 'وضع فاتح';
        }
    }

    bindEvents() {
        // Click event for switcher
        if (this.switcherElement) {
            this.switcherElement.addEventListener('click', (e) => {
                this.toggleTheme(e);
            });
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!this.getStoredTheme()) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }

        // Keyboard shortcut (Ctrl/Cmd + Shift + T)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }
}

// Initialize theme switcher when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ThemeSwitcher();
});

// Export for use in other scripts
window.ThemeSwitcher = ThemeSwitcher;
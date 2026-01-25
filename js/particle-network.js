// Advanced Interactive Particle Network Animation
class ParticleNetwork {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.connections = [];
        this.mouse = { x: -1000, y: -1000 };
        this.animationId = null;
        this.isVisible = true;
        
        this.config = {
            particleCount: 60,
            particleSpeed: 0.3,
            connectionDistance: 150,
            mouseDistance: 120,
            particleSize: { min: 1, max: 3 },
            colors: {
                particles: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'],
                connections: '#3498db'
            },
            opacity: {
                particle: 0.7,
                connection: 0.2,
                mouseConnection: 0.5
            },
            interactive: true,
            responsive: true
        };
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.createParticles();
        this.bindEvents();
        this.setupIntersectionObserver();
        this.animate();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.8;
        `;
        
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
    }
    
    createParticles() {
        this.particles = [];
        const count = this.config.responsive ? 
            Math.min(this.config.particleCount, Math.floor((this.canvas.width * this.canvas.height) / 15000)) :
            this.config.particleCount;
            
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.config.particleSpeed,
                vy: (Math.random() - 0.5) * this.config.particleSpeed,
                size: Math.random() * (this.config.particleSize.max - this.config.particleSize.min) + this.config.particleSize.min,
                color: this.config.colors.particles[Math.floor(Math.random() * this.config.colors.particles.length)],
                originalColor: null,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.02 + Math.random() * 0.02
            });
        }
        
        // Store original colors
        this.particles.forEach(particle => {
            particle.originalColor = particle.color;
        });
    }
    
    bindEvents() {
        window.addEventListener('resize', this.debounce(() => this.resize(), 250));
        
        if (this.config.interactive) {
            this.container.addEventListener('mousemove', (e) => {
                const rect = this.container.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            });
            
            this.container.addEventListener('mouseleave', () => {
                this.mouse.x = -1000;
                this.mouse.y = -1000;
            });
            
            // Touch support
            this.container.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const rect = this.container.getBoundingClientRect();
                const touch = e.touches[0];
                this.mouse.x = touch.clientX - rect.left;
                this.mouse.y = touch.clientY - rect.top;
            });
            
            this.container.addEventListener('touchend', () => {
                this.mouse.x = -1000;
                this.mouse.y = -1000;
            });
        }
    }
    
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    this.isVisible = entry.isIntersecting;
                });
            }, { threshold: 0.1 });
            
            observer.observe(this.container);
        }
    }
    
    resize() {
        const rect = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.ctx.scale(dpr, dpr);
        
        // Recreate particles if canvas size changed significantly
        if (this.particles.length > 0) {
            this.particles.forEach(particle => {
                if (particle.x > rect.width) particle.x = rect.width;
                if (particle.y > rect.height) particle.y = rect.height;
            });
        }
    }
    
    animate() {
        if (!this.isVisible) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }
        
        const rect = this.container.getBoundingClientRect();
        this.ctx.clearRect(0, 0, rect.width, rect.height);
        
        // Update particles
        this.updateParticles(rect);
        
        // Draw connections
        this.drawConnections();
        
        // Draw mouse connections
        if (this.config.interactive) {
            this.drawMouseConnections();
        }
        
        // Draw particles
        this.drawParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updateParticles(rect) {
        this.particles.forEach(particle => {
            // Update pulse
            particle.pulse += particle.pulseSpeed;
            
            // Move particle
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off edges with some randomness
            if (particle.x < 0 || particle.x > rect.width) {
                particle.vx *= -1;
                particle.vx += (Math.random() - 0.5) * 0.1;
            }
            if (particle.y < 0 || particle.y > rect.height) {
                particle.vy *= -1;
                particle.vy += (Math.random() - 0.5) * 0.1;
            }
            
            // Keep particles within bounds
            particle.x = Math.max(0, Math.min(rect.width, particle.x));
            particle.y = Math.max(0, Math.min(rect.height, particle.y));
            
            // Mouse interaction
            if (this.config.interactive) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.mouseDistance) {
                    const force = (this.config.mouseDistance - distance) / this.config.mouseDistance;
                    const angle = Math.atan2(dy, dx);
                    
                    // Repel particles from mouse
                    particle.x -= Math.cos(angle) * force * 2;
                    particle.y -= Math.sin(angle) * force * 2;
                    
                    // Change color when near mouse
                    particle.color = '#ff6b6b';
                } else {
                    // Restore original color
                    particle.color = particle.originalColor;
                }
            }
        });
    }
    
    drawConnections() {
        this.ctx.strokeStyle = this.config.colors.connections;
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.connectionDistance) {
                    const opacity = (1 - distance / this.config.connectionDistance) * this.config.opacity.connection;
                    this.ctx.globalAlpha = opacity;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    drawMouseConnections() {
        if (this.mouse.x < 0 || this.mouse.y < 0) return;
        
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 1;
        
        this.particles.forEach(particle => {
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.config.mouseDistance) {
                const opacity = (1 - distance / this.config.mouseDistance) * this.config.opacity.mouseConnection;
                this.ctx.globalAlpha = opacity;
                
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(this.mouse.x, this.mouse.y);
                this.ctx.stroke();
            }
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            const pulseSize = particle.size + Math.sin(particle.pulse) * 0.5;
            const pulseOpacity = this.config.opacity.particle + Math.sin(particle.pulse) * 0.1;
            
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = pulseOpacity;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add glow effect
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    // Update colors based on theme
    updateColors(colors) {
        this.config.colors = { ...this.config.colors, ...colors };
        this.particles.forEach((particle, index) => {
            particle.originalColor = this.config.colors.particles[index % this.config.colors.particles.length];
            if (particle.color !== '#ff6b6b') {
                particle.color = particle.originalColor;
            }
        });
    }
    
    // Utility function for debouncing
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Initialize particle network when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const networkContainer = document.getElementById('networkContainer');
    if (networkContainer) {
        window.particleNetwork = new ParticleNetwork(networkContainer);
    }
});
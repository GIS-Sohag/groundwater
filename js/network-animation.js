// Classic Animated Particle Network Background
class ParticleNetwork {
    constructor(containerId = 'networkContainer') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            return;
        }

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        this.particles = [];
        this.mouse = { x: -1000, y: -1000 };
        this.animationId = null;
        this.isVisible = true;
        this.bounds = { width: 0, height: 0 };
        this.dpr = window.devicePixelRatio || 1;
        this.intersectionObserver = null;
        this.touchListenerOptions = { passive: false };

        this.themePalettes = {
            light: {
                particles: ['#667eea'],
                connections: '#667eea'
            },
            dark: {
                particles: ['#667eea'],
                connections: '#667eea'
            }
        };

        this.config = {
            baseParticleCount: 180,
            minParticles: 80,
            areaDivisor: 7000,
            particleSpeed: 0.5,
            particleSize: { min: 1, max: 3 },
            particleOpacity: 0.85,
            connectionOpacity: 0.65,
            mouseConnectionOpacity: 0.6,
            mouseRadius: 190,
            maxDistance: 190,
            glowBlur: 14,
            responsive: true,
            colors: {
                particles: [...this.themePalettes.light.particles],
                connections: this.themePalettes.light.connections
            }
        };

        this.initializeEventHandlers();
        this.resize();
        this.applyThemePalette();
        this.createParticles();
        this.bindEvents();
        this.setupIntersectionObserver();
        this.animate();
    }

    initializeEventHandlers() {
        this.handleResize = this.debounce(() => {
            this.resize();
            this.createParticles();
        }, 120);

        this.handleMouseEnter = () => {
            this.seedMousePosition();
        };

        this.handleMouseMove = (event) => {
            this.updateMouseFromClient(event.clientX, event.clientY);
        };

        this.handleMouseLeave = () => {
            this.resetMouse();
        };

        this.handleTouchStart = (event) => {
            if (event.touches.length === 0) {
                return;
            }

            event.preventDefault();
            const touch = event.touches[0];
            this.updateMouseFromClient(touch.clientX, touch.clientY);
        };

        this.handleTouchMove = (event) => {
            if (event.touches.length === 0) {
                return;
            }

            event.preventDefault();
            const touch = event.touches[0];
            this.updateMouseFromClient(touch.clientX, touch.clientY);
        };

        this.handleTouchEnd = () => {
            this.resetMouse();
        };

        this.handleVisibilityChange = () => {
            if (document.hidden) {
                this.stop();
            } else {
                this.start();
            }
        };

        this.handleThemeChange = () => {
            this.applyThemePalette();
            this.createParticles();
        };
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.bounds.width = rect.width;
        this.bounds.height = rect.height;

        const nextDpr = window.devicePixelRatio || 1;
        if (this.dpr !== nextDpr) {
            this.dpr = nextDpr;
        }

        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(this.dpr, this.dpr);
    }

    applyThemePalette() {
        const palette = this.getPalette();
        this.config.colors.particles = [...palette.particles];
        this.config.colors.connections = palette.connections;
    }

    createParticles() {
        this.particles = [];

        const area = Math.max(this.bounds.width * this.bounds.height, 1);
        const responsiveCount = this.config.responsive
            ? Math.floor(area / this.config.areaDivisor)
            : this.config.baseParticleCount;

        const targetCount = Math.max(this.config.minParticles, Math.min(this.config.baseParticleCount, responsiveCount));

        for (let i = 0; i < targetCount; i++) {
            this.particles.push({
                x: Math.random() * this.bounds.width,
                y: Math.random() * this.bounds.height,
                vx: (Math.random() - 0.5) * this.config.particleSpeed,
                vy: (Math.random() - 0.5) * this.config.particleSpeed,
                size: Math.random() * (this.config.particleSize.max - this.config.particleSize.min) + this.config.particleSize.min,
                color: this.config.colors.particles[Math.floor(Math.random() * this.config.colors.particles.length)],
                originalColor: null,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.02 + Math.random() * 0.02
            });
        }

        this.particles.forEach((particle, index) => {
            const palette = this.config.colors.particles;
            const baseColor = palette[index % palette.length];
            particle.originalColor = baseColor;
            particle.color = baseColor;
        });
    }

    updateMouseFromClient(clientX, clientY) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = clientX - rect.left;
        this.mouse.y = clientY - rect.top;
    }

    seedMousePosition() {
        this.mouse.x = this.bounds.width / 2;
        this.mouse.y = this.bounds.height / 2;
    }

    resetMouse() {
        this.mouse.x = -1000;
        this.mouse.y = -1000;
    }

    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            return;
        }

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                this.isVisible = entry.isIntersecting;
            });
        }, { threshold: 0.1 });

        this.intersectionObserver.observe(this.container);
    }

    updateParticles() {
        this.particles.forEach((particle) => {
            particle.pulse += particle.pulseSpeed;

            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > this.bounds.width) {
                particle.vx *= -1;
                particle.vx += (Math.random() - 0.5) * 0.15;
            }

            if (particle.y < 0 || particle.y > this.bounds.height) {
                particle.vy *= -1;
                particle.vy += (Math.random() - 0.5) * 0.15;
            }

            particle.x = Math.max(0, Math.min(this.bounds.width, particle.x));
            particle.y = Math.max(0, Math.min(this.bounds.height, particle.y));

            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.config.mouseRadius) {
                const force = (this.config.mouseRadius - distance) / this.config.mouseRadius;
                const angle = Math.atan2(dy, dx);

                particle.x -= Math.cos(angle) * force * 2.3;
                particle.y -= Math.sin(angle) * force * 2.3;
                particle.color = '#ff6b6b';
            } else {
                particle.color = particle.originalColor;
            }
        });
    }

    drawParticles() {
        this.particles.forEach((particle) => {
            const pulsedSize = particle.size + Math.sin(particle.pulse) * 0.45;
            const pulsedOpacity = this.config.particleOpacity + Math.sin(particle.pulse) * 0.2;

            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = pulsedOpacity;

            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, pulsedSize, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = this.config.glowBlur;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });

        this.ctx.globalAlpha = 1;
    }

    drawConnections() {
        this.ctx.strokeStyle = this.config.colors.connections;
        this.ctx.lineWidth = 0.7;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.config.maxDistance) {
                    const opacity = (this.config.maxDistance - distance) / this.config.maxDistance * this.config.connectionOpacity;
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
        if (this.mouse.x < 0 || this.mouse.y < 0) {
            return;
        }

        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 1.1;

        this.particles.forEach((particle) => {
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.config.mouseRadius) {
                const opacity = (this.config.mouseRadius - distance) / this.config.mouseRadius * this.config.mouseConnectionOpacity;
                this.ctx.globalAlpha = opacity;

                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(this.mouse.x, this.mouse.y);
                this.ctx.stroke();
            }
        });

        this.ctx.globalAlpha = 1;
    }

    animate() {
        if (!this.isVisible) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }

        this.ctx.clearRect(0, 0, this.bounds.width, this.bounds.height);
        this.updateParticles();
        this.drawConnections();
        this.drawMouseConnections();
        this.drawParticles();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    bindEvents() {
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        document.addEventListener('theme-changed', this.handleThemeChange);

        this.container.addEventListener('mouseenter', this.handleMouseEnter);
        this.container.addEventListener('mousemove', this.handleMouseMove);
        this.container.addEventListener('mouseleave', this.handleMouseLeave);
        this.container.addEventListener('touchstart', this.handleTouchStart, this.touchListenerOptions);
        this.container.addEventListener('touchmove', this.handleTouchMove, this.touchListenerOptions);
        this.container.addEventListener('touchend', this.handleTouchEnd);
    }

    unbindEvents() {
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        document.removeEventListener('theme-changed', this.handleThemeChange);

        this.container.removeEventListener('mouseenter', this.handleMouseEnter);
        this.container.removeEventListener('mousemove', this.handleMouseMove);
        this.container.removeEventListener('mouseleave', this.handleMouseLeave);
        this.container.removeEventListener('touchstart', this.handleTouchStart, this.touchListenerOptions);
        this.container.removeEventListener('touchmove', this.handleTouchMove, this.touchListenerOptions);
        this.container.removeEventListener('touchend', this.handleTouchEnd);
    }

    start() {
        if (!this.animationId) {
            this.animate();
        }
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    getPalette() {
        const theme = document.documentElement.getAttribute('data-theme') || 'light';
        return this.themePalettes[theme] || this.themePalettes.light;
    }

    destroy() {
        this.stop();
        this.unbindEvents();

        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = null;
        }

        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }

    debounce(func, wait) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), wait);
        };
    }
}

let particleNetworkInstance = null;

const initializeParticleNetwork = () => {
    const container = document.getElementById('networkContainer');
    if (!container) {
        return;
    }

    if (particleNetworkInstance) {
        particleNetworkInstance.destroy();
    }

    particleNetworkInstance = new ParticleNetwork();
    window.particleNetwork = particleNetworkInstance; // Expose to window for ThemeSwitcher
};

document.addEventListener('DOMContentLoaded', initializeParticleNetwork);
window.addEventListener('theme-changed', initializeParticleNetwork);

if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', initializeParticleNetwork);
}
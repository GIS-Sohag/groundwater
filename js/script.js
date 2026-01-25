// Global Variables
let map, palestineMap;
let userMarker = null;
let groundwaterLayer = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeNavigation();
    initializeMaps();
    initializeUpload();
    initializeAnimations();
    registerServiceWorker();
    initializeTypewriter();
});

// Register Service Worker for PWA functionality (optional)
function registerServiceWorker() {
    // تم تعطيل Service Worker لتجنب المشاكل
    // يمكن تفعيله لاحقاً إذا أردت
    console.log('Service Worker disabled for compatibility');
}

// Navigation Functions
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinksContainer = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-link');
    const overlay = document.querySelector('.sidebar-overlay');

    function toggleMenu() {
        hamburger.classList.toggle('active');
        if (navLinksContainer) navLinksContainer.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');

        // Prevent body scroll when menu is open
        document.body.style.overflow = (navLinksContainer && navLinksContainer.classList.contains('active')) ? 'hidden' : '';
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        if (navLinksContainer) navLinksContainer.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Mobile menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
    }

    // Close mobile menu when clicking on the overlay
    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 70;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Update active navigation link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;

        if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Map Initialization
function initializeMaps() {
    if (window.skipGlobalMapInit) return;

    if (document.getElementById('map')) {
        initializeGroundwaterMap();
    }
    if (document.getElementById('palestine-map')) {
        initializePalestineMap();
    }
}

function initializeGroundwaterMap() {
    // Initialize main groundwater map using config
    map = L.map('map').setView(CONFIG.map.center, CONFIG.map.zoom);

    // Add base layers using config
    const osmLayer = L.tileLayer(CONFIG.map.layers.osm, {
        attribution: '© OpenStreetMap contributors'
    });

    const satelliteLayer = L.tileLayer(CONFIG.map.layers.satellite, {
        attribution: 'Tiles © Esri'
    });

    // Add default layer
    satelliteLayer.addTo(map);

    // Layer control
    const baseLayers = {
        "خريطة الأقمار الصناعية": satelliteLayer,
        "الخريطة العادية": osmLayer
    };

    L.control.layers(baseLayers).addTo(map);

    // Load groundwater data from GeoJSON file
    loadGroundwaterData();

    // Add locate button functionality
    document.getElementById('locate-btn').addEventListener('click', locateUser);
}

function initializePalestineMap() {
    // Initialize Palestine map using config
    palestineMap = L.map('palestine-map').setView(CONFIG.palestine.center, CONFIG.palestine.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(palestineMap);

    // Add Palestine boundary using config
    L.polygon(CONFIG.palestine.bounds, {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.3,
        weight: 3
    }).addTo(palestineMap);

    // Add Al-Aqsa Mosque marker using config
    L.marker(CONFIG.palestine.alAqsa)
        .addTo(palestineMap)
        .bindPopup('<b>المسجد الأقصى المبارك</b><br>أولى القبلتين وثالث الحرمين الشريفين')
        .openPopup();
}

function addSampleGroundwaterData() {
    // Sample data for demonstration - replace with your actual shapefile data
    const sampleData = [
        {
            coords: [[26.6, 31.6], [26.65, 31.6], [26.65, 31.65], [26.6, 31.65]],
            probability: 'very-high',
            level: 'احتمال عالي جداً'
        },
        {
            coords: [[26.55, 31.7], [26.6, 31.7], [26.6, 31.75], [26.55, 31.75]],
            probability: 'high',
            level: 'احتمال عالي'
        },
        {
            coords: [[26.5, 31.65], [26.55, 31.65], [26.55, 31.7], [26.5, 31.7]],
            probability: 'medium',
            level: 'احتمال متوسط'
        },
        {
            coords: [[26.45, 31.6], [26.5, 31.6], [26.5, 31.65], [26.45, 31.65]],
            probability: 'low',
            level: 'احتمال ضعيف'
        },
        {
            coords: [[26.4, 31.7], [26.45, 31.7], [26.45, 31.75], [26.4, 31.75]],
            probability: 'very-low',
            level: 'احتمال ضعيف جداً'
        }
    ];

    const colors = CONFIG.colors;

    sampleData.forEach(area => {
        const polygon = L.polygon(area.coords, {
            color: colors[area.probability],
            fillColor: colors[area.probability],
            fillOpacity: 0.6,
            weight: 2
        }).addTo(map);

        polygon.bindPopup(`
            <div style="text-align: center; font-family: 'Cairo', sans-serif;">
                <h4 style="margin: 0 0 10px 0; color: ${colors[area.probability]};">
                    ${area.level}
                </h4>
                <p style="margin: 0;">
                    مستوى احتمالية وجود المياه الجوفية في هذه المنطقة
                </p>
            </div>
        `);
    });
}

// Location Functions
function locateUser() {
    const locateBtn = document.getElementById('locate-btn');
    const originalText = locateBtn.innerHTML;

    locateBtn.innerHTML = '<div class="loading"></div> جاري التحديد...';
    locateBtn.disabled = true;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                // Remove previous marker
                if (userMarker) {
                    map.removeLayer(userMarker);
                }

                // Add new marker
                userMarker = L.marker([lat, lng], {
                    icon: L.divIcon({
                        className: 'user-location-marker',
                        html: '<i class="fas fa-map-marker-alt" style="color: #dc2626; font-size: 24px;"></i>',
                        iconSize: [24, 24],
                        iconAnchor: [12, 24]
                    })
                }).addTo(map);

                // Center map on user location
                map.setView([lat, lng], 15);

                // Check groundwater probability at user location
                checkGroundwaterProbability(lat, lng);

                locateBtn.innerHTML = originalText;
                locateBtn.disabled = false;
            },
            (error) => {
                console.error('Error getting location:', error);
                alert('لا يمكن تحديد موقعك. يرجى التأكد من تفعيل خدمة الموقع.');
                locateBtn.innerHTML = originalText;
                locateBtn.disabled = false;
            }
        );
    } else {
        alert('متصفحك لا يدعم خدمة تحديد الموقع.');
        locateBtn.innerHTML = originalText;
        locateBtn.disabled = false;
    }
}

function checkGroundwaterProbability(lat, lng) {
    // This is a simplified check - in reality, you'd query your shapefile data
    // For demonstration, we'll use a simple distance-based calculation

    const samplePoints = [
        { lat: 26.625, lng: 31.625, level: 'احتمال عالي جداً', color: '#dc2626' },
        { lat: 26.575, lng: 31.725, level: 'احتمال عالي', color: '#ea580c' },
        { lat: 26.525, lng: 31.675, level: 'احتمال متوسط', color: '#ca8a04' },
        { lat: 26.475, lng: 31.625, level: 'احتمال ضعيف', color: '#16a34a' },
        { lat: 26.425, lng: 31.725, level: 'احتمال ضعيف جداً', color: '#2563eb' }
    ];

    let closestPoint = samplePoints[0];
    let minDistance = getDistance(lat, lng, closestPoint.lat, closestPoint.lng);

    samplePoints.forEach(point => {
        const distance = getDistance(lat, lng, point.lat, point.lng);
        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
        }
    });

    // Show result popup
    userMarker.bindPopup(`
        <div style="text-align: center; font-family: 'Cairo', sans-serif;">
            <h4 style="margin: 0 0 10px 0; color: ${closestPoint.color};">
                موقعك الحالي
            </h4>
            <p style="margin: 0 0 10px 0;">
                <strong>مستوى الاحتمالية:</strong><br>
                <span style="color: ${closestPoint.color}; font-weight: bold;">
                    ${closestPoint.level}
                </span>
            </p>
            <small style="color: #666;">
                * هذه النتيجة تقريبية بناءً على البيانات المتاحة
            </small>
        </div>
    `).openPopup();
}

function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Upload Functions
function initializeUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');

    if (!uploadArea || !fileInput) return;

    // Drag and drop events
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

function handleFiles(files) {
    const mapsGrid = document.querySelector('.maps-grid');

    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const mapCard = createMapCard(e.target.result, file.name);
                mapsGrid.appendChild(mapCard);
            };
            reader.readAsDataURL(file);
        }
    });
}

function createMapCard(imageSrc, fileName) {
    const mapCard = document.createElement('div');
    mapCard.className = 'map-card fade-in';

    mapCard.innerHTML = `
        <div class="map-image">
            <img src="${imageSrc}" alt="${fileName}" loading="lazy">
            <div class="map-overlay">
                <h3>${fileName.replace(/\.[^/.]+$/, "")}</h3>
                <p>خريطة مضافة حديثاً</p>
            </div>
        </div>
    `;

    return mapCard;
}

// Animation Functions
function initializeAnimations() {
    // Intersection Observer for scroll animations
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

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.map-card, .team-member, .verse-card, .contact-item');
    animatedElements.forEach(el => observer.observe(el));
}

// Hero Typewriter
function initializeTypewriter() {
    const typewriterElement = document.getElementById('typewriter-text');
    if (!typewriterElement) {
        return;
    }

    const messages = [
        'النمذجة المكانية لإحتمالية وجود المياه الجوفية في محافظة سوهاج',
        'باستخدام الجيوماتكس Analytic Hierarchy Process والذكاء الاصطناعي',
        'خريطة تفاعلية تدعم القرار الجغرافي وتخطيط الموارد المائية'
    ];

    const typingSpeed = 60; // ms per character
    const erasingSpeed = 40; // ms per character
    const displayDelay = 2800; // time to wait before erasing
    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const cursor = document.querySelector('.cursor');
    if (cursor) {
        cursor.setAttribute('aria-hidden', 'true');
    }

    function type() {
        const currentMessage = messages[messageIndex];

        // Ensure we're targeting the text span specifically, not replacing the cursor
        if (!isDeleting) {
            typewriterElement.textContent = currentMessage.substring(0, charIndex + 1);
            charIndex++;

            if (charIndex <= currentMessage.length) {
                setTimeout(type, typingSpeed);
            } else {
                isDeleting = true;
                setTimeout(type, displayDelay);
            }
        } else {
            typewriterElement.textContent = currentMessage.substring(0, charIndex - 1);
            charIndex--;

            if (charIndex > 0) {
                setTimeout(type, erasingSpeed);
            } else {
                isDeleting = false;
                messageIndex = (messageIndex + 1) % messages.length;
                setTimeout(type, 500); // Small pause before typing next
            }
        }
    }

    // Start typing
    type();
}

// Utility Functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 70;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Load Groundwater Data Function
function loadGroundwaterData() {
    // Try to load the actual groundwater data, fallback to sample data
    fetch(CONFIG.data.groundwaterFile)
        .then(response => {
            if (!response.ok) {
                throw new Error('Groundwater data not found, using sample data');
            }
            return response.json();
        })
        .then(data => {
            loadGeoJSONData(data);
        })
        .catch(error => {
            console.log('Loading sample data:', error.message);
            // Load sample data as fallback
            fetch(CONFIG.data.sampleFile)
                .then(response => response.json())
                .then(data => {
                    loadGeoJSONData(data);
                })
                .catch(err => {
                    console.error('Error loading sample data:', err);
                    // If even sample data fails, use hardcoded data
                    addSampleGroundwaterData();
                });
        });
}

function loadGeoJSONData(data) {
    if (groundwaterLayer) {
        map.removeLayer(groundwaterLayer);
    }

    const colors = CONFIG.colors;

    groundwaterLayer = L.geoJSON(data, {
        style: (feature) => {
            const probability = feature.properties.probability;
            return {
                color: colors[probability] || '#666',
                fillColor: colors[probability] || '#666',
                fillOpacity: 0.6,
                weight: 2
            };
        },
        onEachFeature: (feature, layer) => {
            const props = feature.properties;
            layer.bindPopup(`
                <div style="text-align: center; font-family: 'Cairo', sans-serif; min-width: 200px;">
                    <h4 style="margin: 0 0 10px 0; color: ${colors[props.probability]};">
                        ${props.level || 'غير محدد'}
                    </h4>
                    <p style="margin: 0 0 10px 0; font-size: 0.9rem;">
                        ${props.description || 'احتمالية وجود المياه الجوفية'}
                    </p>
                    ${props.depth_range ? `<p style="margin: 0 0 5px 0; font-size: 0.8rem;"><strong>العمق المتوقع:</strong> ${props.depth_range}</p>` : ''}
                    ${props.quality ? `<p style="margin: 0; font-size: 0.8rem;"><strong>جودة المياه:</strong> ${props.quality}</p>` : ''}
                </div>
            `);
        }
    }).addTo(map);

    // Fit map to data bounds
    if (data.features && data.features.length > 0) {
        map.fitBounds(groundwaterLayer.getBounds(), { padding: [20, 20] });
    }
}

// Load Shapefile Function (for when you have the actual shapefile)
function loadShapefile(shapefileUrl) {
    fetch(shapefileUrl)
        .then(response => response.json())
        .then(data => {
            loadGeoJSONData(data);
        })
        .catch(error => {
            console.error('Error loading shapefile:', error);
        });
}

// Export functions for global access
window.scrollToSection = scrollToSection;
window.loadShapefile = loadShapefile;
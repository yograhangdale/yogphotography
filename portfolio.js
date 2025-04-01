// Preloader
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    preloader.style.opacity = '0';
    setTimeout(() => preloader.style.display = 'none', 500);
});

// Theme Toggle with Local Storage (Default Dark Mode)
const themeToggle = document.querySelector('.theme-toggle');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
const savedTheme = localStorage.getItem('theme');

// Default dark mode, unless saved theme is light or prefers light
if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    themeToggle.textContent = '🌙';
} else {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
    const isLight = document.body.classList.contains('light-mode');
    themeToggle.textContent = isLight ? '🌙' : '☀️';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// Sound Effects
const playShutter = () => {
    const sound = document.getElementById('shutter-sound');
    sound.currentTime = 0;
    sound.play().catch(() => console.log('Audio play failed')); // Error handling
};
document.querySelectorAll('.btn').forEach(btn => btn.addEventListener('click', playShutter));

// Scroll Animation
const animateOnScroll = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // One-time animation
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
};

// Stats Counter
const animateStats = () => {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            document.querySelectorAll('.stat-number').forEach(stat => {
                const target = +stat.getAttribute('data-target');
                let count = 0;
                const increment = target / 50;
                const updateCount = () => {
                    count += increment;
                    if (count < target) {
                        stat.textContent = Math.ceil(count);
                        requestAnimationFrame(updateCount);
                    } else stat.textContent = target;
                };
                updateCount();
            });
            observer.disconnect(); // Run once
        }
    });
    observer.observe(document.querySelector('.stats'));
};

// 3D Gallery with Lazy Load
const init3DGallery = async () => {
    const token = 'YOUR_INSTAGRAM_TOKEN'; // Replace with your actual token or use env variable
    const api = `https://graph.instagram.com/me/media?fields=id,media_url,permalink&access_token=${token}`;
    const container = document.getElementById('gallery-3d');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / 400, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(container.clientWidth, 400);
    container.appendChild(renderer.domElement);

    try {
        const response = await fetch(api);
        if (!response.ok) throw new Error('API fetch failed');
        const { data } = await response.json();
        const textures = await Promise.all(data.slice(0, 6).map(post => new THREE.TextureLoader().load(post.media_url)));
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const cubes = textures.map((texture, i) => {
            const material = new THREE.MeshBasicMaterial({ map: texture });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.x = (i - 2.5) * 2;
            cube.userData = { url: data[i].permalink };
            scene.add(cube);
            return cube;
        });

        camera.position.z = 8;
        let mouseX = 0;

        // Debounced mousemove
        let timeout;
        container.addEventListener('mousemove', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            }, 10);
        });

        container.addEventListener('click', (e) => {
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1
            );
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(cubes);
            if (intersects.length) window.open(intersects[0].object.userData.url, '_blank');
        });

        const animate = () => {
            requestAnimationFrame(animate);
            cubes.forEach(cube => cube.rotation.y += 0.02 + mouseX * 0.05);
            renderer.render(scene, camera);
        };
        animate();
    } catch (error) {
        console.error('Gallery Error:', error);
        container.innerHTML = '<p>Sorry, unable to load gallery at this time.</p>'; // Fallback
    }
};

// Lazy Load Gallery
const lazyLoadGallery = () => {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            init3DGallery();
            observer.disconnect();
        }
    });
    observer.observe(document.getElementById('portfolio'));
};

// Testimonials Slider
const initTestimonials = () => {
    const items = document.querySelectorAll('.testimonial-item');
    if (!items.length) return;
    let current = 0;
    items[current].classList.add('active');
    setInterval(() => {
        items[current].classList.remove('active');
        current = (current + 1) % items.length;
        items[current].classList.add('active');
    }, 5000);
};

// Booking Form with Validation
document.getElementById('booking-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    const phonePattern = /^[0-9]{10}$/;
    
    if (!phonePattern.test(data.get('phone'))) {
        alert('Please enter a valid 10-digit phone number.');
        return;
    }

    const message = `Booking Request: ${data.get('name')} - ${data.get('phone')} - ${data.get('date')}`;
    window.open(`https://wa.me/7218512969?text=${encodeURIComponent(message)}`, '_blank');
    form.reset();
});

// Client Portal
document.getElementById('portal-login').addEventListener('click', () => {
    const pass = document.getElementById('portal-pass').value;
    if (pass === 'zeta123') {
        document.getElementById('portal-content').style.display = 'block';
    } else {
        alert('Incorrect password!');
    }
});

// Back to Top
const backToTop = document.querySelector('.back-to-top');
window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 300);
});
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Run Everything
document.addEventListener('DOMContentLoaded', () => {
    animateOnScroll();
    animateStats();
    lazyLoadGallery();
    initTestimonials();
});

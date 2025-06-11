// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    console.log('DOM loaded, hamburger:', hamburger, 'navMenu:', navMenu);
    
    // Always set up mobile menu logic - it will only work when hamburger is visible
    if (hamburger && navMenu) {
        let isMenuOpen = false;
        
        function toggleMenu() {
            console.log('toggleMenu called, current state:', isMenuOpen);
            isMenuOpen = !isMenuOpen;
            
            console.log('Before toggle - hamburger classes:', hamburger.className);
            console.log('Before toggle - nav classes:', navMenu.className);
            
            // Try manual class manipulation instead of toggle
            if (isMenuOpen) {
                hamburger.classList.add('active');
                navMenu.classList.add('active');
                console.log('Added active classes manually');
            } else {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                console.log('Removed active classes manually');
            }
            
            console.log('After toggle - hamburger classes:', hamburger.className);
            console.log('After toggle - nav classes:', navMenu.className);
            console.log('Menu toggled, new state:', isMenuOpen, 'hamburger active:', hamburger.classList.contains('active'), 'nav active:', navMenu.classList.contains('active'));
            
            // Prevent body scroll when menu is open
            if (isMenuOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
        
        // Hamburger click handler
        hamburger.addEventListener('click', function(e) {
            console.log('Hamburger clicked!');
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                console.log('Nav link clicked');
                if (isMenuOpen) {
                    toggleMenu();
                }
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (isMenuOpen && !hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                console.log('Clicked outside menu');
                toggleMenu();
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMenuOpen) {
                console.log('Escape key pressed');
                toggleMenu();
            }
        });
        
        // Close menu on window resize (if switching to desktop)
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && isMenuOpen) {
                console.log('Window resized to desktop');
                toggleMenu();
            }
        });
        
        console.log('Mobile menu event listeners set up successfully');
    } else {
        console.error('Hamburger or nav menu not found:', { hamburger, navMenu });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Add loading animation to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.href && this.href.startsWith('mailto:')) {
                // For mailto links, don't add loading state
                return;
            }
            
            // Add loading state
            const originalText = this.textContent;
            this.textContent = 'Loading...';
            this.style.pointerEvents = 'none';
            
            // Reset after a short delay (for demo purposes)
            setTimeout(() => {
                this.textContent = originalText;
                this.style.pointerEvents = 'auto';
            }, 2000);
        });
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .value-card, .about-text, .about-image').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Add hover effects to feature cards
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add parallax effect to hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }
    
    // Form validation (if forms are added later)
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const inputs = this.querySelectorAll('input[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#ff4444';
                } else {
                    input.style.borderColor = '#ddd';
                }
            });
            
            if (isValid) {
                // Form is valid, you can submit here
                console.log('Form is valid, submitting...');
            }
        });
    });
});

// Utility functions
function debounce(func, wait) {
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

// Optimize scroll performance
const optimizedScrollHandler = debounce(function() {
    // Scroll-based animations and effects
}, 10);

window.addEventListener('scroll', optimizedScrollHandler);

// Interactive Neural Network Shader Effect
class NeuralShaderEffect {
    constructor() {
        this.canvas = document.getElementById('shader-canvas');
        if (!this.canvas) {
            console.error('Shader canvas not found');
            return;
        }
        
        this.gl = this.canvas.getContext('webgl');
        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }
        
        console.log('Initializing neural shader effect...');
        
        this.mouse = { x: 0.5, y: 0.5 };
        this.time = 0;
        
        this.init();
        this.bindEvents();
        this.render();
    }
    
    init() {
        // Set canvas size
        this.resize();
        
        // Create shaders
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `);
        
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, `
            precision mediump float;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;
            uniform float u_time;
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                
                // Base background for the shader (matching the hero section gradient)
                vec3 color1 = vec3(0.29, 0.24, 0.55); // #4A3C8B
                vec3 color2 = vec3(0.42, 0.36, 0.91); // #6C5CE7
                vec3 finalColor = mix(color1, color2, uv.x * 0.7 + uv.y * 0.3); // Mix based on UV for gradient
                
                // Mouse interaction - glowing cursor
                float mouseDist = distance(uv, u_mouse);
                float mouseGlow = smoothstep(0.3, 0.0, mouseDist) * 0.4; // Reverted to previous fade and intensity
                finalColor += mouseGlow * vec3(0.48, 0.38, 1.0);
                
                gl_FragColor = vec4(finalColor, 1.0); // Make shader fully opaque
            }
        `);
        
        if (!vertexShader || !fragmentShader) {
            console.error('Failed to create shaders');
            return;
        }
        
        // Create program
        this.program = this.createProgram(vertexShader, fragmentShader);
        if (!this.program) {
            console.error('Failed to create program');
            return;
        }
        
        // Get attribute and uniform locations
        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
        this.mouseLocation = this.gl.getUniformLocation(this.program, 'u_mouse');
        this.timeLocation = this.gl.getUniformLocation(this.program, 'u_time');
        
        // Create buffer
        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1,
        ]);
        
        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
        
        console.log('Neural shader initialized successfully');
    }
    
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking error:', this.gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }
    
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        
        // Use document-level mouse tracking to ensure we get all mouse events
        document.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) / rect.width;
            this.mouse.y = 1.0 - (e.clientY - rect.top) / rect.height;
        });
        
        document.addEventListener('mouseleave', () => {
            this.mouse.x = 0.5;
            this.mouse.y = 0.5;
        });
    }
    
    render() {
        if (!this.program) return;
        
        this.time += 0.016; // ~60fps
        
        this.gl.useProgram(this.program);
        
        // Set uniforms
        this.gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);
        this.gl.uniform2f(this.mouseLocation, this.mouse.x, this.mouse.y);
        this.gl.uniform1f(this.timeLocation, this.time);
        
        // Set attributes
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        // Draw
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        
        requestAnimationFrame(() => this.render());
    }
}

// Initialize neural shader effect when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing neural shader...');
    new NeuralShaderEffect();
}); 
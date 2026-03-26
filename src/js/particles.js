/**
 * Particle Network Animation
 * ---------------------------
 * Full-viewport canvas animation that renders floating particles connected
 * by proximity lines. Particles react to mouse movement by being pushed away
 * within a configurable radius, creating an interactive background effect.
 *
 * Architecture:
 *   - Each Particle has position, velocity, size, color, and a density value
 *     that controls how strongly it reacts to the mouse repulsion force.
 *   - The animation loop (requestAnimationFrame) updates positions, applies
 *     mouse interaction forces, draws particles with a subtle glow, and
 *     renders connection lines between nearby particles.
 *   - On window resize, the canvas is re-dimensioned and particles are
 *     re-initialized to fill the new viewport.
 *
 * Performance notes:
 *   - Particle count is capped at 100 and scales with viewport area.
 *   - shadowBlur is reset to 0 after each particle draw to avoid
 *     compounding GPU cost across the frame.
 *   - Connection distance is reduced on mobile (< 768px) to limit
 *     the number of line draws.
 */

(function () {
    'use strict';

    // ---- Canvas Setup ----

    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];

    // ---- Configuration ----

    const CONFIG = {
        // Scale particle count by viewport area, capped for performance
        maxParticles: 100,
        particlesPerPixel: 1 / 8000,

        // Mouse repulsion radius in pixels
        mouseRadius: 150,

        // Particle appearance
        minSize: 0.5,
        maxSize: 2.5,
        glowBlur: 10,

        // Movement speed range (-0.5 to 0.5)
        maxSpeed: 0.5,

        // Mouse repulsion strength multiplier (higher = stronger push)
        maxDensity: 30,

        // Connection lines
        connectionDistanceDesktop: 150,
        connectionDistanceMobile: 100,
        connectionLineWidth: 0.5,

        // Brand colors: white, STPRO pink, dark grey
        colors: ['#ffffff', '#fb209f', '#4a4a4a'],
    };

    // ---- Mouse Tracking ----

    const mouse = { x: null, y: null };

    window.addEventListener('mousemove', function (e) {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    // Reset mouse position when cursor leaves the window to prevent
    // particles from clustering at the last known mouse position.
    window.addEventListener('mouseout', function () {
        mouse.x = null;
        mouse.y = null;
    });

    // ---- Particle Class ----

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * (CONFIG.maxSize - CONFIG.minSize) + CONFIG.minSize;
            this.density = Math.random() * CONFIG.maxDensity + 1;

            // Random velocity vector
            this.vx = (Math.random() - 0.5) * CONFIG.maxSpeed * 2;
            this.vy = (Math.random() - 0.5) * CONFIG.maxSpeed * 2;

            this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
        }

        /** Render the particle as a glowing circle. */
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = CONFIG.glowBlur;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        /** Move the particle and apply mouse repulsion force. */
        update() {
            // Apply velocity
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off viewport edges
            if (this.x < 0 || this.x > width) this.vx = -this.vx;
            if (this.y < 0 || this.y > height) this.vy = -this.vy;

            // Mouse repulsion: push particles away from cursor
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < CONFIG.mouseRadius) {
                    // Force falls off linearly with distance
                    const force = (CONFIG.mouseRadius - distance) / CONFIG.mouseRadius;
                    this.x -= (dx / distance) * force * this.density;
                    this.y -= (dy / distance) * force * this.density;
                }
            }
        }
    }

    // ---- Particle Pool ----

    function initParticles() {
        const count = Math.min(
            Math.floor(width * height * CONFIG.particlesPerPixel),
            CONFIG.maxParticles
        );
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    // ---- Dot Pattern Background ----
    // Pre-rendered to an offscreen canvas at native device resolution, then
    // drawn as a single drawImage per frame. Using an offscreen full-size
    // canvas instead of createPattern or CSS background because Safari macOS
    // has issues with both approaches (opaque GPU compositing for CSS,
    // unreliable createPattern for tiny tiles).

    let dotsCanvas = null;

    function createDotsBuffer() {
        const dpr = window.devicePixelRatio || 1;
        const spacing = 8;
        const dotRadius = 0.8;

        dotsCanvas = document.createElement('canvas');
        dotsCanvas.width = width * dpr;
        dotsCanvas.height = height * dpr;
        const dCtx = dotsCanvas.getContext('2d');
        dCtx.scale(dpr, dpr);

        // Black fill
        dCtx.fillStyle = '#000';
        dCtx.fillRect(0, 0, width, height);

        // Draw dot grid
        dCtx.fillStyle = '#555';
        for (let x = spacing / 2; x < width; x += spacing) {
            for (let y = spacing / 2; y < height; y += spacing) {
                dCtx.beginPath();
                dCtx.arc(x, y, dotRadius, 0, Math.PI * 2);
                dCtx.fill();
            }
        }
    }

    // ---- Canvas Resize ----

    function initCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.scale(dpr, dpr);
        width = window.innerWidth;
        height = window.innerHeight;
        createDotsBuffer();
        initParticles();
    }

    window.addEventListener('resize', initCanvas);

    // ---- Animation Loop ----

    function animate() {
        // Draw pre-rendered dot background (clears previous frame)
        ctx.drawImage(dotsCanvas, 0, 0, width, height);

        const connectionDist = width < 768
            ? CONFIG.connectionDistanceMobile
            : CONFIG.connectionDistanceDesktop;

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // Draw connection lines to nearby particles.
            // Only check j > i to avoid duplicate lines.
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDist) {
                    // Opacity fades as distance increases
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / connectionDist})`;
                    ctx.lineWidth = CONFIG.connectionLineWidth;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    // ---- Bootstrap ----

    initCanvas();
    animate();
})();

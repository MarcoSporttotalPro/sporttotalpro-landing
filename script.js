const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Mouse tracking
let mouse = {
    x: null,
    y: null,
    radius: 150 // Interaction radius
};

window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Avoid particles getting stuck when mouse leaves
window.addEventListener('mouseout', function () {
    mouse.x = null;
    mouse.y = null;
});

// Resize canvas and re-init particles
function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
}

window.addEventListener('resize', initCanvas);

// Setup particle parameters
const particleCount = Math.min(Math.floor(window.innerWidth * window.innerHeight / 8000), 100);
const colors = ['#ffffff', '#fb209f', '#4a4a4a'];

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;

        // Random velocity
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;

        // Color selection
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;

        // Add subtle glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;

        ctx.fill();
        ctx.shadowBlur = 0; // Reset for performance
    }

    update() {
        // Continuous movement
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        // Mouse interaction
        if (mouse.x != null && mouse.y != null) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;

            let maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance;

            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            if (distance < mouse.radius) {
                // Push particles away
                this.x -= directionX;
                this.y -= directionY;
            }
        }
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        // Check connections
        for (let j = i; j < particles.length; j++) {
            let dx = particles[i].x - particles[j].x;
            let dy = particles[i].y - particles[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            // Link distance depending on screen size
            let connectionDistance = width < 768 ? 100 : 150;

            if (distance < connectionDistance) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / connectionDistance})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animate);
}

// Initialize
initCanvas();
animate();

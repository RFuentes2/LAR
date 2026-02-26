import React, { useEffect, useRef } from 'react';

const ConstellationBackground = ({ theme = 'dark' }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        const mouse = { x: null, y: null, radius: 180 };

        const colors = ['#FF6B35', '#FFFFFF', '#FF8C61', '#E8E8E8'];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.baseVx = (Math.random() - 0.5) * 0.5;
                this.baseVy = (Math.random() - 0.5) * 0.5;
                this.vx = this.baseVx;
                this.vy = this.baseVy;
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            update() {
                // Mouse interaction - Push particles away
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        this.vx -= dx * force * 0.05;
                        this.vy -= dy * force * 0.05;
                    }
                }

                // Friction and return to base velocity
                this.vx *= 0.95;
                this.vy *= 0.95;

                this.x += this.vx + this.baseVx;
                this.y += this.vy + this.baseVy;

                // Boundary check
                if (this.x < 0 || this.x > canvas.width) this.baseVx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.baseVy *= -1;
            }
        }

        const init = () => {
            particles = [];
            // Optimization: Lower particle density for better performance
            const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const connect = () => {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a + 1; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const distance = dx * dx + dy * dy; // Use squared distance to avoid Math.sqrt

                    if (distance < 150 * 150) {
                        ctx.beginPath();
                        const opacity = 1 - Math.sqrt(distance) / 150;
                        ctx.strokeStyle = theme === 'dark'
                            ? `rgba(255, 107, 53, ${opacity * 0.5})`
                            : `rgba(84, 165, 123, ${opacity * 0.2})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            connect();
            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);

        // Use debouncing for mousemove if needed, but for now let's just keep it simple
        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 transform-gpu"
            style={{
                opacity: theme === 'dark' ? 0.6 : 0.3,
                willChange: 'opacity'
            }}
        />
    );
};

export default ConstellationBackground;

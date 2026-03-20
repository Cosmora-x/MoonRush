import React, { useEffect, useRef, useState } from 'react';
import { Heart, Gem, Trophy, Play, RotateCcw, Home } from 'lucide-react';

interface GameCanvasProps {
  onGameOver: (score: number) => void;
}

export default function GameCanvas({ onGameOver }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Game Constants
    const GRAVITY = 0.18;
    const JUMP_STRENGTH = -7.5;
    const GROUND_HEIGHT = 60;
    const ROVER_WIDTH = 70;
    const ROVER_HEIGHT = 45;
    
    // Game State
    let animationFrameId: number;
    let gameSpeed = 3.5;
    let distance = 0;
    let currentScore = 0;
    let currentHealth = 3;
    let isGameOver = false;

    // Entities
    const rover = {
      x: 100,
      y: canvas.height - GROUND_HEIGHT - ROVER_HEIGHT,
      width: ROVER_WIDTH,
      height: ROVER_HEIGHT,
      vy: 0,
      isGrounded: true,
      wheelAngle: 0,
      invulnerableTimer: 0,
    };

    interface Obstacle {
      x: number;
      y: number;
      width: number;
      height: number;
      passed: boolean;
      type: 'rock' | 'crater';
    }

    interface Collectible {
      x: number;
      y: number;
      width: number;
      height: number;
      collected: boolean;
    }

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
      size: number;
    }

    let obstacles: Obstacle[] = [];
    let collectibles: Collectible[] = [];
    let particles: Particle[] = [];
    let stars: {x: number, y: number, size: number, speed: number}[] = [];

    // Initialize stars
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height - GROUND_HEIGHT),
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.5 + 0.1
      });
    }

    // Input handling
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && rover.isGrounded && !isGameOver) {
        rover.vy = JUMP_STRENGTH;
        rover.isGrounded = false;
        createParticles(rover.x + rover.width / 2, rover.y + rover.height, 10, '#888');
      }
    };

    const handleTouch = () => {
      if (rover.isGrounded && !isGameOver) {
        rover.vy = JUMP_STRENGTH;
        rover.isGrounded = false;
        createParticles(rover.x + rover.width / 2, rover.y + rover.height, 10, '#888');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('mousedown', handleTouch);

    // Helper functions
    const spawnObstacle = () => {
      const type = Math.random() > 0.5 ? 'rock' : 'crater';
      const width = type === 'rock' ? 40 + Math.random() * 20 : 60 + Math.random() * 40;
      const height = type === 'rock' ? 30 + Math.random() * 20 : 20;
      
      obstacles.push({
        x: canvas.width,
        y: type === 'rock' ? canvas.height - GROUND_HEIGHT - height : canvas.height - GROUND_HEIGHT,
        width,
        height,
        passed: false,
        type
      });
    };

    const spawnCollectible = () => {
      collectibles.push({
        x: canvas.width,
        y: canvas.height - GROUND_HEIGHT - 80 - Math.random() * 100,
        width: 35,
        height: 35,
        collected: false
      });
    };

    const createParticles = (x: number, y: number, count: number, color: string) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5 - 2,
          life: 1,
          maxLife: 20 + Math.random() * 20,
          color,
          size: Math.random() * 4 + 2
        });
      }
    };

    const checkCollision = (rect1: any, rect2: any) => {
      // Slightly smaller hitbox for fairness
      const padding = 5;
      return (
        rect1.x + padding < rect2.x + rect2.width - padding &&
        rect1.x + rect1.width - padding > rect2.x + padding &&
        rect1.y + padding < rect2.y + rect2.height - padding &&
        rect1.y + rect1.height - padding > rect2.y + padding
      );
    };

    // Main Game Loop
    let lastTime = performance.now();
    let obstacleTimer = 0;
    let collectibleTimer = 0;

    const update = (time: number) => {
      if (isGameOver || isPaused) {
        animationFrameId = requestAnimationFrame(update);
        return;
      }

      const deltaTime = time - lastTime;
      lastTime = time;

      // Increase difficulty
      distance += gameSpeed;
      if (distance % 1000 < gameSpeed) {
        gameSpeed += 0.1;
      }

      // Update Rover
      rover.vy += GRAVITY;
      rover.y += rover.vy;
      rover.wheelAngle += gameSpeed * 0.1;

      if (rover.invulnerableTimer > 0) {
        rover.invulnerableTimer -= deltaTime;
      }

      // Ground collision
      if (rover.y + rover.height >= canvas.height - GROUND_HEIGHT) {
        rover.y = canvas.height - GROUND_HEIGHT - rover.height;
        rover.vy = 0;
        rover.isGrounded = true;
      }

      // Spawning logic
      obstacleTimer += deltaTime;
      if (obstacleTimer > 2000 + Math.random() * 1500 - (gameSpeed * 100)) {
        spawnObstacle();
        obstacleTimer = 0;
      }

      collectibleTimer += deltaTime;
      if (collectibleTimer > 2500 + Math.random() * 2000) {
        spawnCollectible();
        collectibleTimer = 0;
      }

      // Update Obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= gameSpeed;

        if (!obs.passed && obs.x + obs.width < rover.x) {
          obs.passed = true;
          currentScore += 10; // Passive score for surviving
          setScore(currentScore);
        }

        if (checkCollision(rover, obs) && rover.invulnerableTimer <= 0) {
          currentHealth -= 1;
          setHealth(currentHealth);
          rover.invulnerableTimer = 1500; // 1.5s invulnerability
          createParticles(rover.x + rover.width/2, rover.y + rover.height/2, 30, '#ff4444');
          
          if (currentHealth <= 0) {
            isGameOver = true;
            setTimeout(() => onGameOver(currentScore), 1000);
          }
        }

        if (obs.x + obs.width < 0) {
          obstacles.splice(i, 1);
        }
      }

      // Update Collectibles
      for (let i = collectibles.length - 1; i >= 0; i--) {
        const col = collectibles[i];
        col.x -= gameSpeed;

        if (!col.collected && checkCollision(rover, col)) {
          col.collected = true;
          currentScore += 50; // Ping score
          setScore(currentScore);
          createParticles(col.x + col.width/2, col.y + col.height/2, 15, '#44ff44');
          collectibles.splice(i, 1);
          continue;
        }

        if (col.x + col.width < 0) {
          collectibles.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += GRAVITY * 0.5;
        p.life++;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      // Update Stars
      stars.forEach(star => {
        star.x -= star.speed;
        if (star.x < 0) star.x = canvas.width;
      });

      draw(ctx);
      animationFrameId = requestAnimationFrame(update);
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
      // Clear canvas
      ctx.fillStyle = '#0f172a'; // Dark slate background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Stars
      ctx.fillStyle = '#ffffff';
      stars.forEach(star => {
        ctx.globalAlpha = Math.random() * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw Moon Surface (Ground)
      ctx.fillStyle = '#475569'; // Slate 600
      ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
      
      // Draw ground texture/craters moving
      ctx.fillStyle = '#334155'; // Slate 700
      for (let i = 0; i < canvas.width; i += 100) {
        const xPos = (i - (distance % 100));
        ctx.beginPath();
        ctx.ellipse(xPos + 50, canvas.height - GROUND_HEIGHT + 20, 30, 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Obstacles
      obstacles.forEach(obs => {
        if (obs.type === 'rock') {
          ctx.fillStyle = '#64748b'; // Slate 500
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width / 2, obs.y);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.fill();
          
          // Rock highlight
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width * 0.2, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width / 2, obs.y + obs.height * 0.2);
          ctx.lineTo(obs.x + obs.width * 0.6, obs.y + obs.height);
          ctx.fill();
        } else {
          // Crater
          ctx.fillStyle = '#1e293b'; // Slate 800
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.width/2, obs.y + 10, obs.width/2, 15, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Collectibles (Gems)
      collectibles.forEach(col => {
        ctx.save();
        ctx.translate(col.x + col.width/2, col.y + col.height/2);
        
        // Floating effect
        const floatOffset = Math.sin(distance * 0.05 + col.x) * 5;
        ctx.translate(0, floatOffset);
        
        ctx.rotate(distance * 0.02);
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#34d399';
        
        // Outer crystal
        ctx.fillStyle = '#059669'; // Emerald 600
        ctx.beginPath();
        ctx.moveTo(0, -col.height/2);
        ctx.lineTo(col.width/2, 0);
        ctx.lineTo(0, col.height/2);
        ctx.lineTo(-col.width/2, 0);
        ctx.fill();
        
        ctx.shadowBlur = 0; // Reset shadow
        
        // Inner crystal facets
        ctx.fillStyle = '#34d399'; // Emerald 400
        ctx.beginPath();
        ctx.moveTo(0, -col.height/2);
        ctx.lineTo(col.width/3, 0);
        ctx.lineTo(0, col.height/3);
        ctx.lineTo(-col.width/3, 0);
        ctx.fill();

        // Core highlight
        ctx.fillStyle = '#a7f3d0'; // Emerald 200
        ctx.beginPath();
        ctx.moveTo(0, -col.height/4);
        ctx.lineTo(col.width/6, 0);
        ctx.lineTo(0, col.height/6);
        ctx.lineTo(-col.width/6, 0);
        ctx.fill();
        
        ctx.restore();
      });

      // Draw Particles
      particles.forEach(p => {
        ctx.globalAlpha = 1 - (p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // Draw Rover
      if (rover.invulnerableTimer <= 0 || Math.floor(rover.invulnerableTimer / 100) % 2 === 0) {
        ctx.save();
        ctx.translate(rover.x, rover.y);
        
        // Camera Mast (Antenna)
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rover.width - 20, 10);
        ctx.lineTo(rover.width - 15, -15);
        ctx.stroke();
        // Camera head
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(rover.width - 18, -20, 10, 6);
        ctx.fillStyle = '#ef4444'; // Red lens
        ctx.beginPath();
        ctx.arc(rover.width - 13, -17, 2, 0, Math.PI * 2);
        ctx.fill();

        // RTG (Power source) at back
        ctx.fillStyle = '#475569';
        ctx.fillRect(5, 5, 15, 15);
        // RTG fins
        ctx.fillStyle = '#94a3b8';
        for(let j=0; j<4; j++) {
            ctx.fillRect(3, 7 + j*3, 19, 1);
        }

        // Main Body (White/Silver)
        ctx.fillStyle = '#f8fafc'; // Slate 50
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(15, 10, rover.width - 25, rover.height - 20, 4);
        } else {
          ctx.rect(15, 10, rover.width - 25, rover.height - 20);
        }
        ctx.fill();
        
        // Gold Foil accents (Kapton tape)
        ctx.fillStyle = '#fbbf24'; // Amber 400
        ctx.fillRect(20, 15, 15, rover.height - 30);
        ctx.fillRect(rover.width - 25, 15, 10, rover.height - 30);
        
        // Details/Panels
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        ctx.strokeRect(40, 15, 15, rover.height - 30);

        // Wheels
        const drawWheel = (wx: number, wy: number) => {
          ctx.save();
          ctx.translate(wx, wy);
          ctx.rotate(rover.wheelAngle);
          
          // Wheel outer (black/dark grey)
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(0, 0, 12, 0, Math.PI * 2);
          ctx.fill();
          
          // Wheel treads (aluminum mesh look)
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          for(let w=0; w<6; w++) {
             ctx.beginPath();
             ctx.moveTo(0,0);
             ctx.lineTo(Math.cos(w * Math.PI/3) * 12, Math.sin(w * Math.PI/3) * 12);
             ctx.stroke();
          }
          
          // Hubcap
          ctx.fillStyle = '#fbbf24'; // Gold hub
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        };

        // 6-wheel drive look (showing 3 on this side)
        drawWheel(15, rover.height - 5);
        drawWheel(rover.width / 2 + 5, rover.height - 5);
        drawWheel(rover.width - 5, rover.height - 5);

        ctx.restore();
      }
    };

    // Start loop
    animationFrameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('touchstart', handleTouch);
      canvas.removeEventListener('mousedown', handleTouch);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onGameOver]);

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      {/* HUD */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-10">
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart 
                key={i} 
                className={`w-8 h-8 ${i < health ? 'text-red-500 fill-red-500' : 'text-slate-600'}`} 
              />
            ))}
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full backdrop-blur-sm border border-slate-700/50">
            <Gem className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-mono font-bold text-xl">{score}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-slate-400 font-mono text-sm uppercase tracking-widest">Distance</div>
          <div className="text-white font-mono font-bold text-2xl">{Math.floor(score * 0.1)}m</div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-auto bg-slate-900 block touch-none"
        style={{ aspectRatio: '800/400' }}
      />
      
      {/* Instructions Overlay (fades out) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-[fadeOut_2s_ease-in-out_2s_forwards]">
        <div className="bg-black/50 px-6 py-3 rounded-full backdrop-blur-sm text-white font-mono flex items-center gap-3">
          <span className="px-2 py-1 border border-white/30 rounded bg-white/10">SPACE</span>
          <span>or TAP to jump</span>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Industry Standard Snake Game - 2D Particle System & Screen Shake Effects
   ========================================================================== */

class Particle {
  constructor(x, y, color, options = {}) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = options.size || (Math.random() * 4 + 2);
    
    const angle = options.angle !== undefined ? options.angle : Math.random() * Math.PI * 2;
    const speed = options.speed !== undefined ? options.speed : (Math.random() * 4 + 1);
    
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.friction = options.friction || 0.95;
    this.gravity = options.gravity || 0;
    this.alpha = 1;
    this.decay = options.decay || (Math.random() * 0.03 + 0.015);
    this.shape = options.shape || 'circle'; // 'circle', 'spark', 'ring'
    this.ringRadius = 1;
    this.maxRingRadius = options.maxRingRadius || 30;
  }

  update() {
    if (this.shape === 'ring') {
      this.ringRadius += 2.5;
      this.alpha -= 0.04;
      return this.alpha > 0;
    }

    this.vx *= this.friction;
    this.vy *= this.friction;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
    return this.alpha > 0;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);

    if (this.shape === 'ring') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (this.shape === 'spark') {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
      ctx.stroke();
    } else {
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

class FloatingText {
  constructor(x, y, text, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.alpha = 1;
    this.vy = -1.5;
    this.scale = 1.2;
  }

  update() {
    this.y += this.vy;
    this.alpha -= 0.02;
    this.scale = Math.max(1, this.scale - 0.01);
    return this.alpha > 0;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.font = '800 16px "JetBrains Mono", sans-serif';
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
  }

  spawnBurst(x, y, color, count = 16, speed = 4) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.2);
      this.particles.push(new Particle(x, y, color, {
        angle,
        speed: speed * (0.5 + Math.random() * 0.8),
        shape: Math.random() > 0.4 ? 'circle' : 'spark'
      }));
    }
  }

  spawnPowerupRing(x, y, color) {
    this.particles.push(new Particle(x, y, color, { shape: 'ring', maxRingRadius: 40 }));
    this.spawnBurst(x, y, color, 24, 6);
  }

  spawnFloatingText(x, y, text, color = '#ffd700') {
    this.floatingTexts.push(new FloatingText(x, y, text, color));
  }

  triggerScreenShake(intensity = 8, duration = 20) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  getShakeOffset() {
    if (this.shakeDuration > 0) {
      this.shakeDuration--;
      const dx = (Math.random() - 0.5) * this.shakeIntensity;
      const dy = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity *= 0.92; // smooth damping
      return { x: dx, y: dy };
    }
    return { x: 0, y: 0 };
  }

  update() {
    this.particles = this.particles.filter(p => p.update());
    this.floatingTexts = this.floatingTexts.filter(ft => ft.update());
  }

  draw(ctx) {
    for (const p of this.particles) p.draw(ctx);
    for (const ft of this.floatingTexts) ft.draw(ctx);
  }

  clear() {
    this.particles = [];
    this.floatingTexts = [];
    this.shakeDuration = 0;
  }
}

const particleSystem = new ParticleSystem();

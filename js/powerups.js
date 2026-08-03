/* ==========================================================================
   Industry Standard Snake Game - Dynamic Power-Ups System
   ========================================================================== */

const POWERUP_TYPES = {
  SPEED: {
    id: 'SPEED',
    name: 'Speed Rush',
    icon: '⚡',
    color: '#00f2fe',
    duration: 8000,
    desc: 'Faster speed & 2x score!'
  },
  SLOW: {
    id: 'SLOW',
    name: 'Slow Motion',
    icon: '⏳',
    color: '#9d4edd',
    duration: 10000,
    desc: 'Precision control speed'
  },
  MULTI: {
    id: 'MULTI',
    name: '2x Multiplier',
    icon: '💎',
    color: '#ffd700',
    duration: 12000,
    desc: 'Double all points earned'
  },
  GHOST: {
    id: 'GHOST',
    name: 'Ghost Mode',
    icon: '👻',
    color: '#ff007f',
    duration: 7000,
    desc: 'Phase through walls & self!'
  },
  MAGNET: {
    id: 'MAGNET',
    name: 'Magnet',
    icon: '🧲',
    color: '#00ff88',
    duration: 9000,
    desc: 'Attracts food to snake head'
  }
};

class PowerUpManager {
  constructor() {
    this.activePowerupItem = null; // Powerup entity sitting on map: { gridX, gridY, type, pulseAngle }
    this.activeEffects = new Map(); // Currently active powerup effects { typeId: { startTime, endTime, duration } }
    this.spawnTimer = 0;
    this.spawnInterval = 12000; // Try spawning every 12 seconds
  }

  reset() {
    this.activePowerupItem = null;
    this.activeEffects.clear();
    this.spawnTimer = 0;
  }

  spawnOnGrid(gridWidth, gridHeight, occupiedCells) {
    if (this.activePowerupItem) return;

    const types = Object.keys(POWERUP_TYPES);
    const randomType = POWERUP_TYPES[types[Math.floor(Math.random() * types.length)]];

    // Find unoccupied cell
    let gridX, gridY, attempts = 0;
    do {
      gridX = Math.floor(Math.random() * gridWidth);
      gridY = Math.floor(Math.random() * gridHeight);
      attempts++;
    } while (occupiedCells.has(`${gridX},${gridY}`) && attempts < 100);

    if (attempts < 100) {
      this.activePowerupItem = {
        gridX,
        gridY,
        type: randomType,
        pulseAngle: 0,
        lifetime: 10000 // Despawns after 10 seconds if uncollected
      };
    }
  }

  update(dt, gridWidth, gridHeight, occupiedCells) {
    // Update active effects countdown
    const now = Date.now();
    for (const [typeId, effect] of this.activeEffects.entries()) {
      if (now >= effect.endTime) {
        this.activeEffects.delete(typeId);
        if (window.onPowerupExpired) window.onPowerupExpired(POWERUP_TYPES[typeId]);
      }
    }

    // Handle map powerup item pulsing & lifetime despawn
    if (this.activePowerupItem) {
      this.activePowerupItem.pulseAngle += 0.08;
      this.activePowerupItem.lifetime -= dt;
      if (this.activePowerupItem.lifetime <= 0) {
        this.activePowerupItem = null;
      }
    } else {
      this.spawnTimer += dt;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnOnGrid(gridWidth, gridHeight, occupiedCells);
      }
    }
  }

  collectPowerUp(type) {
    const now = Date.now();
    this.activeEffects.set(type.id, {
      startTime: now,
      endTime: now + type.duration,
      duration: type.duration
    });
    this.activePowerupItem = null;
  }

  hasEffect(typeId) {
    return this.activeEffects.has(typeId);
  }

  getSpeedModifier() {
    if (this.hasEffect('SPEED')) return 0.65; // Lower delay = faster
    if (this.hasEffect('SLOW')) return 1.45; // Higher delay = slower
    return 1.0;
  }

  getScoreMultiplier() {
    let mult = 1;
    if (this.hasEffect('MULTI')) mult *= 2;
    if (this.hasEffect('SPEED')) mult *= 2;
    return mult;
  }

  isGhostActive() {
    return this.hasEffect('GHOST');
  }

  isMagnetActive() {
    return this.hasEffect('MAGNET');
  }

  drawItem(ctx, cellSize) {
    if (!this.activePowerupItem) return;
    const item = this.activePowerupItem;
    const cx = item.gridX * cellSize + cellSize / 2;
    const cy = item.gridY * cellSize + cellSize / 2;
    const scale = 1 + Math.sin(item.pulseAngle) * 0.15;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // Glowing outer halo
    ctx.shadowBlur = 15;
    ctx.shadowColor = item.type.color;
    ctx.fillStyle = item.type.color;
    ctx.beginPath();
    ctx.arc(0, 0, cellSize * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Icon rendering
    ctx.font = `${Math.floor(cellSize * 0.55)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.type.icon, 0, 1);

    ctx.restore();
  }
}

const powerUpManager = new PowerUpManager();

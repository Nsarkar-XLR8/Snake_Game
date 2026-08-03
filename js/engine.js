/* ==========================================================================
   Industry Standard Snake Game - Core Engine, Physics & Render System
   ========================================================================== */

const DIRECTION = {
  UP: { x: 0, y: -1, name: 'up' },
  DOWN: { x: 0, y: 1, name: 'down' },
  LEFT: { x: -1, y: 0, name: 'left' },
  RIGHT: { x: 1, y: 0, name: 'right' }
};

class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Grid Specs
    this.cols = 30;
    this.rows = 30;
    this.cellSize = canvas.width / this.cols;

    // State Variables
    this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER'
    this.gameMode = 'classic'; // 'classic', 'arcade', 'obstacles', 'timeattack'
    this.difficulty = 'medium'; // 'easy', 'medium', 'hard', 'extreme'
    this.wallWrap = false;

    // Movement & Accumulator
    this.baseSpeedMs = 100; // Base interval between grid moves
    this.moveTimer = 0;
    this.lastTime = 0;

    // Snake State
    this.snake = [];
    this.currentDirection = DIRECTION.RIGHT;
    this.inputBuffer = [];

    // Food & Combo System
    this.food = { x: 0, y: 0, pulse: 0 };
    this.combo = 1;
    this.comboTimer = 0;
    this.maxComboTimer = 3000; // 3 seconds to chain combo

    // Score & Stats
    this.score = 0;
    this.foodEaten = 0;
    this.maxComboReached = 1;
    this.powerupsCollected = 0;
    this.timeRemaining = 60; // For Time Attack Mode

    // Obstacles & Portals (Maze Mode)
    this.obstacles = new Set(); // Set of "x,y" strings
    this.portals = []; // Array of portal pairs [{in: {x,y}, out: {x,y}, color}]

    // Bindings
    this.loop = this.loop.bind(this);
  }

  init() {
    this.resetGame();
    requestAnimationFrame(this.loop);
  }

  setGameMode(mode) {
    this.gameMode = mode;
  }

  setDifficulty(diff) {
    this.difficulty = diff;
    switch (diff) {
      case 'easy': this.baseSpeedMs = 130; break;
      case 'medium': this.baseSpeedMs = 95; break;
      case 'hard': this.baseSpeedMs = 70; break;
      case 'extreme': this.baseSpeedMs = 50; break;
    }
  }

  resetGame() {
    // Initial snake 3 segments centered
    const startX = 10;
    const startY = 15;
    this.snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];

    this.currentDirection = DIRECTION.RIGHT;
    this.inputBuffer = [];
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.foodEaten = 0;
    this.maxComboReached = 1;
    this.powerupsCollected = 0;
    this.timeRemaining = 60;

    powerUpManager.reset();
    particleSystem.clear();

    // Setup Obstacles if in Maze Mode
    this.obstacles.clear();
    this.portals = [];
    if (this.gameMode === 'obstacles') {
      this.generateMazeLayout();
    }

    this.spawnFood();
  }

  generateMazeLayout() {
    // Outer perimeter obstacle blocks (leave middle open)
    for (let i = 5; i <= 24; i++) {
      if (i !== 14 && i !== 15) {
        this.obstacles.add(`${i},6`);
        this.obstacles.add(`${i},23`);
      }
    }
    for (let j = 8; j <= 21; j++) {
      if (j !== 14 && j !== 15) {
        this.obstacles.add(`6,${j}`);
        this.obstacles.add(`23,${j}`);
      }
    }

    // Teleportation Portals pair
    this.portals = [
      { inX: 2, inY: 15, outX: 27, outY: 15, color: '#00f2fe' },
      { inX: 15, inY: 2, outX: 15, outY: 27, color: '#ff007f' }
    ];
  }

  handleInput(dir) {
    if (this.state !== 'PLAYING') return;

    // Get the last requested direction in queue or current direction
    const lastDir = this.inputBuffer.length > 0 ? this.inputBuffer[this.inputBuffer.length - 1] : this.currentDirection;

    // Prevent 180-degree immediate reversal (e.g. UP when going DOWN)
    if (dir.x + lastDir.x === 0 && dir.y + lastDir.y === 0) {
      return;
    }

    // Limit buffer length to prevent input delay lag
    if (this.inputBuffer.length < 2) {
      this.inputBuffer.push(dir);
    }
  }

  spawnFood() {
    const occupied = new Set();
    for (const seg of this.snake) occupied.add(`${seg.x},${seg.y}`);
    for (const obs of this.obstacles) occupied.add(obs);
    if (powerUpManager.activePowerupItem) {
      occupied.add(`${powerUpManager.activePowerupItem.gridX},${powerUpManager.activePowerupItem.gridY}`);
    }

    let foodX, foodY, attempts = 0;
    do {
      foodX = Math.floor(Math.random() * this.cols);
      foodY = Math.floor(Math.random() * this.rows);
      attempts++;
    } while (occupied.has(`${foodX},${foodY}`) && attempts < 200);

    this.food = { x: foodX, y: foodY, pulse: 0 };
  }

  update(dt) {
    if (this.state !== 'PLAYING') return;

    // Update Time Attack Countdown
    if (this.gameMode === 'timeattack') {
      this.timeRemaining -= dt / 1000;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.triggerGameOver('Time Expired!');
        return;
      }
    }

    // Update Combo Decay
    if (this.combo > 1) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1;
      }
    }

    // Update Powerups & Particles
    const occupiedCells = new Set();
    for (const seg of this.snake) occupiedCells.add(`${seg.x},${seg.y}`);
    for (const obs of this.obstacles) occupiedCells.add(obs);

    powerUpManager.update(dt, this.cols, this.rows, occupiedCells);
    particleSystem.update();

    // Magnet Physics: Attract food towards head if magnet active
    if (powerUpManager.isMagnetActive() && this.snake.length > 0) {
      const head = this.snake[0];
      const dx = head.x - this.food.x;
      const dy = head.y - this.food.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0 && dist < 6 && Math.random() < 0.15) {
        this.food.x += Math.sign(dx);
        this.food.y += Math.sign(dy);
      }
    }

    // Movement step based on speed & active power-up modifiers
    const speedMod = powerUpManager.getSpeedModifier();
    const currentSpeed = this.baseSpeedMs * speedMod;

    this.moveTimer += dt;
    if (this.moveTimer >= currentSpeed) {
      this.moveTimer -= currentSpeed;
      this.step();
    }
  }

  step() {
    // Process input buffer
    if (this.inputBuffer.length > 0) {
      this.currentDirection = this.inputBuffer.shift();
    }

    const head = { ...this.snake[0] };
    head.x += this.currentDirection.x;
    head.y += this.currentDirection.y;

    // --- Boundary Collision / Wall Wrap Math ---
    if (this.wallWrap || powerUpManager.isGhostActive()) {
      if (head.x < 0) head.x = this.cols - 1;
      if (head.x >= this.cols) head.x = 0;
      if (head.y < 0) head.y = this.rows - 1;
      if (head.y >= this.rows) head.y = 0;
    } else {
      if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
        this.triggerGameOver('Border Crash!');
        return;
      }
    }

    // --- Maze Portal Warp Math ---
    for (const portal of this.portals) {
      if (head.x === portal.inX && head.y === portal.inY) {
        head.x = portal.outX;
        head.y = portal.outY;
        particleSystem.spawnPowerupRing(head.x * this.cellSize + this.cellSize / 2, head.y * this.cellSize + this.cellSize / 2, portal.color);
        soundManager.playPowerupSound();
      }
    }

    // --- Obstacle Collision ---
    if (this.obstacles.has(`${head.x},${head.y}`)) {
      if (!powerUpManager.isGhostActive()) {
        this.triggerGameOver('Obstacle Crash!');
        return;
      }
    }

    // --- Self Collision ---
    const isGhost = powerUpManager.isGhostActive();
    for (let i = 0; i < this.snake.length; i++) {
      const seg = this.snake[i];
      if (seg.x === head.x && seg.y === head.y) {
        if (!isGhost) {
          this.triggerGameOver('Self Collision!');
          return;
        } else {
          storageManager.unlockAchievement('GHOST_RUNNER');
        }
      }
    }

    // Sound feedback for step move
    soundManager.playMoveSound();

    // Move Head forward
    this.snake.unshift(head);

    // Check Food Consumption
    if (head.x === this.food.x && head.y === this.food.y) {
      this.handleFoodEaten(head);
    } else {
      // Normal step: remove tail segment
      this.snake.pop();
    }

    // Check Powerup Collection
    if (powerUpManager.activePowerupItem) {
      const pItem = powerUpManager.activePowerupItem;
      if (head.x === pItem.gridX && head.y === pItem.gridY) {
        powerUpManager.collectPowerUp(pItem.type);
        this.powerupsCollected++;
        soundManager.playPowerupSound();
        particleSystem.spawnPowerupRing(
          head.x * this.cellSize + this.cellSize / 2,
          head.y * this.cellSize + this.cellSize / 2,
          pItem.type.color
        );
        particleSystem.spawnFloatingText(
          head.x * this.cellSize + this.cellSize / 2,
          head.y * this.cellSize + this.cellSize / 2,
          pItem.type.name,
          pItem.type.color
        );

        if (pItem.type.id === 'SPEED') storageManager.unlockAchievement('SPEED_DEMON');
      }
    }
  }

  handleFoodEaten(head) {
    this.foodEaten++;
    this.comboTimer = this.maxComboTimer;
    
    // Combo multiplier calculation
    if (this.foodEaten > 1) {
      this.combo = Math.min(this.combo + 1, 5);
      if (this.combo > this.maxComboReached) this.maxComboReached = this.combo;
      if (this.combo >= 5) storageManager.unlockAchievement('COMBO_KING');
    }

    // Base score = 100 * Combo * Active Multipliers
    const basePts = 100;
    const powerupMult = powerUpManager.getScoreMultiplier();
    const ptsGained = basePts * this.combo * powerupMult;
    this.score += ptsGained;

    // Time extension for Time Attack Mode
    if (this.gameMode === 'timeattack') {
      this.timeRemaining += 3;
    }

    // SFX & Particles
    if (this.combo > 1) {
      soundManager.playComboSound(this.combo);
    } else {
      soundManager.playEatSound();
    }

    const fxX = head.x * this.cellSize + this.cellSize / 2;
    const fxY = head.y * this.cellSize + this.cellSize / 2;
    particleSystem.spawnBurst(fxX, fxY, '#ff007f', 18);
    particleSystem.spawnFloatingText(fxX, fxY, `+${ptsGained} ${this.combo > 1 ? `x${this.combo}` : ''}`, '#00ff88');

    // Achievements Check
    storageManager.unlockAchievement('FIRST_BLOOD');
    if (this.snake.length >= 20) storageManager.unlockAchievement('CENTIPEDE');
    if (this.score >= 1000) storageManager.unlockAchievement('SCORE_1000');

    this.spawnFood();
  }

  triggerGameOver(reason) {
    this.state = 'GAMEOVER';
    soundManager.playCrashSound();
    particleSystem.triggerScreenShake(12, 25);

    const head = this.snake[0];
    if (head) {
      particleSystem.spawnBurst(
        head.x * this.cellSize + this.cellSize / 2,
        head.y * this.cellSize + this.cellSize / 2,
        '#ff3366',
        36,
        8
      );
    }

    // Mode-specific achievements
    if (this.gameMode === 'obstacles' && this.score >= 300) {
      storageManager.unlockAchievement('MAZE_RUNNER');
    }
    if (this.gameMode === 'timeattack' && this.score >= 500) {
      storageManager.unlockAchievement('TIME_LORD');
    }

    storageManager.recordGameStats(this.foodEaten, this.maxComboReached, this.powerupsCollected);

    if (window.onGameOver) {
      window.onGameOver(this.score, reason);
    }
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min(timestamp - this.lastTime, 100); // Cap frame step delta
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.loop);
  }

  // --- Rendering ---
  draw() {
    const ctx = this.ctx;
    const cs = this.cellSize;
    const shake = particleSystem.getShakeOffset();

    ctx.save();
    ctx.translate(shake.x, shake.y);

    // Background Grid Render
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid-line') || 'rgba(0,242,254,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= this.canvas.width; x += cs) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= this.canvas.height; y += cs) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }

    // Draw Obstacles (Maze Mode)
    ctx.fillStyle = '#ff3366';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff3366';
    for (const obsStr of this.obstacles) {
      const [ox, oy] = obsStr.split(',').map(Number);
      ctx.beginPath();
      ctx.roundRect(ox * cs + 2, oy * cs + 2, cs - 4, cs - 4, 6);
      ctx.fill();
    }

    // Draw Portals (Maze Mode)
    for (const portal of this.portals) {
      ctx.fillStyle = portal.color;
      ctx.shadowBlur = 15;
      ctx.shadowColor = portal.color;
      ctx.beginPath();
      ctx.arc(portal.inX * cs + cs / 2, portal.inY * cs + cs / 2, cs * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Food with pulsing glow
    this.food.pulse += 0.08;
    const foodScale = 1 + Math.sin(this.food.pulse) * 0.12;
    const fx = this.food.x * cs + cs / 2;
    const fy = this.food.y * cs + cs / 2;

    ctx.save();
    ctx.translate(fx, fy);
    ctx.scale(foodScale, foodScale);
    ctx.fillStyle = '#ff007f';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff007f';
    ctx.beginPath();
    ctx.arc(0, 0, cs * 0.38, 0, Math.PI * 2);
    ctx.fill();
    // Shiny highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-cs * 0.12, -cs * 0.12, cs * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw Map Power-Up Item
    powerUpManager.drawItem(ctx, cs);

    // Draw Snake Segments
    const isGhost = powerUpManager.isGhostActive();
    for (let i = this.snake.length - 1; i >= 0; i--) {
      const seg = this.snake[i];
      const px = seg.x * cs;
      const py = seg.y * cs;

      if (i === 0) {
        // Snake Head
        ctx.fillStyle = isGhost ? '#ff007f' : '#00f2fe';
        ctx.shadowBlur = 18;
        ctx.shadowColor = isGhost ? '#ff007f' : '#00f2fe';
        ctx.beginPath();
        ctx.roundRect(px + 1, py + 1, cs - 2, cs - 2, 8);
        ctx.fill();

        // Head Eyes based on direction
        ctx.fillStyle = '#000000';
        const eyeOffset = cs * 0.25;
        let e1x = px + cs / 2, e1y = py + cs / 2;
        let e2x = px + cs / 2, e2y = py + cs / 2;

        if (this.currentDirection === DIRECTION.RIGHT) {
          e1x = px + cs - 6; e1y = py + eyeOffset;
          e2x = px + cs - 6; e2y = py + cs - eyeOffset;
        } else if (this.currentDirection === DIRECTION.LEFT) {
          e1x = px + 6; e1y = py + eyeOffset;
          e2x = px + 6; e2y = py + cs - eyeOffset;
        } else if (this.currentDirection === DIRECTION.UP) {
          e1x = px + eyeOffset; e1y = py + 6;
          e2x = px + cs - eyeOffset; e2y = py + 6;
        } else if (this.currentDirection === DIRECTION.DOWN) {
          e1x = px + eyeOffset; e1y = py + cs - 6;
          e2x = px + cs - eyeOffset; e2y = py + cs - 6;
        }

        ctx.beginPath(); ctx.arc(e1x, e1y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2x, e2y, 3, 0, Math.PI * 2); ctx.fill();
      } else {
        // Snake Body gradient taper
        const alpha = 1 - (i / this.snake.length) * 0.5;
        ctx.fillStyle = isGhost ? `rgba(255, 0, 127, ${alpha})` : `rgba(0, 255, 136, ${alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = isGhost ? '#ff007f' : '#00ff88';
        ctx.beginPath();
        ctx.roundRect(px + 2, py + 2, cs - 4, cs - 4, 6);
        ctx.fill();
      }
    }

    // Draw Particle FX Layer
    particleSystem.draw(ctx);

    ctx.restore();
  }
}

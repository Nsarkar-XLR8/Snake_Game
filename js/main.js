/* ==========================================================================
   Industry Standard Snake Game - Main Application Orchestrator & UI Wiring
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const engine = new GameEngine(canvas);
  const controller = new InputController(engine);

  // Apply saved theme & CRT
  storageManager.setTheme(storageManager.getTheme());
  storageManager.setCRT(storageManager.getCRT());

  // UI Elements
  const elScore = document.getElementById('valScore');
  const elHighScore = document.getElementById('valHighScore');
  const elCombo = document.getElementById('valCombo');
  const elMode = document.getElementById('valMode');
  const elPowerupTray = document.getElementById('powerupsTray');
  const elFloatingHud = document.getElementById('floatingHud');

  // Modals
  const modalStart = document.getElementById('modalStart');
  const modalGameOver = document.getElementById('modalGameOver');
  const modalSettings = document.getElementById('modalSettings');
  const modalLeaderboard = document.getElementById('modalLeaderboard');
  const modalAchievements = document.getElementById('modalAchievements');

  // Modal Triggers
  const btnStart = document.getElementById('btnStart');
  const btnRestart = document.getElementById('btnRestart');
  const btnSettings = document.getElementById('btnSettings');
  const btnLeaderboard = document.getElementById('btnLeaderboard');
  const btnAchievements = document.getElementById('btnAchievements');
  const btnPause = document.getElementById('btnPause');
  const btnMute = document.getElementById('btnMute');

  // Sync initial High Score display
  elHighScore.textContent = storageManager.getHighScore();

  // --- UI Update Loop ---
  function updateHUD() {
    elScore.textContent = engine.score;
    elHighScore.textContent = Math.max(engine.score, storageManager.getHighScore());

    if (engine.combo > 1) {
      elCombo.textContent = `x${engine.combo}`;
      elCombo.style.color = 'var(--accent-gold)';
    } else {
      elCombo.textContent = 'x1';
      elCombo.style.color = 'var(--accent-green)';
    }

    if (engine.gameMode === 'timeattack') {
      elMode.textContent = `⏱️ ${Math.ceil(engine.timeRemaining)}s`;
    } else {
      elMode.textContent = engine.gameMode.toUpperCase();
    }

    // Render Active Powerup Badges
    elPowerupTray.innerHTML = '';
    for (const [typeId, effect] of powerUpManager.activeEffects.entries()) {
      const type = POWERUP_TYPES[typeId];
      const remaining = Math.max(0, effect.endTime - Date.now());
      const pct = (remaining / effect.duration) * 100;

      const card = document.createElement('div');
      card.className = 'powerup-active-card';
      card.innerHTML = `
        <span class="powerup-icon">${type.icon}</span>
        <div class="powerup-info">
          <div class="powerup-name">${type.name}</div>
          <div class="powerup-bar-bg"><div class="powerup-bar-fill" style="width: ${pct}%; background: ${type.color}"></div></div>
        </div>
      `;
      elPowerupTray.appendChild(card);
    }
  }

  setInterval(updateHUD, 100);

  // --- Global Callback Handlers ---
  window.onGameOver = (finalScore, reason) => {
    document.getElementById('goScore').textContent = finalScore;
    document.getElementById('goReason').textContent = reason;
    modalGameOver.classList.add('active');
  };

  window.onAchievementUnlocked = (ach) => {
    soundManager.playLevelUpSound ? soundManager.playLevelUpSound() : soundManager.playPowerupSound();
    const toast = document.createElement('div');
    toast.className = 'hud-toast';
    toast.textContent = `🏆 Unlocked: ${ach.title}!`;
    elFloatingHud.appendChild(toast);
    setTimeout(() => toast.remove(), 1400);
  };

  window.togglePauseGame = () => {
    if (engine.state === 'PLAYING') {
      engine.state = 'PAUSED';
      if (btnPause) btnPause.textContent = '▶️ Resume';
      soundManager.playClickSound();
      showToast('GAME PAUSED');
    } else if (engine.state === 'PAUSED') {
      engine.state = 'PLAYING';
      if (btnPause) btnPause.textContent = '⏸️ Pause';
      soundManager.playClickSound();
      showToast('RESUMED');
    }
  };

  window.restartGame = () => {
    soundManager.playClickSound();
    closeAllModals();
    engine.resetGame();
    engine.state = 'PLAYING';
  };

  window.toggleMuteAudio = () => {
    const isMuted = soundManager.toggleMute();
    btnMute.textContent = isMuted ? '🔇 Muted' : '🔊 SFX On';
    showToast(isMuted ? 'Audio Muted' : 'Audio Unmuted');
  };

  function showToast(text) {
    const toast = document.createElement('div');
    toast.className = 'hud-toast';
    toast.textContent = text;
    elFloatingHud.appendChild(toast);
    setTimeout(() => toast.remove(), 1400);
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('active'));
  }

  // Close buttons
  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Start Button
  btnStart.addEventListener('click', () => {
    soundManager.init();
    soundManager.playClickSound();
    const selMode = document.getElementById('selectMode').value;
    const selDiff = document.getElementById('selectDiff').value;

    engine.setGameMode(selMode);
    engine.setDifficulty(selDiff);
    engine.resetGame();
    engine.state = 'PLAYING';
    closeAllModals();
  });

  // Game Over Submit Score
  btnRestart.addEventListener('click', () => {
    const nameInput = document.getElementById('playerNameInput').value.trim() || 'PLAYER';
    storageManager.addScore(nameInput, engine.score, engine.gameMode, engine.difficulty);
    elHighScore.textContent = storageManager.getHighScore();
    
    soundManager.playClickSound();
    closeAllModals();
    engine.resetGame();
    engine.state = 'PLAYING';
  });

  // Header Actions
  btnSettings.addEventListener('click', () => {
    soundManager.playClickSound();
    modalSettings.classList.add('active');
  });

  btnLeaderboard.addEventListener('click', () => {
    soundManager.playClickSound();
    renderLeaderboard();
    modalLeaderboard.classList.add('active');
  });

  btnAchievements.addEventListener('click', () => {
    soundManager.playClickSound();
    renderAchievements();
    modalAchievements.classList.add('active');
  });

  if (btnPause) btnPause.addEventListener('click', window.togglePauseGame);
  btnMute.addEventListener('click', window.toggleMuteAudio);

  // Settings Handlers
  const themeSelect = document.getElementById('settingTheme');
  themeSelect.value = storageManager.getTheme();
  themeSelect.addEventListener('change', (e) => {
    storageManager.setTheme(e.target.value);
  });

  const crtToggle = document.getElementById('settingCRT');
  crtToggle.checked = storageManager.getCRT();
  crtToggle.addEventListener('change', (e) => {
    storageManager.setCRT(e.target.checked);
  });

  const volSlider = document.getElementById('settingVolume');
  volSlider.value = soundManager.sfxVolume * 100;
  volSlider.addEventListener('input', (e) => {
    soundManager.setVolume(e.target.value / 100);
  });

  // Render Leaderboard list inside modal
  function renderLeaderboard() {
    const list = document.getElementById('leaderboardList');
    const scores = storageManager.getLeaderboard();
    list.innerHTML = '';

    if (scores.length === 0) {
      list.innerHTML = '<div style="text-align:center; color:var(--text-muted); padding:20px;">No high scores yet!</div>';
      return;
    }

    scores.forEach((entry, idx) => {
      const item = document.createElement('div');
      item.className = 'lb-item';
      item.innerHTML = `
        <span class="lb-rank">#${idx + 1}</span>
        <span class="lb-name">${entry.name} <small style="color:var(--text-muted); font-size:0.75rem;">(${entry.mode})</small></span>
        <span class="lb-score">${entry.score}</span>
      `;
      list.appendChild(item);
    });
  }

  // Render Achievements inside modal
  function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    const unlocked = storageManager.getUnlockedAchievements();
    grid.innerHTML = '';

    ACHIEVEMENTS.forEach(ach => {
      const isUnlocked = unlocked.includes(ach.id);
      const card = document.createElement('div');
      card.className = `achieve-card ${isUnlocked ? 'unlocked' : ''}`;
      card.innerHTML = `
        <div class="achieve-icon">${ach.icon}</div>
        <div class="achieve-title">${ach.title}</div>
        <div class="achieve-desc">${ach.desc}</div>
      `;
      grid.appendChild(card);
    });
  }

  // Initialize game engine
  engine.init();
  modalStart.classList.add('active');
});

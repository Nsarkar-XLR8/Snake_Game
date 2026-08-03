/* ==========================================================================
   Industry Standard Snake Game - Storage Engine & Achievements System
   ========================================================================== */

const ACHIEVEMENTS = [
  { id: 'FIRST_BLOOD', title: 'First Bite', desc: 'Eat your first food item', icon: '🍎' },
  { id: 'CENTIPEDE', title: 'Centipede', desc: 'Reach a snake length of 20', icon: '🐛' },
  { id: 'SPEED_DEMON', title: 'Speed Demon', desc: 'Collect a Speed Rush power-up', icon: '⚡' },
  { id: 'GHOST_RUNNER', title: 'Ghost Walker', desc: 'Phase safely during Ghost Mode', icon: '👻' },
  { id: 'COMBO_KING', title: 'Combo Master', desc: 'Achieve a 5x Combo multiplier', icon: '🔥' },
  { id: 'SCORE_1000', title: 'High Roller', desc: 'Reach 1,000 total points in a game', icon: '👑' },
  { id: 'MAZE_RUNNER', title: 'Maze Survivor', desc: 'Score 300+ in Obstacles Mode', icon: '🧱' },
  { id: 'TIME_LORD', title: 'Time Lord', desc: 'Score 500+ in Time Attack Mode', icon: '⏱️' }
];

class StorageManager {
  constructor() {
    this.storageKeyLeaderboard = 'snake_leaderboard_v1';
    this.storageKeyStats = 'snake_stats_v1';
    this.storageKeyAchievements = 'snake_achievements_v1';
    this.storageKeyTheme = 'snake_theme_v1';
    this.storageKeyCRT = 'snake_crt_v1';
  }

  // --- Leaderboard ---
  getLeaderboard() {
    try {
      const data = localStorage.getItem(this.storageKeyLeaderboard);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  addScore(name, score, mode, difficulty) {
    const lb = this.getLeaderboard();
    const entry = {
      name: (name || 'PLAYER').substring(0, 8).toUpperCase(),
      score: parseInt(score, 10),
      mode: mode || 'Classic',
      difficulty: difficulty || 'Medium',
      date: new Date().toLocaleDateString()
    };
    lb.push(entry);
    lb.sort((a, b) => b.score - a.score);
    const top10 = lb.slice(0, 10);
    localStorage.setItem(this.storageKeyLeaderboard, JSON.stringify(top10));
    return top10;
  }

  getHighScore() {
    const lb = this.getLeaderboard();
    return lb.length > 0 ? lb[0].score : 0;
  }

  // --- Lifetime Stats ---
  getStats() {
    try {
      const data = localStorage.getItem(this.storageKeyStats);
      return data ? JSON.parse(data) : { gamesPlayed: 0, foodEaten: 0, highestCombo: 1, powerupsCollected: 0 };
    } catch (e) {
      return { gamesPlayed: 0, foodEaten: 0, highestCombo: 1, powerupsCollected: 0 };
    }
  }

  recordGameStats(foodEaten, maxCombo, powerupsCollected) {
    const stats = this.getStats();
    stats.gamesPlayed += 1;
    stats.foodEaten += foodEaten;
    stats.highestCombo = Math.max(stats.highestCombo, maxCombo);
    stats.powerupsCollected += powerupsCollected;
    localStorage.setItem(this.storageKeyStats, JSON.stringify(stats));
  }

  // --- Achievements ---
  getUnlockedAchievements() {
    try {
      const data = localStorage.getItem(this.storageKeyAchievements);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  unlockAchievement(id) {
    const unlocked = this.getUnlockedAchievements();
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      localStorage.setItem(this.storageKeyAchievements, JSON.stringify(unlocked));
      
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach && window.onAchievementUnlocked) {
        window.onAchievementUnlocked(ach);
      }
    }
  }

  // --- Settings (Theme & CRT) ---
  getTheme() {
    return localStorage.getItem(this.storageKeyTheme) || 'cyber';
  }

  setTheme(themeName) {
    localStorage.setItem(this.storageKeyTheme, themeName);
    document.documentElement.setAttribute('data-theme', themeName);
  }

  getCRT() {
    return localStorage.getItem(this.storageKeyCRT) === 'true';
  }

  setCRT(enabled) {
    localStorage.setItem(this.storageKeyCRT, enabled);
    if (enabled) {
      document.body.classList.add('crt-active');
    } else {
      document.body.classList.remove('crt-active');
    }
  }
}

const storageManager = new StorageManager();

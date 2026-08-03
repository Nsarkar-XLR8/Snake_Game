# 🐍 Snake Game - Industry Standard Edition

A state-of-the-art, feature-rich Snake Game implementation built for both **Web (HTML5 2D Canvas + Web Audio API)** and **Desktop (Python Pygame)**.

![Snake Game Header](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20ES6%2B%20%7C%20WebAudioAPI%20%7C%20Pygame-blue)

---

## 🌟 Key Features

### 1. 🎨 Visual Design & Dynamic Themes
- **Glassmorphism UI**: Translucent frosted glass panels with glowing neon borders and backdrop filters.
- **Multiple Theme Engine**:
  - 🌐 *Cyber Neon*: High-contrast cyan, magenta, and deep obsidian.
  - 🌿 *Emerald Jungle*: Vibrant neon green phosphor aesthetic.
  - 🌌 *Midnight OLED*: True black with deep violet accents.
  - 🕹️ *Retro Arcade*: 80s arcade vibes with customizable CRT Scanlines effect.
- **Particle System**: Real-time 2D physics particles for food consumption, power-up explosions, trailing sparks, and screen shake on crash.

### 2. 🎵 Zero-Dependency Web Audio API Synthesizer
- All sound effects (food eat, power-up collect, combo chords, crash, UI ticks, level up) are procedurally synthesized using Web Audio API oscillators and gain envelopes in real-time — **no external sound files required**.

### 3. 🎮 4 Game Modes
- 🕹️ **Classic**: Traditional wall-bounce snake.
- ⚡ **Arcade**: Dynamic power-ups, extra food items, and score multipliers.
- 🧱 **Obstacles & Portals**: Pre-designed maze layouts with impassable walls and color warp portals.
- ⏱️ **Time Attack**: 60-second dash with time extension pickups.

### 4. ⚡ 5 Unique Power-Ups
- ⚡ **Speed Rush**: Double speed and 2x score bonus.
- ⏳ **Slow Motion**: Precision control slowdown.
- 💎 **2x Multiplier**: Multiplies score gained.
- 👻 **Ghost Mode**: Phase safely through walls and snake self.
- 🧲 **Magnet**: Vector physics pulling food towards snake head.

### 5. 📱 Touch & Mobile Support
- Keyboard bindings (`WASD` / `Arrow Keys`, `Space` / `P` to Pause, `R` to Restart, `M` to Mute).
- Touch swipe gesture detection for smartphones & tablets.
- On-screen touch D-Pad controls.

### 6. 🏆 Leaderboard & Achievements
- Top 10 Hall of Fame with local storage persistence.
- Unlockable achievements system with animated popup toast notifications.

---

## 🛠️ Architecture & Project Structure

```
Snake_Game/
├── index.html        # Main HTML5 web app layout & glassmorphic HUD
├── style.css         # CSS design tokens, themes, glassmorphism & CRT overlay
├── js/
│   ├── audio.js      # SoundManager (Web Audio API procedural sound synthesizer)
│   ├── particles.js  # ParticleSystem (bursts, floating score text, screen shake)
│   ├── powerups.js   # PowerUpManager (5 powerup items, magnet physics, timer HUD)
│   ├── storage.js    # StorageManager (Leaderboard, Stats, Achievements)
│   ├── engine.js     # GameEngine (requestAnimationFrame loop, grid physics math)
│   ├── controls.js   # InputController (Keyboard, touch swipe, virtual D-Pad)
│   └── main.js       # Main orchestrator & UI event wiring
├── Snake.py          # Python Desktop Engine (Pygame with Tkinter fallback)
└── README.md         # Documentation
```

---

## 🚀 How to Run

### Web Application
Simply open `index.html` in any modern web browser or serve via local HTTP server (`python3 -m http.server 8000`).

### Desktop Application
Run the Python script directly:
```bash
python3 Snake.py
```
*(Requires Pygame installed for graphics & audio. Automatically falls back to Tkinter if Pygame is absent).*

---

## 📜 License
MIT License. Created with ❤️ by Nsarkar-XLR8.

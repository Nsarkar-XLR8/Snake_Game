# 🐍 SNAKE NEON — Industry Standard Edition

> A high-performance, feature-rich HTML5 2D Canvas & Web Audio API Snake Game with real-time particle physics, procedural sound synthesis, glassmorphism UI, multiple game modes, power-ups, local leaderboard, and Python Pygame desktop support.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)]()
[![Stack](https://img.shields.io/badge/Tech%20Stack-HTML5%20%7C%20CSS3%20%7C%20ES6%2B%20%7C%20WebAudio%20%7C%20Pygame-00f2fe.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Web%20%26%20Desktop-ff007f.svg)]()

---

## 📖 Table of Contents
- [Architecture & Design Systems](#-architecture--design-systems)
- [Key Features](#-key-features)
- [Game Mechanics & Mathematical Specifications](#-game-mechanics--mathematical-specifications)
- [Project Structure](#-project-structure)
- [Installation & Quick Start](#-installation--quick-start)
- [Controls Matrix](#-controls-matrix)
- [Desktop Python Engine](#-desktop-python-engine)
- [Browser Compatibility](#-browser-compatibility)
- [License](#-license)

---

## 🏗️ Architecture & Design Systems

SNAKE NEON is engineered using a decoupled, modular ES6+ component architecture to maintain 60–144 FPS smooth rendering across all modern displays.

```
                    ┌──────────────────────────────────────────────┐
                    │               SNAKE NEON UI                  │
                    │   Glassmorphism HUD & HTML5 Semantic Layout  │
                    └──────────────────────┬───────────────────────┘
                                           │
          ┌────────────────────────────────┼────────────────────────────────┐
          │                                │                                │
┌─────────▼──────────┐           ┌─────────▼──────────┐           ┌─────────▼──────────┐
│   InputController  │           │     GameEngine     │           │   SoundManager     │
│ Keyboard/Touch/DPad│──────────►│ Fixed-Step Delta   │──────────►│ Web Audio API      │
└────────────────────┘           │ Render Loop        │           │ Procedural Synth   │
                                 └─────────┬──────────┘           └────────────────────┘
                                           │
          ┌────────────────────────────────┼────────────────────────────────┐
          │                                │                                │
┌─────────▼──────────┐           ┌─────────▼──────────┐           ┌─────────▼──────────┐
│  ParticleSystem    │           │  PowerUpManager    │           │   StorageManager   │
│ Bursts/ScreenShake │           │ 5 Active Powers &  │           │ Leaderboard & Stats│
│ & Floating Scores  │           │ Vector Attractor   │           │ LocalStorage API   │
└────────────────────┘           └────────────────────┘           └────────────────────┘
```

---

## ✨ Key Features

### 1. 🎨 Glassmorphism & Multi-Theme Design System
- **CSS Design Tokens**: Fully themed with custom properties (`--bg-primary`, `--accent-cyan`, `--border-glow`).
- **4 Custom Themes**:
  - 🌐 **Cyber Neon** (Default): Cyan, magenta glow, deep space obsidian.
  - 🌿 **Emerald Jungle**: High-contrast green phosphor matrix.
  - 🌌 **Midnight OLED**: True dark theme with gold & purple accents.
  - 🕹️ **Retro Arcade**: 80s arcade feel with customizable CRT Scanlines overlay.

### 2. 🎵 Zero-Dependency Web Audio Synthesizer
- Built-in `SoundManager` generating procedural 8-bit sound effects in real time using Web Audio API `OscillatorNode` and `GainNode` envelopes — **no external audio assets required**:
  - `playEatSound()`: Frequency sweep (300Hz → 600Hz).
  - `playPowerupSound()`: Arpeggiated chord sequence (A4, C#5, E5, A5).
  - `playComboSound(x)`: Dynamic pitch chord scaled by combo level.
  - `playCrashSound()`: Low sawtooth pitch-decay explosion.

### 3. 💥 2D Particle Engine & Physics
- Real-time canvas particle simulation with particle velocity, friction, gravity, alpha decay, and ring shockwaves.
- Floating text score popups (`+100 COMBO x3`) and smooth screen shake impulses on collision.

### 4. 🎮 4 Game Modes
- 🕹️ **Classic**: Traditional wall-bounce snake.
- ⚡ **Arcade**: Dynamic power-up drops and multiplier mechanics.
- 🧱 **Obstacles & Portals**: Pre-built level mazes with impassable walls and color warp portals.
- ⏱️ **Time Attack**: 60-second dash with extra time extension pickups.

### 5. ⚡ 5 Unique Power-Ups
- ⚡ **Speed Rush**: Double movement speed & double points.
- ⏳ **Slow Motion**: Precision control slowdown.
- 💎 **2x Multiplier**: Multiplies all points earned.
- 👻 **Ghost Mode**: Phase through walls and snake self safely.
- 🧲 **Magnet**: Attracts nearby food towards the snake head.

### 6. 🏆 Leaderboard & Badges
- Top 10 Hall of Fame stored persistently in `localStorage`.
- Animated toast popups for unlocked achievement badges (*First Bite*, *Centipede*, *Speed Demon*, *Ghost Walker*, *Combo Master*).

---

## 📐 Game Mechanics & Mathematical Specifications

### 1. Input Buffer Queue (Collision Safety)
To prevent rapid double-key press self-collisions (e.g. going RIGHT → pressing UP then LEFT within 1 frame), inputs are queued in a FIFO buffer of max length 2. Each dequeued direction is validated:
$$\vec{D}_{\text{new}} \cdot \vec{D}_{\text{current}} \neq -1$$

### 2. Magnet Vector Attraction Math
When Magnet power-up is active, food position $\vec{P}_{\text{food}}$ is pulled towards snake head $\vec{P}_{\text{head}}$ if distance $d < 6$ cells:
$$\vec{P}_{\text{food}} \leftarrow \vec{P}_{\text{food}} + \text{sgn}(\vec{P}_{\text{head}} - \vec{P}_{\text{food}})$$

### 3. Dynamic Score Calculation
$$\text{Score}_{\text{gained}} = \text{Base} \times \text{Combo} \times \text{PowerUpMultiplier}$$
where $\text{Base} = 100$, $\text{Combo} \in [1, 5]$, and $\text{PowerUpMultiplier} \in [1, 4]$.

---

## 📁 Project Structure

```
Snake_Game/
├── favicon.svg        # Custom vector favicon (glowing neon snake)
├── index.html         # Main HTML5 semantic layout & glassmorphism UI
├── style.css          # CSS design system, themes, and CRT scanlines
├── js/
│   ├── audio.js       # SoundManager (Web Audio API synth)
│   ├── particles.js   # ParticleSystem & screen shake physics
│   ├── powerups.js    # PowerUpManager & magnet attraction math
│   ├── storage.js     # StorageManager (Leaderboard, Stats, Achievements)
│   ├── engine.js      # GameEngine (requestAnimationFrame render loop)
│   ├── controls.js    # InputController (Keyboard, touch swipe, D-Pad)
│   └── main.js        # Application wiring & modal management
├── Snake.py           # Python Desktop Engine (Pygame with Tkinter fallback)
└── README.md          # Documentation
```

---

## 🚀 Installation & Quick Start

### Web Version
Simply clone the repository and open `index.html` in any web browser:
```bash
git clone https://github.com/Nsarkar-XLR8/Snake_Game.git
cd Snake_Game
```
Or launch via local HTTP server:
```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000`.

---

## 🎮 Controls Matrix

| Action | Keyboard | Touch / Mobile | Mouse / UI |
| :--- | :--- | :--- | :--- |
| **Move Up** | `W` / `Arrow Up` | Swipe Up | D-Pad Up Button |
| **Move Down** | `S` / `Arrow Down` | Swipe Down | D-Pad Down Button |
| **Move Left** | `A` / `Arrow Left` | Swipe Left | D-Pad Left Button |
| **Move Right** | `D` / `Arrow Right` | Swipe Right | D-Pad Right Button |
| **Pause / Resume** | `P` / `Space` | — | `⏸️ Pause` Header Button |
| **Restart Game** | `R` | — | `PLAY AGAIN` Button |
| **Mute / Unmute** | `M` | — | `🔊 SFX On` Header Button |

---

## 🐍 Desktop Python Engine

The desktop engine ([Snake.py](file:///home/nsarkar/Experimental/Snake%20Game/Snake_Game/Snake.py)) features dual-engine architecture:
1. **Pygame Engine** (Primary): Hardware-accelerated rendering, smooth grid movement, particle eating bursts, and high score JSON persistence.
2. **Tkinter Engine** (Fallback): Runs automatically if Pygame is not installed.

Run on desktop:
```bash
python3 Snake.py
```

---

## 🌐 Browser Compatibility

| Browser | Supported Version | Features Supported |
| :--- | :--- | :--- |
| **Google Chrome** | 80+ | Full (Canvas 2D, Web Audio, Glassmorphism) |
| **Mozilla Firefox** | 75+ | Full (Canvas 2D, Web Audio, Glassmorphism) |
| **Apple Safari** | 13.1+ | Full (Web Audio Webkit Prefix handled) |
| **Microsoft Edge** | 80+ | Full (Canvas 2D, Web Audio, Glassmorphism) |

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.

Developed with ❤️ by **[Nsarkar-XLR8](https://github.com/Nsarkar-XLR8)**.

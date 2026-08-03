/* ==========================================================================
   Industry Standard Snake Game - Controls, Input Listeners & Mobile Support
   ========================================================================== */

class InputController {
  constructor(engine) {
    this.engine = engine;
    this.touchStartX = 0;
    this.touchStartY = 0;

    this.bindKeyboard();
    this.bindTouchGestures();
    this.bindVirtualDPad();
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Prevent scrolling arrow keys in browser
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      soundManager.init();

      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        this.engine.handleInput(DIRECTION.UP);
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        this.engine.handleInput(DIRECTION.DOWN);
      } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        this.engine.handleInput(DIRECTION.LEFT);
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        this.engine.handleInput(DIRECTION.RIGHT);
      } else if (e.code === 'KeyP' || e.code === 'Space') {
        if (window.togglePauseGame) window.togglePauseGame();
      } else if (e.code === 'KeyR') {
        if (window.restartGame) window.restartGame();
      } else if (e.code === 'KeyM') {
        if (window.toggleMuteAudio) window.toggleMuteAudio();
      }
    });
  }

  bindTouchGestures() {
    const canvas = this.engine.canvas;

    canvas.addEventListener('touchstart', (e) => {
      soundManager.init();
      if (e.touches.length === 1) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const dx = touchEndX - this.touchStartX;
        const dy = touchEndY - this.touchStartY;
        const minSwipeDist = 24;

        if (Math.abs(dx) > Math.abs(dy)) {
          if (Math.abs(dx) > minSwipeDist) {
            if (dx > 0) this.engine.handleInput(DIRECTION.RIGHT);
            else this.engine.handleInput(DIRECTION.LEFT);
          }
        } else {
          if (Math.abs(dy) > minSwipeDist) {
            if (dy > 0) this.engine.handleInput(DIRECTION.DOWN);
            else this.engine.handleInput(DIRECTION.UP);
          }
        }
      }
    }, { passive: true });
  }

  bindVirtualDPad() {
    const dpadUp = document.getElementById('dpadUp');
    const dpadDown = document.getElementById('dpadDown');
    const dpadLeft = document.getElementById('dpadLeft');
    const dpadRight = document.getElementById('dpadRight');

    const handleBtn = (dir) => {
      soundManager.init();
      soundManager.playClickSound();
      this.engine.handleInput(dir);
    };

    if (dpadUp) dpadUp.addEventListener('click', () => handleBtn(DIRECTION.UP));
    if (dpadDown) dpadDown.addEventListener('click', () => handleBtn(DIRECTION.DOWN));
    if (dpadLeft) dpadLeft.addEventListener('click', () => handleBtn(DIRECTION.LEFT));
    if (dpadRight) dpadRight.addEventListener('click', () => handleBtn(DIRECTION.RIGHT));
  }
}

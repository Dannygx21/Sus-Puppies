/**
 * CountDown decrements `gameState.timer` every second and calls `cb` with
 * each new value (including 0).
 *
 * Public API:
 *   start()        – resume or begin counting down
 *   stop()         – pause and clear the timer
 *   newCountDown() – reset to initTimer and start fresh
 */
class CountDown {
  constructor(gameState, cb = (time) => time) {
    this.gameState = gameState;
    this.cb = cb;
    this.isCounting = false;
    this._ref = null;

    this._tick = this._tick.bind(this);
  }

  /** Internal tick — do not call directly. */
  _tick(reset = false) {
    if (reset) {
      this.stop();
      this.gameState.timer = this.gameState.initTimer;
    }

    this.isCounting = true;
    this._ref = setTimeout(this._tick, 1000);
    this.cb(--this.gameState.timer);
  }

  /** Resume the current countdown, or start a new one if timer has hit 0. */
  start() {
    if (this.isCounting) return;
    if (this.gameState.timer > 0) {
      this._tick(false);
    } else {
      this._tick(true);
    }
  }

  /** Pause the countdown without resetting the timer. */
  stop() {
    this.isCounting = false;
    clearTimeout(this._ref);
  }

  /** Reset to initTimer and start a fresh countdown. */
  newCountDown() {
    this.stop();
    this.gameState.timer = this.gameState.initTimer;
    this.start();
  }
}

module.exports = CountDown;
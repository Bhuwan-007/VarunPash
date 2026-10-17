/**
 * Input manager handling keyboard events for player movement and actions.
 * Supports WASD, Arrow keys, E (interact), J (journal), and Esc.
 */
export class InputManager {
  private keysDown: Set<string> = new Set();
  private justPressed: Set<string> = new Set();

  private onKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (!this.keysDown.has(key)) {
      this.justPressed.add(key);
    }
    this.keysDown.add(key);

    // Prevent scrolling with arrows or spacebar
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
      e.preventDefault();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    this.keysDown.delete(key);
  };

  private onBlur = () => {
    this.keysDown.clear();
    this.justPressed.clear();
  };

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  public isKeyDown(key: string): boolean {
    return this.keysDown.has(key.toLowerCase());
  }

  public wasActionJustPressed(
    action: 'interact' | 'journal' | 'escape' | 'debugRestart' | 'debugTimeScale'
  ): boolean {
    if (action === 'debugRestart') {
      return Boolean(import.meta.env.DEV) && this.justPressed.has('r');
    }
    if (action === 'debugTimeScale') {
      return Boolean(import.meta.env.DEV) && this.justPressed.has('t');
    }
    let pressed = false;
    if (action === 'interact') {
      pressed = this.justPressed.has('e');
    } else if (action === 'journal') {
      pressed = this.justPressed.has('j');
    } else if (action === 'escape') {
      pressed = this.justPressed.has('escape');
    }
    return pressed;
  }

  /**
   * Reset single-frame action states. Called at the end of each game update tick.
   */
  public endFrame(): void {
    this.justPressed.clear();
  }

  /**
   * Returns normalized movement vector based on WASD and arrow keys.
   */
  public getMovementVector(): { dx: number; dy: number } {
    let x = 0;
    let y = 0;

    if (this.isKeyDown('w') || this.isKeyDown('arrowup')) y -= 1;
    if (this.isKeyDown('s') || this.isKeyDown('arrowdown')) y += 1;
    if (this.isKeyDown('a') || this.isKeyDown('arrowleft')) x -= 1;
    if (this.isKeyDown('d') || this.isKeyDown('arrowright')) x += 1;

    if (x !== 0 && y !== 0) {
      const invLen = 1 / Math.SQRT2;
      return { dx: x * invLen, dy: y * invLen };
    }

    return { dx: x, dy: y };
  }

  public dispose(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.keysDown.clear();
    this.justPressed.clear();
  }
}

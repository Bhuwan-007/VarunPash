export class ScreenShake {
  private intensity: number = 0;
  private duration: number = 0;
  private timer: number = 0;

  public trigger(intensity: number, duration: number): void {
    this.intensity = intensity;
    this.duration = duration;
    this.timer = duration;
  }

  public update(dt: number): void {
    if (this.timer > 0) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.intensity = 0;
        this.timer = 0;
      }
    }
  }

  public getOffset(): { offsetX: number; offsetY: number } {
    if (this.timer <= 0 || this.intensity <= 0) {
      return { offsetX: 0, offsetY: 0 };
    }

    const progress = this.timer / this.duration;
    const currentMag = this.intensity * progress;
    const offsetX = (Math.random() * 2 - 1) * currentMag;
    const offsetY = (Math.random() * 2 - 1) * currentMag;

    return { offsetX, offsetY };
  }
}

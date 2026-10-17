import { CONFIG } from '../config';

export class Camera {
  public x: number = 0; // World pixel X of top-left viewport
  public y: number = 0; // World pixel Y of top-left viewport
  public readonly viewportWidth: number = CONFIG.CANVAS_WIDTH;
  public readonly viewportHeight: number = CONFIG.CANVAS_HEIGHT;

  constructor(initialX: number = 0, initialY: number = 0) {
    this.x = initialX;
    this.y = initialY;
  }

  /**
   * Updates camera position to track a target point (e.g. player) and clamp to map boundaries.
   * If immediate is true, snaps without interpolation (used on scene transition).
   */
  public update(
    targetWorldX: number,
    targetWorldY: number,
    mapWidthTiles: number,
    mapHeightTiles: number,
    immediate: boolean = false
  ): void {
    const mapWidthPx = mapWidthTiles * CONFIG.TILE_SIZE;
    const mapHeightPx = mapHeightTiles * CONFIG.TILE_SIZE;

    // Desired camera top-left to center target
    let desiredX = targetWorldX - this.viewportWidth / 2;
    let desiredY = targetWorldY - this.viewportHeight / 2;

    // Clamp or center X
    if (mapWidthPx <= this.viewportWidth) {
      desiredX = (mapWidthPx - this.viewportWidth) / 2;
    } else {
      desiredX = Math.max(0, Math.min(desiredX, mapWidthPx - this.viewportWidth));
    }

    // Clamp or center Y
    if (mapHeightPx <= this.viewportHeight) {
      desiredY = (mapHeightPx - this.viewportHeight) / 2;
    } else {
      desiredY = Math.max(0, Math.min(desiredY, mapHeightPx - this.viewportHeight));
    }

    if (immediate) {
      this.x = desiredX;
      this.y = desiredY;
    } else {
      // Smooth lerp (10% per frame at 60Hz)
      this.x += (desiredX - this.x) * 0.12;
      this.y += (desiredY - this.y) * 0.12;
    }
  }

  public worldToScreen(worldX: number, worldY: number): { screenX: number; screenY: number } {
    return {
      screenX: worldX - this.x,
      screenY: worldY - this.y,
    };
  }

  public screenToWorld(screenX: number, screenY: number): { worldX: number; worldY: number } {
    return {
      worldX: screenX + this.x,
      worldY: screenY + this.y,
    };
  }
}

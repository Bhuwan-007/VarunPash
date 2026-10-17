import { CONFIG, PALETTE } from '../../config';

export class WaterEffect {
  public draw(ctx: CanvasRenderingContext2D, time: number): void {
    ctx.save();
    ctx.strokeStyle = PALETTE.Deepwater;
    ctx.lineWidth = 2;

    const waveCount = 9;
    for (let i = 0; i < waveCount; i++) {
      const y = (i * 90 + time * 18) % CONFIG.CANVAS_HEIGHT;
      const offset = Math.sin(time * 1.5 + i * 0.8) * 25;

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        320 + offset, y - 12,
        640 - offset, y + 12,
        CONFIG.CANVAS_WIDTH, y
      );
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Draws in-world encroaching tide water creeping onto the deck as deaths increase.
   * Replaces UI text warnings with atmospheric dread (FEEL.md §4).
   */
  public drawDeckWaterCreep(
    ctx: CanvasRenderingContext2D,
    deathCount: number,
    time: number,
    camX: number,
    camY: number,
    mapWidth: number,
    mapHeight: number,
    scene: 'deck' | 'hold'
  ): void {
    if (deathCount <= 0 || scene !== 'deck') return;

    ctx.save();

    // Creep factor up to max death limit
    const creepFactor = Math.min(deathCount / CONFIG.MAX_DEATHS, 1);
    const creepHeightPx = creepFactor * 54;

    const bottomRailWorldY = (mapHeight - 1) * CONFIG.TILE_SIZE;
    const screenBottomY = bottomRailWorldY - camY - creepHeightPx;

    const mapWidthPx = mapWidth * CONFIG.TILE_SIZE;
    const screenLeftX = 0 - camX;
    const screenRightX = mapWidthPx - camX;

    const slosh = Math.sin(time * 2) * 5;

    // 1. Water wash creeping up from bottom rail
    ctx.fillStyle = 'rgba(18, 48, 61, 0.48)';
    ctx.fillRect(screenLeftX, screenBottomY + slosh, mapWidthPx, creepHeightPx + 60);

    // 2. Translucent foam line along the water's leading edge
    ctx.strokeStyle = 'rgba(95, 211, 196, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(screenLeftX, screenBottomY + slosh);
    for (let x = screenLeftX; x <= screenRightX; x += 32) {
      const wave = Math.sin((x + time * 50) * 0.04) * 4;
      ctx.lineTo(x, screenBottomY + slosh + wave);
    }
    ctx.stroke();

    // 3. Water creeping from top rail
    const topRailWorldY = CONFIG.TILE_SIZE;
    const screenTopY = topRailWorldY - camY;
    const topCreep = creepFactor * 32;
    ctx.fillStyle = 'rgba(18, 48, 61, 0.38)';
    ctx.fillRect(screenLeftX, screenTopY - 10, mapWidthPx, topCreep);

    // 4. In-world puddle formations on deck planks when deaths accumulate
    if (deathCount >= 5) {
      ctx.fillStyle = 'rgba(18, 48, 61, 0.32)';
      const puddleCount = Math.min(Math.floor(deathCount * 0.8), 12);
      for (let p = 0; p < puddleCount; p++) {
        const px = (p * 220 + 80) - camX;
        const py = (4 * CONFIG.TILE_SIZE + (p % 2 === 0 ? 25 : -20)) - camY;
        const pr = 14 + (deathCount - 5) * 2 + Math.sin(time + p) * 2;

        ctx.beginPath();
        ctx.ellipse(px, py, pr * 1.5, pr * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(95, 211, 196, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

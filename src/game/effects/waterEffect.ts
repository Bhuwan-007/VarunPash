import { CONFIG, PALETTE } from '../../config';

export class WaterEffect {
  public draw(ctx: CanvasRenderingContext2D, time: number): void {
    const { CANVAS_WIDTH, CANVAS_HEIGHT } = CONFIG;
    ctx.save();

    // 1. Deep ocean gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGrad.addColorStop(0, '#050911');
    bgGrad.addColorStop(0.5, '#08121c');
    bgGrad.addColorStop(1, '#050911');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Harmonic ocean swells (flowing south-southeast with the current)
    const swellLayers = [
      { speed: 22, driftX: 8, freq: 0.006, amp: 22, color: 'rgba(14, 38, 52, 0.55)', lineWidth: 32 },
      { speed: 34, driftX: 14, freq: 0.010, amp: 16, color: 'rgba(22, 60, 76, 0.45)', lineWidth: 18 },
      { speed: 46, driftX: 20, freq: 0.015, amp: 12, color: 'rgba(32, 88, 104, 0.35)', lineWidth: 10 },
      { speed: 58, driftX: 26, freq: 0.022, amp: 8, color: 'rgba(95, 211, 196, 0.22)', lineWidth: 4 },
    ];

    for (const layer of swellLayers) {
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = layer.lineWidth;

      const spacing = 110;
      const count = Math.ceil(CANVAS_HEIGHT / spacing) + 3;

      for (let i = -2; i < count; i++) {
        const baseY = ((i * spacing + time * layer.speed) % (CANVAS_HEIGHT + spacing * 2)) - spacing;
        const driftOffsetX = (time * layer.driftX) % 300;

        ctx.beginPath();
        for (let x = -40; x <= CANVAS_WIDTH + 40; x += 30) {
          const wave1 = Math.sin((x + driftOffsetX) * layer.freq + time * 1.4) * layer.amp;
          const wave2 = Math.cos((x - driftOffsetX * 0.5) * (layer.freq * 1.8) - time * 0.9) * (layer.amp * 0.4);
          const y = baseY + wave1 + wave2;

          if (x === -40) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    }

    // 3. Dynamic surface foam crests & whitecap streaks drifting downstream
    ctx.lineWidth = 1.8;
    const streakCount = 28;
    for (let s = 0; s < streakCount; s++) {
      const seedX = (s * 197) % CANVAS_WIDTH;
      const seedY = (s * 131) % CANVAS_HEIGHT;
      const speed = 40 + (s % 5) * 8;

      const currentX = (seedX + time * 16) % (CANVAS_WIDTH + 160) - 80;
      const currentY = (seedY + time * speed) % (CANVAS_HEIGHT + 120) - 60;
      const streakLength = 35 + (s % 6) * 12;

      ctx.strokeStyle = s % 3 === 0 ? 'rgba(232, 240, 245, 0.45)' : 'rgba(95, 211, 196, 0.35)';
      ctx.beginPath();
      ctx.moveTo(currentX, currentY);

      const midX = currentX + streakLength * 0.5;
      const midY = currentY + Math.sin(time * 3 + s) * 5;
      const endX = currentX + streakLength;
      const endY = currentY - 2;

      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();

      if (s % 2 === 0) {
        ctx.fillStyle = 'rgba(240, 248, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(midX, midY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
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

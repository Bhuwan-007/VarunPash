import { CONFIG } from '../../config';

export class LightingEffect {
  public draw(
    ctx: CanvasRenderingContext2D,
    playerScreenX: number,
    playerScreenY: number,
    glowTargets?: { x: number; y: number; color: string; radius: number }[]
  ): void {
    ctx.save();

    // 1. Warm player lantern glow
    const playerGrad = ctx.createRadialGradient(
      playerScreenX,
      playerScreenY,
      10,
      playerScreenX,
      playerScreenY,
      140
    );
    playerGrad.addColorStop(0, 'rgba(242, 165, 65, 0.22)'); // Lantern color
    playerGrad.addColorStop(1, 'rgba(242, 165, 65, 0)');

    ctx.fillStyle = playerGrad;
    ctx.beginPath();
    ctx.arc(playerScreenX, playerScreenY, 140, 0, Math.PI * 2);
    ctx.fill();

    // 2. Extra glow targets (relics, interactables)
    if (glowTargets) {
      for (const target of glowTargets) {
        const grad = ctx.createRadialGradient(
          target.x,
          target.y,
          5,
          target.x,
          target.y,
          target.radius
        );
        grad.addColorStop(0, target.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Vignette around screen edges
    const vigGrad = ctx.createRadialGradient(
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2,
      CONFIG.CANVAS_WIDTH * 0.35,
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2,
      CONFIG.CANVAS_WIDTH * 0.65
    );
    vigGrad.addColorStop(0, 'rgba(7, 9, 15, 0)');
    vigGrad.addColorStop(1, 'rgba(7, 9, 15, 0.75)');

    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    ctx.restore();
  }
}

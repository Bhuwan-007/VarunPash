import { ASSET_MANIFEST, AssetDef } from './manifest';

export class AssetLoader {
  private images: Map<string, HTMLImageElement> = new Map();
  private loadedSet: Set<string> = new Set();
  private failedSet: Set<string> = new Set();
  private manifestMap: Map<string, AssetDef> = new Map();

  constructor() {
    for (const def of ASSET_MANIFEST) {
      this.manifestMap.set(def.id, def);
    }
  }

  /**
   * Preloads all manifest assets asynchronously.
   * If an asset image is not found in public/assets/, it silently marks it as failed
   * and the renderer automatically falls back to procedural drawing.
   */
  public preloadAll(): void {
    for (const def of ASSET_MANIFEST) {
      const img = new Image();
      img.onload = () => {
        this.loadedSet.add(def.id);
        this.images.set(def.id, img);
      };
      img.onerror = () => {
        this.failedSet.add(def.id);
      };
      img.src = def.path;
    }
  }

  public getDef(id: string): AssetDef | undefined {
    return this.manifestMap.get(id);
  }

  public getImage(id: string): HTMLImageElement | null {
    if (this.loadedSet.has(id)) {
      return this.images.get(id) ?? null;
    }
    return null;
  }

  public isLoaded(id: string): boolean {
    return this.loadedSet.has(id);
  }

  /**
   * Attempts to draw a sprite/image asset.
   * Supports sprite sheets (4 directions x 3 frames: idle + 2 walk frames).
   * Returns true if drawn with real image, false if procedural fallback is required.
   */
  public drawAsset(
    ctx: CanvasRenderingContext2D,
    id: string,
    x: number,
    y: number,
    options?: {
      direction?: 'down' | 'up' | 'left' | 'right';
      frameIndex?: number;
      destWidth?: number;
      destHeight?: number;
      opacity?: number;
    }
  ): boolean {
    const img = this.getImage(id);
    const def = this.getDef(id);
    if (!img || !def) return false;

    ctx.save();
    if (options?.opacity !== undefined) {
      ctx.globalAlpha = options.opacity;
    }

    if (def.isSpriteSheet && def.frameWidth && def.frameHeight) {
      const dirIndexMap = { down: 0, up: 1, left: 2, right: 3 };
      const dir = options?.direction ?? 'down';
      const row = dirIndexMap[dir] ?? 0;
      const col = (options?.frameIndex ?? 0) % (def.framesPerDir ?? 3);

      const sx = col * def.frameWidth;
      const sy = row * def.frameHeight;
      const sw = def.frameWidth;
      const sh = def.frameHeight;

      const dw = options?.destWidth ?? def.frameWidth;
      const dh = options?.destHeight ?? def.frameHeight;
      const dx = x - dw * def.anchorX;
      const dy = y - dh * def.anchorY;

      ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    } else {
      const dw = options?.destWidth ?? def.pixelWidth;
      const dh = options?.destHeight ?? def.pixelHeight;
      const dx = x - dw * def.anchorX;
      const dy = y - dh * def.anchorY;

      ctx.drawImage(img, dx, dy, dw, dh);
    }

    ctx.restore();
    return true;
  }
}

export const assetLoader = new AssetLoader();

import { CONFIG } from '../config';
import { useLoopStore } from '../store/loopStore';
import { useMemoryStore } from '../store/memoryStore';
import { useUIStore } from '../store/uiStore';
import { Camera } from './camera';
import { assertWalkablePositions, findNearestWalkableTile } from './collision';
import { ScreenShake } from './effects/screenShake';
import { Player, PlayerState } from './entities/player';
import { InputManager } from './input';
import { LoopManager } from './systems/loopManager';
import { createDeckMap, GameMap } from './world/deckMap';
import { createHoldMap } from './world/holdMap';
import { Interactable, SceneId } from './world/interactables';

export interface ReadonlyGameState {
  readonly scene: SceneId;
  readonly map: GameMap;
  readonly player: PlayerState;
  readonly camera: {
    readonly x: number;
    readonly y: number;
    readonly viewportWidth: number;
    readonly viewportHeight: number;
  };
  readonly shakeOffset: {
    readonly offsetX: number;
    readonly offsetY: number;
  };
  readonly activeInteractable: Interactable | null;
  readonly messageBanner: string | null;
  readonly frameTime: number;
  readonly shipTime: number;
  readonly deathCount: number;
  readonly inkFadeAlpha: number;
}

export class GameEngine {
  private input: InputManager;
  private camera: Camera;
  private player: Player;
  private screenShake: ScreenShake;
  public loopManager: LoopManager;

  private scene: SceneId = 'deck';
  private deckMap: GameMap;
  private holdMap: GameMap;

  private activeInteractable: Interactable | null = null;
  private messageBanner: string | null = null;
  private messageTimer: number = 0;

  private transitionCooldown: number = 0;
  private inkFadeTimer: number = 0;
  private readonly INK_FADE_DURATION: number = 0.4;

  private isRunning: boolean = false;
  private lastTimestamp: number = 0;
  private accumulator: number = 0;
  private readonly fixedTimestep: number = 1 / 60; // 60 Hz fixed timestep
  private frameTime: number = 0;

  private onRenderCallback?: (state: ReadonlyGameState) => void;

  constructor() {
    this.input = new InputManager();
    this.camera = new Camera();
    this.screenShake = new ScreenShake();
    this.loopManager = new LoopManager();

    this.deckMap = createDeckMap();
    this.holdMap = createHoldMap();

    // Dev-only startup assertion: ensure all spawn and transition points are walkable
    if (import.meta.env.DEV) {
      assertWalkablePositions(this.deckMap, this.holdMap);
    }

    // Start player at safe initial deck spawn
    const safeSpawn = findNearestWalkableTile(
      this.deckMap,
      this.deckMap.spawnPosition.x,
      this.deckMap.spawnPosition.y
    );
    this.player = new Player(safeSpawn.x, safeSpawn.y);

    // Initial camera placement
    const targetPxX = this.player.x * CONFIG.TILE_SIZE;
    const targetPxY = this.player.y * CONFIG.TILE_SIZE;
    this.camera.update(targetPxX, targetPxY, this.deckMap.width, this.deckMap.height, true);

    // Setup loopManager callbacks
    this.loopManager.setCallbacks({
      onRespawn: (startScene, startPos) => {
        this.scene = startScene;
        const activeMap = this.getActiveMap();
        const safePos = findNearestWalkableTile(activeMap, startPos.x, startPos.y);
        this.player.setPosition(safePos.x, safePos.y);

        this.transitionCooldown = 0.4;
        this.inkFadeTimer = this.INK_FADE_DURATION;

        this.camera.update(
          this.player.x * CONFIG.TILE_SIZE,
          this.player.y * CONFIG.TILE_SIZE,
          activeMap.width,
          activeMap.height,
          true
        );

        this.messageBanner = 'The tide rewinds...';
        this.messageTimer = 2.0;
      },
      onShake: (intensity, duration) => {
        this.screenShake.trigger(intensity, duration);
      },
    });
  }

  public setRenderCallback(callback: (state: ReadonlyGameState) => void): void {
    this.onRenderCallback = callback;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTimestamp = performance.now();
    this.accumulator = 0;
    requestAnimationFrame(this.gameLoop);
  }

  public stop(): void {
    this.isRunning = false;
  }

  public dispose(): void {
    this.stop();
    this.input.dispose();
  }

  private gameLoop = (timestamp: number) => {
    if (!this.isRunning) return;

    let elapsed = (timestamp - this.lastTimestamp) / 1000;
    if (elapsed > 0.1) elapsed = 0.1;
    this.lastTimestamp = timestamp;
    this.accumulator += elapsed;
    this.frameTime += elapsed;

    // Fixed timestep update ticks
    while (this.accumulator >= this.fixedTimestep) {
      this.update(this.fixedTimestep);
      this.accumulator -= this.fixedTimestep;
    }

    // Render snapshot
    if (this.onRenderCallback) {
      this.onRenderCallback(this.getReadonlyState());
    }

    requestAnimationFrame(this.gameLoop);
  };

  private getActiveMap(): GameMap {
    return this.scene === 'deck' ? this.deckMap : this.holdMap;
  }

  private update(dt: number): void {
    // 1. Advance ship time in loopStore
    useLoopStore.getState().tick(dt);
    const shipTime = useLoopStore.getState().shipTime;

    // 2. Check ship sinking deadline (600s)
    if (shipTime >= CONFIG.TIMELINE && !this.loopManager.isDeathInProgress()) {
      this.loopManager.handleDeath('The Jal-Doot succumbed to the Abyssal Tide.');
      return;
    }

    // 3. Update screen shake
    this.screenShake.update(dt);

    // If death sequence is active, freeze movement
    if (this.loopManager.isDeathInProgress()) {
      this.input.endFrame();
      return;
    }

    const activeMap = this.getActiveMap();
    const uiState = useUIStore.getState();

    // Handle J key to toggle journal
    if (this.input.wasActionJustPressed('journal') && !uiState.activeDialogue) {
      uiState.toggleJournal();
    }

    // 4. Movement update (frozen while journal or dialogue is active)
    const isPlayerLocked = uiState.journalOpen || uiState.activeDialogue !== null;
    const moveDir = isPlayerLocked ? { dx: 0, dy: 0 } : this.input.getMovementVector();
    this.player.update(moveDir, dt, activeMap);

    // Sync player tile position with loopStore
    useLoopStore.getState().setPlayerPos({ x: this.player.x, y: this.player.y });

    // 5. Camera tracking
    const playerWorldPxX = this.player.x * CONFIG.TILE_SIZE;
    const playerWorldPxY = this.player.y * CONFIG.TILE_SIZE;
    this.camera.update(playerWorldPxX, playerWorldPxY, activeMap.width, activeMap.height);

    // 6. Proximity check for interactables
    let closest: Interactable | null = null;
    let minDistance = Infinity;

    for (const item of activeMap.interactables) {
      const centerX = item.x + (item.width ?? 1) / 2;
      const centerY = item.y + (item.height ?? 1) / 2;
      const dist = Math.hypot(this.player.x - centerX, this.player.y - centerY);

      if (dist <= CONFIG.INTERACT_RADIUS && dist < minDistance) {
        closest = item;
        minDistance = dist;
      }
    }
    this.activeInteractable = closest;

    // 7. Interaction action [E]
    if (this.transitionCooldown > 0) {
      this.transitionCooldown -= dt;
    }
    if (this.inkFadeTimer > 0) {
      this.inkFadeTimer -= dt;
    }
    if (uiState.interactionIgnoreTimer > 0) {
      uiState.setInteractionIgnoreTimer(Math.max(0, uiState.interactionIgnoreTimer - dt));
    }

    const canInteract =
      this.transitionCooldown <= 0 &&
      uiState.interactionIgnoreTimer <= 0 &&
      !uiState.journalOpen &&
      !uiState.activeDialogue;

    if (this.input.wasActionJustPressed('interact') && this.activeInteractable && canInteract) {
      this.triggerInteraction(this.activeInteractable);
    }

    // Dev Hotkeys (only active when import.meta.env.DEV is true)
    if (this.input.wasActionJustPressed('debugTimeScale')) {
      const current = useLoopStore.getState().timeScale;
      const next = current === 1 ? 2 : current === 2 ? 5 : 1;
      useLoopStore.getState().setTimeScale(next);
      this.messageBanner = `Time scale: ${next}x`;
      this.messageTimer = 1.5;
    }

    if (this.input.wasActionJustPressed('debugRestart')) {
      this.loopManager.fullResetGame();
      this.messageBanner = 'Game Reset (New Game)';
      this.messageTimer = 2.0;
    }


    // 8. Message banner timer
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) {
        this.messageBanner = null;
      }
    }

    this.input.endFrame();
  }

  private triggerInteraction(interactable: Interactable): void {
    if (interactable.id === 'npc_bhima') {
      const started = useUIStore.getState().startDialogue('bhima');
      if (started) return;
    }

    if (interactable.type === 'hatch' && interactable.targetScene && interactable.targetPosition) {
      this.scene = interactable.targetScene;
      useLoopStore.getState().setScene(this.scene);

      const targetMap = this.getActiveMap();
      const safePos = findNearestWalkableTile(
        targetMap,
        interactable.targetPosition.x,
        interactable.targetPosition.y
      );

      this.player.setPosition(safePos.x, safePos.y);

      // Ignore 'E' for 0.4s and trigger brief ink transition fade
      this.transitionCooldown = 0.4;
      this.inkFadeTimer = this.INK_FADE_DURATION;

      this.camera.update(
        this.player.x * CONFIG.TILE_SIZE,
        this.player.y * CONFIG.TILE_SIZE,
        targetMap.width,
        targetMap.height,
        true
      );

      this.messageBanner = this.scene === 'hold' ? 'Entered Cargo Hold' : 'Returned to Main Deck';
      this.messageTimer = 2.0;
    } else {
      this.messageBanner = `Examine: ${interactable.label}`;
      this.messageTimer = 2.5;
    }
  }

  public getReadonlyState(): ReadonlyGameState {
    const shakeOffset = this.screenShake.getOffset();
    const shipTime = useLoopStore.getState().shipTime;
    const deathCount = useMemoryStore.getState().deathCount;

    // Ink fade curve: smooth sine wave over 0.4s duration
    const progress = this.inkFadeTimer > 0 ? 1 - this.inkFadeTimer / this.INK_FADE_DURATION : 0;
    const inkFadeAlpha = this.inkFadeTimer > 0 ? Math.sin(progress * Math.PI) : 0;

    return {
      scene: this.scene,
      map: this.getActiveMap(),
      player: this.player.getState(),
      camera: {
        x: this.camera.x,
        y: this.camera.y,
        viewportWidth: this.camera.viewportWidth,
        viewportHeight: this.camera.viewportHeight,
      },
      shakeOffset,
      activeInteractable: this.activeInteractable,
      messageBanner: this.messageBanner,
      frameTime: this.frameTime,
      shipTime,
      deathCount,
      inkFadeAlpha,
    };
  }
}

import { CONFIG } from '../config';
import { useLoopStore } from '../store/loopStore';
import { useMemoryStore } from '../store/memoryStore';
import { useUIStore } from '../store/uiStore';
import { playDoorKnock, playGunshot, playKnifeStab, playMakaraRumble } from '../utils/audio';
import { Camera } from './camera';
import { assertWalkablePositions, DynamicObstacle, findNearestWalkableTile } from './collision';
import { ScreenShake } from './effects/screenShake';
import { Player, PlayerState } from './entities/player';
import { InputManager } from './input';
import { EventScheduler, EventStatus } from './systems/eventScheduler';
import { addKnowledge } from './systems/knowledge';
import { LoopManager } from './systems/loopManager';
import { triggerMoment } from './systems/moments';
import { MutineerSilhouette, NpcScheduler, NpcScheduleState } from './systems/npcScheduler';
import { createDeckMap, GameMap } from './world/deckMap';
import { createHoldMap } from './world/holdMap';
import { Interactable, SceneId } from './world/interactables';

export interface ActiveBark {
  id: string;
  npcId: string;
  text: string;
  remainingTime: number;
  duration: number;
}

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
  readonly npcs: readonly NpcScheduleState[];
  readonly mutineers: readonly MutineerSilhouette[];
  readonly eventStatus: EventStatus;
  readonly barks: readonly ActiveBark[];
  readonly playerRole: 'navigator' | 'quartermaster' | 'deckhand';
  readonly dangerHoldProgress: number;
  readonly dangerTargetId: string | null;
  readonly hasPickedDeckLocket: boolean;
  readonly winchHoldProgress: number;
  readonly chantHoldProgress: number;
  readonly lifeboatsLaunched: boolean;
  readonly isOverlayOpen: boolean;
}

export class GameEngine {
  private input: InputManager;
  private camera: Camera;
  private player: Player;
  private screenShake: ScreenShake;
  public loopManager: LoopManager;
  private eventScheduler: EventScheduler;
  private previousShipTime: number = 0;

  private scene: SceneId = 'deck';
  private deckMap: GameMap;
  private holdMap: GameMap;

  private activeInteractable: Interactable | null = null;
  private messageBanner: string | null = null;
  private messageTimer: number = 0;

  private transitionCooldown: number = 0;
  private inkFadeTimer: number = 0;
  private readonly INK_FADE_DURATION: number = 0.4;

  private eavesdropHoldTimer: number = 0;
  private dangerHoldTimer: number = 0;
  private dangerTargetId: string | null = null;
  private winchHoldTimer: number = 0;
  private chantHoldTimer: number = 0;
  private navigatorKnockIndex: number = 0;

  private activeBarks: ActiveBark[] = [];
  private pendingBarkQueue: { id: string; npcId: string; text: string }[] = [];
  private triggeredBarkIds: Set<string> = new Set();
  private barkStaggerTimer: number = 0;
  private ambientBarkTimer: number = 0;

  public clearBarks(): void {
    this.activeBarks = [];
    this.pendingBarkQueue = [];
    this.triggeredBarkIds.clear();
    this.barkStaggerTimer = 0;
    this.ambientBarkTimer = 0;
  }

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
    this.eventScheduler = new EventScheduler();

    this.deckMap = createDeckMap();
    this.holdMap = createHoldMap();

    // Dev-only startup assertion: ensure all spawn, transition, and NPC waypoints are walkable
    if (import.meta.env.DEV) {
      assertWalkablePositions(this.deckMap, this.holdMap);
      NpcScheduler.assertNpcSchedules(this.deckMap, this.holdMap);
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
        this.clearBarks();
        this.scene = startScene;
        const activeMap = this.getActiveMap();
        const safePos = findNearestWalkableTile(activeMap, startPos.x, startPos.y);
        this.player.setPosition(safePos.x, safePos.y);

        this.transitionCooldown = 0.4;
        this.inkFadeTimer = this.INK_FADE_DURATION;
        this.previousShipTime = useLoopStore.getState().shipTime;
        this.dangerHoldTimer = 0;
        this.dangerTargetId = null;
        this.winchHoldTimer = 0;
        this.chantHoldTimer = 0;
        this.eventScheduler.reset();

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
      onDeath: () => {
        this.clearBarks();
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
    this.previousShipTime = useLoopStore.getState().shipTime;
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
    const uiState = useUIStore.getState();
    if (uiState.gameScreen !== 'game') {
      return;
    }

    // 1. Advance ship time in loopStore
    useLoopStore.getState().tick(dt);
    const shipTime = useLoopStore.getState().shipTime;

    // 2. Update screen shake
    this.screenShake.update(dt);

    const prevShipTime = this.previousShipTime;

    // 3. Event Scheduler update (gull cries, makara rumble, sinking death)
    this.eventScheduler.update(shipTime, prevShipTime, {
      onShake: (intensity, duration) => this.screenShake.trigger(intensity, duration),
      onDeath: (cause) => {
        if (cause.includes('drown')) {
          triggerMoment('drowned');
        }
        this.loopManager.handleDeath(cause);
      },
    });

    // If death sequence is active, freeze movement
    if (this.loopManager.isDeathInProgress()) {
      this.previousShipTime = shipTime;
      this.input.endFrame();
      return;
    }

    // Moment hooks for mutiny start at 360 and makara breach at 480 while alive
    if (shipTime >= 360) {
      triggerMoment('stabbing');
    }
    if (shipTime >= 480) {
      triggerMoment('makara');
    }

    // 3b. Makara telegraph low rumble & screen tremor (470 - 479)
    if (this.scene === 'deck' && shipTime >= 470 && shipTime < 480) {
      this.screenShake.trigger(2.0, 0.1);
    }

    // 4. Check environmental death hazards (Makara port side & Mutiny knife proximity)
    if (this.scene === 'deck') {
      // Makara port lethal water edge (x <= 3.2) at or after 480
      if (shipTime >= 480 && this.player.x <= 3.2) {
        addKnowledge('K_Makara_WEAKNESS');
        addKnowledge('K_LEVIATHAN_WEAKNESS');
        playMakaraRumble();
        this.screenShake.trigger(16, 2.0);
        this.loopManager.handleDeath('eaten by Makara');
        this.input.endFrame();
        return;
      }

      // Stand right beside Kedar during mutiny (at or after 360) if not talking
      if (shipTime >= 360 && !uiState.activeDialogue) {
        const kedar = NpcScheduler.getNpcState('kedar', shipTime);
        if (kedar && Math.hypot(this.player.x - kedar.x, this.player.y - kedar.y) <= 0.8) {
          addKnowledge('K_MUTINEER');
          playKnifeStab();
          this.screenShake.trigger(12, 0.5);
          this.loopManager.handleDeath('stabbed by Kedar');
          this.input.endFrame();
          return;
        }
      }
    }

    const activeMap = this.getActiveMap();

    // Handle J key to toggle journal
    if (this.input.wasActionJustPressed('journal') && !uiState.activeDialogue) {
      uiState.toggleJournal();
    }

    // 5. Dynamic NPC Obstacles (solid for the player, pure function of shipTime)
    const currentNpcs = this.getEvacuatingNpcStates(shipTime);
    const lifeboatsLaunched = useLoopStore.getState().lifeboatsLaunched;
    const evacuatingIds = ['bhima', 'isha', 'hari', 'nakhuda'];

    const dynamicObstacles: DynamicObstacle[] = [];
    for (const npc of currentNpcs) {
      // Evacuating NPCs running to lifeboats must not collide or push the player
      if (evacuatingIds.includes(npc.id) && (this.winchHoldTimer > 0 || lifeboatsLaunched)) {
        continue;
      }
      // NPCs in cabin or on another scene are not obstacles on this scene
      if (npc.scene === this.scene && npc.activity !== 'in_cabin') {
        dynamicObstacles.push({ x: npc.x, y: npc.y, radius: 0.3 });
      }
    }

    // Movement update (frozen while journal or dialogue is active)
    const isPlayerLocked = uiState.journalOpen || uiState.activeDialogue !== null;
    const moveDir = isPlayerLocked ? { dx: 0, dy: 0 } : this.input.getMovementVector();
    this.player.update(moveDir, dt, activeMap, dynamicObstacles);

    // Overlap push-out: If a moving NPC overlaps player, push player out so they are never trapped
    for (const obs of dynamicObstacles) {
      const dist = Math.hypot(this.player.x - obs.x, this.player.y - obs.y);
      if (dist < 0.45) {
        const safePos = findNearestWalkableTile(activeMap, this.player.x, this.player.y, 0.18, 0.14, 2.5, dynamicObstacles);
        this.player.setPosition(safePos.x, safePos.y);
        break;
      }
    }

    // 5b. Update active BARKS and queues
    const isPaused = useLoopStore.getState().isPaused || isPlayerLocked;
    if (!isPaused) {
      // 1. Tick remaining time on active barks (freezes while paused/overlay open)
      for (const bark of this.activeBarks) {
        bark.remainingTime -= dt;
      }
      this.activeBarks = this.activeBarks.filter((b) => b.remainingTime > 0);

      // 2. Decrement stagger timer
      if (this.barkStaggerTimer > 0) {
        this.barkStaggerTimer -= dt;
      }

      // 3. Promote queued barks to active barks:
      // Rules: max 1 bark per NPC, at most 2 bubbles on screen at once, stagger starts by 0.4s
      while (
        this.barkStaggerTimer <= 0 &&
        this.activeBarks.length < 2 &&
        this.pendingBarkQueue.length > 0
      ) {
        const nextIdx = this.pendingBarkQueue.findIndex(
          (q) => !this.activeBarks.some((b) => b.npcId === q.npcId)
        );
        if (nextIdx === -1) break;

        const [nextBark] = this.pendingBarkQueue.splice(nextIdx, 1);
        this.activeBarks.push({
          id: nextBark.id,
          npcId: nextBark.npcId,
          text: nextBark.text,
          remainingTime: 2.5,
          duration: 2.5,
        });
        this.barkStaggerTimer = 0.4;
      }

      // 4. Check live event time crossings and ambient lines
      this.checkEventBarks(shipTime, currentNpcs, prevShipTime);
      this.checkAmbientBarks(dt, shipTime, currentNpcs);
    }

    // Sync player tile position with loopStore
    useLoopStore.getState().setPlayerPos({ x: this.player.x, y: this.player.y });

    // 6. Camera tracking
    const playerWorldPxX = this.player.x * CONFIG.TILE_SIZE;
    const playerWorldPxY = this.player.y * CONFIG.TILE_SIZE;
    this.camera.update(playerWorldPxX, playerWorldPxY, activeMap.width, activeMap.height);

    // 7. Proximity check for interactables (Static props + Live NPCs)
    let closest: Interactable | null = null;
    let minDistance = Infinity;
    const playerRole = useMemoryStore.getState().playerRole ?? 'deckhand';

    const hasChant = useMemoryStore.getState().knowledge.includes('K_CHANT');
    const hasPickedLocket = useLoopStore.getState().hasPickedDeckLocketThisLoop;

    for (const item of activeMap.interactables) {
      // Role filtering for secret entrances/vents
      if (item.id === 'navigator_stern_hatch' && playerRole !== 'navigator') {
        continue;
      }
      if (item.id === 'deckhand_deck_vent' && playerRole !== 'deckhand') {
        continue;
      }
      // Skip deck locket if already picked this loop
      if (item.id === 'deck_locket' && hasPickedLocket) {
        continue;
      }

      const centerX = item.x + (item.width ?? 1) / 2;
      const centerY = item.y + (item.height ?? 1) / 2;
      const dist = Math.hypot(this.player.x - centerX, this.player.y - centerY);

      if (dist <= CONFIG.INTERACT_RADIUS && dist < minDistance) {
        // Dynamic labels based on role and shipTime
        let label = item.label;
        if (item.id === 'captain_door') {
          const lifeboatsLaunched = useLoopStore.getState().lifeboatsLaunched;
          if (lifeboatsLaunched) {
            label = "The cabin door is open; Nakhuda has escaped on the lifeboats.";
          } else if (shipTime >= 360) {
            label = "The door is ajar; Nakhuda lies fallen on the quarterdeck.";
          } else if (playerRole === 'navigator') {
            label = "Knock on Captain's Door";
          } else if (shipTime >= 240 && shipTime <= 270) {
            label = "Enter Nakhuda's Cabin (Unlocked)";
          } else {
            label = "Force Cabin Door (Hold E 1s - Danger)";
          }
        } else if (item.id === 'relic_kaal_mani') {
          label = hasChant ? 'Speak the chant (Hold E 2s)' : 'Touch the Kaal Mani (Hold E 1s - Danger)';
        } else if (item.id === 'starboard_winch') {
          const launched = useLoopStore.getState().lifeboatsLaunched;
          label = launched ? 'Davit Winch Plate (Lifeboats Launched)' : 'Lower Lifeboats (Hold E 10s)';
        } else if (item.id === 'quarterdeck_strongbox') {
          const loopStore = useLoopStore.getState();
          if (loopStore.strongboxJammed) {
            label = 'Strongbox (Mechanism Jammed)';
          } else if (loopStore.strongboxOpened) {
            label = 'Strongbox (Open)';
          } else {
            label = 'Strongbox (3-digit lock)';
          }
        } else if (item.id === 'statue_figure') {
          const memory = useMemoryStore.getState();
          const loop = useLoopStore.getState();
          if (memory.knowledge.includes('K_CHANT') && memory.knowledge.includes('K_LOCKET_TWIN')) {
            label = 'Examine Statue Base (Glyphs)';
          } else if (memory.knowledge.includes('K_CHANT') && loop.inventory.includes('Silver Locket')) {
            label = 'Examine Statue (Compare Locket)';
          } else {
            label = 'Examine Petrified Statue';
          }
        } else if (item.id === 'deck_hatch') {
          label = useLoopStore.getState().inventory.includes('Hold Key')
            ? 'Unlock & Enter Cargo Hold (Descend Stairs)'
            : 'Enter Cargo Hold (Locked)';
        } else if (item.id === 'hold_stern_stairs') {
          label =
            playerRole === 'navigator'
              ? 'Ascend Stern Companionway to Deck'
              : "Navigator's Stern Companionway (Chained & Padlocked)";
        } else if (item.id === 'hold_vent_grate') {
          label =
            playerRole === 'deckhand'
              ? 'Crawl through vent to Quarterdeck'
              : 'Ventilation Grate';
        } else if (item.id === 'hold_eavesdrop_vent') {
          if (playerRole === 'deckhand') {
            if (shipTime >= 310 && shipTime <= 335) {
              label = 'Hold [E] to Listen (Eavesdrop on Mutineers)';
            } else {
              label = 'Listening Grate (Silence from beyond the grate)';
            }
          } else {
            label = 'Ventilation Grate';
          }
        }

        closest = { ...item, label };
        minDistance = dist;
      }
    }

    // Check live NPCs on current scene
    for (const npc of currentNpcs) {
      if (npc.scene !== this.scene || npc.activity === 'in_cabin') continue;
      // Do not let evacuating crew members steal interaction from the winch
      if (evacuatingIds.includes(npc.id) && (this.winchHoldTimer > 0 || lifeboatsLaunched)) {
        continue;
      }
      const dist = Math.hypot(this.player.x - npc.x, this.player.y - npc.y);
      if (dist <= CONFIG.INTERACT_RADIUS && dist < minDistance) {
        closest = {
          id: 'npc_' + npc.id,
          scene: npc.scene,
          x: Math.floor(npc.x),
          y: Math.floor(npc.y),
          width: 1,
          height: 1,
          type: 'statue',
          label: npc.isDead ? 'Examine Fallen Nakhuda' : `Talk to ${npc.name}`,
          highlightSize: { width: 0.8, height: 0.8, offsetX: 0.1, offsetY: 0.1 },
        };
        minDistance = dist;
      }
    }

    // Keep active interactable locked to starboard_winch while holding the winch
    const distToWinch = Math.hypot(this.player.x - 12.5, this.player.y - 11.5);
    if (this.winchHoldTimer > 0 && distToWinch <= 2.5) {
      const winchItem = activeMap.interactables.find((i) => i.id === 'starboard_winch');
      if (winchItem) {
        closest = { ...winchItem, label: 'Lower Lifeboats (Hold E 10s)' };
      }
    }
    this.activeInteractable = closest;

    // 7b. Danger Confirmation Hold Check (Hold E for 1.0 second, releasing cancels)
    const isDangerousCabinDoor =
      this.activeInteractable?.id === 'captain_door' &&
      !lifeboatsLaunched &&
      playerRole !== 'navigator' &&
      (shipTime < 240 || (shipTime > 270 && shipTime < 360));

    const isDangerousRelic =
      this.activeInteractable?.id === 'relic_kaal_mani' &&
      !hasChant;

    const isDangerAction = isDangerousCabinDoor || isDangerousRelic;

    if (isDangerAction && this.input.isActionPressed('interact')) {
      this.dangerHoldTimer += dt;
      this.dangerTargetId = this.activeInteractable?.id ?? null;

      if (this.dangerHoldTimer >= 1.0) {
        this.dangerHoldTimer = 0;
        this.dangerTargetId = null;

        if (isDangerousCabinDoor) {
          triggerMoment('shot');
          playGunshot();
          this.screenShake.trigger(14, 0.8);
          addKnowledge('K_SAFE_CODE');
          this.loopManager.handleDeath('shot by Nakhuda');
          return;
        } else if (isDangerousRelic) {
          triggerMoment('kaal_mani');
          this.screenShake.trigger(15, 1.2);
          addKnowledge('K_CHANT');
          this.loopManager.handleDeath('vaporized by Kaal Mani');
          return;
        }
      }
    } else {
      this.dangerHoldTimer = 0;
      this.dangerTargetId = null;
    }

    // 7b2. Lifeboat Launch Winch Hold (Hold E for 10 seconds, releasing resets)
    const isWinchAction =
      (this.activeInteractable?.id === 'starboard_winch' || (this.winchHoldTimer > 0 && distToWinch <= 2.5)) &&
      this.scene === 'deck' &&
      !useLoopStore.getState().lifeboatsLaunched;

    if (isWinchAction && this.input.isActionPressed('interact')) {
      this.winchHoldTimer += dt;
      if (this.winchHoldTimer >= 10.0) {
        this.winchHoldTimer = 0;
        useLoopStore.getState().launchLifeboats();
        this.messageBanner = 'Lifeboats lowered into the sea. The crew has escaped.';
        this.messageTimer = 3.5;
      }
    } else {
      this.winchHoldTimer = 0;
    }

    // 7b3. The Chant at Kaal Mani (Hold E for 2 seconds, releasing resets)
    const distToRelic = Math.hypot(this.player.x - 3.5, this.player.y - 17.5);
    const isChantAction =
      (this.activeInteractable?.id === 'relic_kaal_mani' || (this.chantHoldTimer > 0 && distToRelic <= 2.5)) &&
      this.scene === 'hold' &&
      hasChant;

    if (isChantAction && this.input.isActionPressed('interact')) {
      this.chantHoldTimer += dt;
      if (this.chantHoldTimer >= 2.0) {
        this.chantHoldTimer = 0;
        const boatsLaunched = useLoopStore.getState().lifeboatsLaunched;
        if (shipTime > 590) {
          // Failure case: Water already in the hold
          this.screenShake.trigger(12, 0.8);
          this.loopManager.handleDeath('Too late. The water is already in the hold.');
          return;
        } else if (!boatsLaunched) {
          // Failure case: Crew still aboard
          this.screenShake.trigger(12, 0.8);
          this.loopManager.handleDeath('The crew is still aboard.');
          return;
        } else {
          // Success: The Hero's Sacrifice Ending
          useMemoryStore.getState().recordEnding('hero');
          useUIStore.getState().playCutscene('ending_hero', () => {
            useUIStore.getState().setGameScreen('title');
          });
          return;
        }
      }
    } else {
      this.chantHoldTimer = 0;
    }

    // 7c. Continuous Deckhand Eavesdropping timer (Hold E for 3 seconds between 310 and 335s)
    const isEavesdroppingSpot =
      playerRole === 'deckhand' &&
      this.scene === 'hold' &&
      shipTime >= 310 &&
      shipTime <= 335 &&
      this.activeInteractable?.id === 'hold_eavesdrop_vent';

    if (isEavesdroppingSpot && this.input.isActionPressed('interact')) {
      this.eavesdropHoldTimer += dt;
      const remaining = Math.max(0, 3.0 - this.eavesdropHoldTimer);
      this.messageBanner = `Listening to mutineers... (${remaining.toFixed(1)}s)`;
      this.messageTimer = 0.3;

      if (this.eavesdropHoldTimer >= 3.0) {
        this.eavesdropHoldTimer = 0;
        triggerMoment('meeting');
        addKnowledge('K_MUTINEER', {
          id: 'clue_deckhand_eavesdrop',
          tab: 'Clues',
          title: 'Mutiny in the Hold',
          text: 'Pressed against the iron grate, I heard Kedar whispering with his cutthroats. The mutiny is set for the sixth bell (360s). They plan to strike Thorne down in his quarters.',
        });
        this.messageBanner = "Overheard Kedar's plot: Mutiny set for 360s!";
        this.messageTimer = 4.0;
      }
    } else {
      this.eavesdropHoldTimer = 0;
    }

    // 7d. Gull Omen & Tide Table event observations
    if (this.scene === 'deck' && shipTime >= 355 && shipTime < 360) {
      const currentLoop = useMemoryStore.getState().deathCount + 1;
      useMemoryStore.getState().recordGullSighting(currentLoop);
    }
    if (this.scene === 'deck' && shipTime >= 240 && shipTime <= 270) {
      addKnowledge('TIDE_NAKHUDA_HELM');
    }
    if (shipTime >= 360 && shipTime <= 366) {
      addKnowledge('K_MUTINEER');
    }
    if (shipTime >= 480 && shipTime <= 490) {
      addKnowledge('K_Makara_WEAKNESS');
    }

    // 8. Interaction action [E]
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
      this.triggerInteraction(this.activeInteractable, shipTime);
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

    // 9. Message banner timer
    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) {
        this.messageBanner = null;
      }
    }

    this.previousShipTime = shipTime;
    this.input.endFrame();
  }

  private triggerInteraction(interactable: Interactable, shipTime: number): void {
    const playerRole = useMemoryStore.getState().playerRole ?? 'deckhand';

    // 1. Captain's cabin door
    if (interactable.id === 'captain_door') {
      const lifeboatsLaunched = useLoopStore.getState().lifeboatsLaunched;
      if (lifeboatsLaunched) {
        this.messageBanner = "The cabin door is open; Nakhuda has escaped on the lifeboats.";
        this.messageTimer = 3.0;
        return;
      }

      if (shipTime >= 360) {
        // Nakhuda was killed in the mutiny outside; door is ajar, no danger!
        this.messageBanner = "The door is ajar; Nakhuda lies fallen on the quarterdeck.";
        this.messageTimer = 3.0;
        return;
      }

      if (playerRole === 'navigator') {
        playDoorKnock();
        if (this.navigatorKnockIndex === 0) {
          this.messageBanner = "Thorne (through door): 'Is that you, Navigator? Keep to your charts! The compass is dead, but the wheel must hold!'";
          this.navigatorKnockIndex = 1;
        } else {
          this.messageBanner = "Thorne (through door): 'Do not touch the cargo below! Whatever is humming in the hold, it hungers!'";
          this.navigatorKnockIndex = 0;
        }
        this.messageTimer = 4.0;
        return;
      }

      if (shipTime >= 240 && shipTime <= 270) {
        this.messageBanner = 'The cabin door stands unlocked; Nakhuda is at the helm.';
        this.messageTimer = 2.5;
        return;
      }

      // Non-Navigator while Nakhuda is alive inside requires 1.0s danger hold
      this.messageBanner = 'Hold [E] for 1 second to force the barricaded door.';
      this.messageTimer = 2.0;
      return;
    }

    // 2. Kaal Mani in cargo hold
    if (interactable.id === 'relic_kaal_mani') {
      const memory = useMemoryStore.getState();
      if (memory.knowledge.includes('K_CHANT')) {
        this.messageBanner = 'Hold [E] for 2 seconds to speak the chant.';
        this.messageTimer = 3.0;
        return;
      }
      // Without K_CHANT, touching is deadly and requires 1.0s danger hold
      this.messageBanner = 'Hold [E] for 1 second to touch the humming relic.';
      this.messageTimer = 2.0;
      return;
    }

    // 2b. Starboard Davit Winch Plate
    if (interactable.id === 'starboard_winch') {
      const launched = useLoopStore.getState().lifeboatsLaunched;
      if (launched) {
        this.messageBanner = 'The lifeboats have already been lowered and launched.';
      } else {
        this.messageBanner = 'Hold [E] for 10 seconds to lower the lifeboats.';
      }
      this.messageTimer = 3.0;
      return;
    }

    // 2c. Strongbox on Quarterdeck (3-digit lock)
    if (interactable.id === 'quarterdeck_strongbox') {
      const loopStore = useLoopStore.getState();
      if (loopStore.strongboxJammed) {
        this.messageBanner = 'The lock mechanism is jammed for this loop.';
        this.messageTimer = 3.0;
        return;
      }
      if (loopStore.strongboxOpened) {
        this.messageBanner = 'The strongbox stands open. Both keys have been taken.';
        this.messageTimer = 3.0;
        return;
      }
      useUIStore.getState().openStrongboxKeypad();
      return;
    }

    // 2d. Silver Locket on Main Deck near Hatch
    if (interactable.id === 'deck_locket') {
      const loopStore = useLoopStore.getState();
      if (loopStore.hasPickedDeckLocketThisLoop) {
        return;
      }
      loopStore.pickDeckLocket();
      const memory = useMemoryStore.getState();
      if (!memory.knowledge.includes('CLUE_LOCKET_DECK')) {
        addKnowledge('CLUE_LOCKET_DECK');
      }
      this.messageBanner = "Picked up Silver Locket: 'Return to the start.'";
      this.messageTimer = 3.0;
      return;
    }

    // 2e. Petrified Statue in Cargo Hold
    if (interactable.id === 'statue_figure') {
      triggerMoment('statue');
      const memory = useMemoryStore.getState();
      const loop = useLoopStore.getState();
      const hasChant = memory.knowledge.includes('K_CHANT');
      const carriesLocket = loop.inventory.includes('Silver Locket');
      const hasLocketTwin = memory.knowledge.includes('K_LOCKET_TWIN');

      if (hasChant && hasLocketTwin) {
        addKnowledge('K_STATUE_TRUTH');
        this.messageBanner = 'Glyphs on the base: speak it from above, never from the deep.';
        this.messageTimer = 4.0;
        return;
      }

      if (hasChant && carriesLocket) {
        addKnowledge('K_LOCKET_TWIN');
        this.messageBanner = "The statue's locket matches mine. The engraving is the same.";
        this.messageTimer = 4.0;
        return;
      }

      this.messageBanner = 'A stone figure, hand clasped around a locket. The face is turned away.';
      this.messageTimer = 3.5;
      return;
    }

    // 3. NPC Interactivity
    if (interactable.id.startsWith('npc_')) {
      const npcId = interactable.id.replace('npc_', '');

      // Quartermaster: Bhima and Hari ask for 1 coin on first conversation of each loop
      if (playerRole === 'quartermaster' && (npcId === 'bhima' || npcId === 'hari')) {
        const loopStore = useLoopStore.getState();
        if (!loopStore.chargedNpcsThisLoop.includes(npcId)) {
          if (loopStore.coins >= 1) {
            loopStore.spendCoins(1);
            loopStore.recordChargedNpc(npcId);
            this.messageBanner = `Paid 1 coin to ${npcId === 'bhima' ? 'Bhima' : 'Hari'}. (${loopStore.coins - 1} coins remaining)`;
            this.messageTimer = 2.5;
          } else {
            this.messageBanner = 'No coin, no word.';
            this.messageTimer = 3.0;
            return; // Refuse dialogue
          }
        }
      }

      // Kedar at or after 360: stabs player
      if (npcId === 'kedar' && shipTime >= 360) {
        const started = useUIStore.getState().startDialogue('kedar');
        if (started) return;
        addKnowledge('K_MUTINEER');
        playKnifeStab();
        this.screenShake.trigger(12, 0.5);
        this.loopManager.handleDeath('stabbed by Kedar');
        return;
      }

      // Fallen Nakhuda inspection
      if (npcId === 'nakhuda' && shipTime >= 360) {
        useUIStore.getState().startDialogue('nakhuda');
        return;
      }

      const started = useUIStore.getState().startDialogue(npcId);
      if (started) return;
    }

    // 4. Main deck hatch (needs Hold Key from deck side)
    if (interactable.id === 'deck_hatch') {
      const hasHoldKey = useLoopStore.getState().inventory.includes('Hold Key');
      if (!hasHoldKey) {
        this.messageBanner = "Locked. A key hangs on the Quartermaster's belt.";
        this.messageTimer = 3.0;
        return;
      }
    }

    // 5. Hold stern companionway (unlocked only for Navigator)
    if (interactable.id === 'hold_stern_stairs' && playerRole !== 'navigator') {
      this.messageBanner = 'Chained and padlocked from above.';
      this.messageTimer = 3.0;
      return;
    }

    // 6. Hold vent grate (only Deckhand can crawl through)
    if (interactable.id === 'hold_vent_grate' && playerRole !== 'deckhand') {
      this.messageBanner = 'A narrow iron ventilation grate. Too tight to squeeze through.';
      this.messageTimer = 3.0;
      return;
    }

    // 7. Eavesdrop vent inspection hint
    if (interactable.id === 'hold_eavesdrop_vent') {
      if (playerRole === 'deckhand' && shipTime >= 310 && shipTime <= 335) {
        this.messageBanner = 'Hold [E] for 3 seconds to eavesdrop on the mutineers.';
        this.messageTimer = 2.5;
        return;
      }
      this.messageBanner = 'Silence from beyond the grate.';
      this.messageTimer = 2.5;
      return;
    }

    // 8. Scene Transitions (Hatch, Vents, Companionways)
    if (interactable.targetScene && interactable.targetPosition) {
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

  private checkEventBarks(shipTime: number, currentNpcs: NpcScheduleState[], prevShipTime: number): void {
    const crossedLive = (t: number) => prevShipTime < t && shipTime >= t;

    // Gull at 355 (Bhima)
    if (crossedLive(355)) {
      this.queueBark('gull_355_bhima', 'bhima', 'Look at the spar... three cries! An omen of drowning!');
    }

    // Mutiny at 360 (Bhima, Isha, Hari)
    if (crossedLive(360)) {
      this.queueBark('mutiny_360_bhima', 'bhima', "Gunfire in the captain's cabin! Thorne is down!");
      this.queueBark('mutiny_360_isha', 'isha', 'Stand clear of the battery! Mutineers on deck!');
      this.queueBark('mutiny_360_hari', 'hari', 'Mutiny! Keep clear of the lifeboats if you value your life!');
    }

    // Makara telegraph at 470 (Isha, Hari)
    if (crossedLive(470)) {
      this.queueBark('makara_470_isha', 'isha', "Water's boiling on the port side! Something massive is rising!");
      this.queueBark('makara_470_hari', 'hari', 'Listen to that timber groan... sea demon in the deep!');
    }

    // Makara breach at 480 (Isha, Hari)
    if (crossedLive(480)) {
      this.queueBark('makara_480_isha', 'isha', 'Makara! Fire the broadside! Aim for the glowing throat!');
      this.queueBark('makara_480_hari', 'hari', 'Sweet sea mercy, the jaw on that beast! We are dead men!');
    }
  }

  private queueBark(id: string, npcId: string, text: string): void {
    if (this.triggeredBarkIds.has(id)) return;
    if (this.activeBarks.some((b) => b.npcId === npcId)) return;
    if (this.pendingBarkQueue.some((q) => q.npcId === npcId)) return;

    this.triggeredBarkIds.add(id);
    this.pendingBarkQueue.push({ id, npcId, text });
  }

  private checkAmbientBarks(dt: number, shipTime: number, currentNpcs: NpcScheduleState[]): void {
    const eventStatus = EventScheduler.getEventStatus(shipTime);
    const inEventPhase = eventStatus.phase === 'mutiny' || eventStatus.phase === 'makara';
    const lifeboatsLaunched = useLoopStore.getState().lifeboatsLaunched;

    if (!inEventPhase || lifeboatsLaunched) {
      this.ambientBarkTimer = 0;
      return;
    }

    this.ambientBarkTimer += dt;
    if (this.ambientBarkTimer < 18.0) return; // one ambient line every 15-20 seconds
    this.ambientBarkTimer = 0;

    const eligibleIds = ['bhima', 'isha', 'hari'].filter((id) => {
      const npc = currentNpcs.find((n) => n.id === id);
      return (
        npc &&
        npc.scene === this.scene &&
        npc.activity !== 'in_cabin' &&
        !this.activeBarks.some((b) => b.npcId === id) &&
        !this.pendingBarkQueue.some((q) => q.npcId === id)
      );
    });

    if (eligibleIds.length === 0) return;

    const chosenId = eligibleIds[Math.floor(shipTime / 18) % eligibleIds.length];
    let ambientText = '';

    if (eventStatus.phase === 'mutiny') {
      const mutinyLines: Record<string, string[]> = {
        bhima: [
          'Keep low! Mutineers are watching the quarterdeck!',
          "Thorne is down... who's at the helm?",
        ],
        isha: [
          'Watch the shadows by the hatch!',
          'They took the quarterdeck! Watch your back!',
        ],
        hari: [
          'Mutineers have the deck! Stay clear of the rails!',
          'Keep to the shadows if you value your skin!',
        ],
      };
      const lines = mutinyLines[chosenId] ?? ['Stay alert!'];
      ambientText = lines[Math.floor(shipTime / 36) % lines.length];
    } else if (eventStatus.phase === 'makara') {
      const makaraLines: Record<string, string[]> = {
        bhima: [
          "The hull won't take another breach like that!",
          "It's circling beneath us in the black water!",
        ],
        isha: [
          'Keep clear of the port side!',
          'Black water rising through the scuppers!',
        ],
        hari: [
          'The timber is groaning! She will tear us apart!',
          'Sweet sea mercy, hear that roar from the deep!',
        ],
      };
      const lines = makaraLines[chosenId] ?? ['Watch the water!'];
      ambientText = lines[Math.floor(shipTime / 36) % lines.length];
    }

    if (ambientText) {
      const barkId = `ambient_${chosenId}_${Math.floor(shipTime)}`;
      this.queueBark(barkId, chosenId, ambientText);
    }
  }

  private getEvacuatingNpcStates(shipTime: number): NpcScheduleState[] {
    const rawNpcs = NpcScheduler.getAllNpcStates(shipTime);
    const lifeboatsLaunched = useLoopStore.getState().lifeboatsLaunched;
    const isWinchHolding = this.winchHoldTimer > 0 && !lifeboatsLaunched;
    const winchProgress = Math.min(1.0, this.winchHoldTimer / 10.0);

    const evacuatingIds = ['bhima', 'isha', 'hari'];
    if (shipTime < 360) {
      evacuatingIds.push('nakhuda');
    }

    const lifeboatBoardingSpots: Record<string, { x: number; y: number }> = {
      hari: { x: 13.5, y: 11.0 },
      bhima: { x: 13.5, y: 12.0 },
      isha: { x: 13.5, y: 13.0 },
      nakhuda: { x: 13.5, y: 14.0 },
    };

    return rawNpcs
      .filter((npc) => {
        if (lifeboatsLaunched && evacuatingIds.includes(npc.id)) {
          return false;
        }
        return true;
      })
      .map((npc) => {
        if (isWinchHolding && evacuatingIds.includes(npc.id)) {
          const target = lifeboatBoardingSpots[npc.id] || { x: 13.5, y: 12.0 };
          const curX = npc.scene === 'deck' ? npc.x : 8.0;
          const curY = npc.scene === 'deck' ? npc.y : 11.0;
          const interpX = curX + (target.x - curX) * winchProgress;
          const interpY = curY + (target.y - curY) * winchProgress;
          return {
            ...npc,
            scene: 'deck' as const,
            x: interpX,
            y: interpY,
            activity: 'evacuating',
            isMoving: true,
            facing: 'right' as const,
          };
        }
        return npc;
      });
  }

  public getReadonlyState(): ReadonlyGameState {
    const shakeOffset = this.screenShake.getOffset();
    const shipTime = useLoopStore.getState().shipTime;
    const deathCount = useMemoryStore.getState().deathCount;

    // Ink fade curve: smooth sine wave over 0.4s duration
    const progress = this.inkFadeTimer > 0 ? 1 - this.inkFadeTimer / this.INK_FADE_DURATION : 0;
    const inkFadeAlpha = this.inkFadeTimer > 0 ? Math.sin(progress * Math.PI) : 0;

    const npcs = this.getEvacuatingNpcStates(shipTime);
    const mutineers = NpcScheduler.getMutineers(shipTime);
    const eventStatus = EventScheduler.getEventStatus(shipTime);

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
      npcs,
      mutineers,
      eventStatus,
      barks: this.activeBarks,
      playerRole: useMemoryStore.getState().playerRole ?? 'deckhand',
      dangerHoldProgress: Math.min(1.0, this.dangerHoldTimer / 1.0),
      dangerTargetId: this.dangerTargetId,
      hasPickedDeckLocket: useLoopStore.getState().hasPickedDeckLocketThisLoop,
      winchHoldProgress: Math.min(1.0, this.winchHoldTimer / 10.0),
      chantHoldProgress: Math.min(1.0, this.chantHoldTimer / 2.0),
      lifeboatsLaunched: useLoopStore.getState().lifeboatsLaunched,
      isOverlayOpen:
        useUIStore.getState().journalOpen ||
        useUIStore.getState().activeDialogue !== null ||
        useUIStore.getState().activeCutscene !== null ||
        useUIStore.getState().activeCutsceneId !== null,
    };
  }
}

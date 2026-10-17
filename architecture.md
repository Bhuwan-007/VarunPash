# ARCHITECTURE: VarunPash

## 1. Stack (chosen for safe itch.io deploy)
- **Vite + React + TypeScript**
- **Zustand** for state (with `persist` for memory only)
- **HTML5 Canvas 2D** for the game world, custom lightweight engine (no 3D, no physics library)
- **React DOM overlays** for HUD, dialogue, journal, cutscenes
- **Tailwind CSS** for overlays (optional; plain CSS is fine)
- **Howler.js** or the Web Audio API for sound
- Fonts and assets bundled locally, no external network requests

Why not Next.js: asset paths break on itch's subpath hosting. Vite with `base: './'` works.

## 2. Folder structure
```
src/
  config.ts              // constants from RULES.md
  main.tsx, App.tsx
  game/
    engine.ts            // loop, fixed timestep, render
    camera.ts
    input.ts
    collision.ts         // AABB vs tile grid
    world/
      deckMap.ts, holdMap.ts   // tile grids + zone definitions
      interactables.ts
    entities/
      player.ts, npc.ts, ghost.ts
    systems/
      loopManager.ts     // death, respawn, shift, Drowned Loop
      eventScheduler.ts  // mutiny, gull, Makara, sinking
      npcSchedule.ts
      plates.ts
      ghostRecorder.ts
      journal.ts
  store/
    memoryStore.ts       // persists
    loopStore.ts         // resets on death
    uiStore.ts           // scene, dialogue, journal open
  data/
    dialogue/*.json      // per NPC
    journalEntries.ts
    cinematics.ts        // panel lists and captions
  ui/
    Hud.tsx, Journal.tsx, DialogueBox.tsx, DeathToast.tsx
    Cutscene.tsx, TitleScreen.tsx
  assets/                // manifest + loaders with placeholder fallback
public/assets/{sprites,portraits,cinematics,audio,fonts}/
```

## 3. State

### MemoryStore (persisted to localStorage in try/catch)
```ts
interface MemoryState {
  playerRole: 'navigator' | 'quartermaster' | 'deckhand' | null;
  knowledge: string[];            // flags from RULES.md
  journal: { id: string; tab: string; text: string; loop: number }[];
  deathCount: number;             // also drives respawn offset
  endingsSeen: string[];
  ghost: GhostFrame[] | null;     // previous loop only
  addKnowledge(flag: string, entry?: JournalEntry): boolean; // returns true if new
  recordDeath(cause: string): { strategic: boolean };
  newGame(): void;
}
```

### LoopStore (reset on every death)
```ts
interface LoopState {
  shipTime: number;               // starts at deathCount * RESPAWN_SHIFT
  inventory: string[];
  npcStates: Record<string, NpcState>;
  playerPos: { x: number; y: number };
  scene: 'deck' | 'hold';
  flags: Record<string, boolean>; // doors open, safe open, mutiny stopped, etc.
  plates: Record<string, boolean>;
  reset(startTime: number): void;
}
```

### UIStore
Dialogue state, journal open, paused, active cutscene id, death toast.

## 4. Game loop
- Use `requestAnimationFrame` with a **fixed 60 Hz update** and delta accumulator. **Do not use setInterval for the timer** (it drifts and throttles in background tabs).
- `shipTime += dt * CONFIG.TIME_SCALE` only when not paused (journal, dialogue, hidden tab).
- Each tick: input, player move + collision, NPC schedules, event scheduler, plates, ghost sample, render.
- Event scheduler compares `shipTime` to `CONFIG` thresholds and fires each event once per loop; on spawn, events whose time has already passed are applied immediately in their "in progress" state.

## 5. Loop manager
```
handleDeath(cause):
  result = memory.recordDeath(cause)          // deathCount++, strategic check
  memory.ghost = ghostRecorder.finish()        // save recording
  show DeathToast(result)
  if deathCount >= MAX_DEATHS -> play 'drowned' ending
  else loop.reset(deathCount * RESPAWN_SHIFT); rebuild world; restart
```

## 6. Ghost recorder
- Sample `{t: shipTime, x, y, scene}` at 10 Hz during each loop.
- On next loop, a Ghost entity plays back frames whose `t >= current shipTime` until the recording ends, then fades out.
- Ghost is intangible, drawn translucent teal. It only affects **plates** (check if its position is inside a plate rectangle).

## 7. Dialogue system
```json
{
  "npc": "brine",
  "lines": [
    { "id": "b1", "text": "...", "requires": [], "role": null, "minLoop": 0 },
    { "id": "b_gossip", "text": "...", "requires": ["K_BRINE_GOSSIP"], "role": "quartermaster", "grants": ["K_..."] }
  ]
}
```
Select the highest-priority line whose `requires` are all satisfied. Lines may `grant` flags and journal entries. The player is silent; show NPC portrait plus text.

## 8. Cutscene system
- `Cutscene.tsx` takes a list of `{image, caption, durationMs}` panels, plays them full-screen with a slow pan/zoom, typewriter captions, click or Space to advance.
- If an image file is missing, show a black panel with the caption so the game never breaks.
- Cinematic ids: `intro`, `ending_coward`, `ending_mutineer`, `ending_hero`, `ending_golden`, `ending_drowned`.

## 9. Asset pipeline
- `assets/manifest.ts` lists every asset. The loader returns a procedurally drawn **placeholder** (colored rect or simple pixel shape) if a file is missing.
- Placeholders let you build and test with zero art; real art drops in later by filename.
- Sprite sheets: 32x32 tiles, drawn at integer scale (3x), `image-rendering: pixelated`.

## 10. Map approach
- Two scenes: `deck` (main deck, captain's cabin, quartermaster's quarters, galley, upper deck with listening grate) and `hold` (relic, statue, gold, lifeboat winch is on deck). Hatch tiles transition scenes.
- Maps are tile grids in code; zones (restricted areas, plates, port-side lethal zone) are named rectangles.
- Starting layout guide for the deck (rows are top to bottom, bow on the left):
```
################################
#BBBB....................SSSSSS#   B = bow rail, S = stern
#B.....G.................C....S#   G = galley, C = captain cabin door
#.....................Q.....S##   Q = quartermaster's quarters
#...P..........H.........W...  #   P = port cannons, H = hatch, W = helm
#...P....................L....#   L = lifeboats (starboard)
################################
```
Antigravity may extend this; keep it small enough to cross in about 15 seconds.

## 11. Input
WASD/arrows move, `E` interact, `J` journal, `Esc` pause, `R` restart (debug only, hidden in production), `T` toggles time scale (debug only).

## 12. Debug panel (dev build only)
Show shipTime, deathCount, knowledge flags, role, TIME_SCALE. Buttons: add flag, kill player, jump to time 350/470, force ending. This makes testing the Golden Path possible in minutes.

## 13. Build and deploy to itch.io
1. `vite.config.ts`: `base: './'`
2. `npm run build`, zip the **contents** of `dist/` so `index.html` is at the zip root.
3. itch.io: new project, kind of project **HTML**, upload the zip, tick "This file will be played in the browser".
4. Set viewport 1280x720, enable fullscreen button.
5. **Do a test upload on day 1** with an empty canvas page.
6. After each major system, re-upload and open the itch page, not just localhost.

## 14. Performance and safety
- Cap canvas to 1280x720 internal resolution.
- Preload audio on first click (browser autoplay rules).
- No external requests, no analytics, no remote fonts.
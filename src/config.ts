// Constants from RULES.md & FEEL.md

export const CONFIG = {
  TIMELINE: 600,        // seconds, calm seas to sinking
  RESPAWN_SHIFT: 30,    // seconds added to the loop start per death
  MAX_DEATHS: 20,       // 20th death triggers the Drowned Loop
  MUTINY_AT: 360,       // ship time (T-4:00)
  GULL_AT: 355,         // omen, 5s before mutiny
  MAKARA_AT: 480,       // ship time (T-2:00)
  SINK_AT: 600,
  PLAYER_SPEED: 3.2,    // tiles per second
  INTERACT_RADIUS: 1.2, // tiles
  GHOST_HZ: 10,
  TIME_SCALE: 1,        // debug: set >1 to speed up testing
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  BASE_TILE_SIZE: 32,
  PIXEL_SCALE: 3,
  TILE_SIZE: 96,        // 32 * 3 pixels
} as const;

export const PALETTE = {
  Abyss: '#0b1320',      // backgrounds, sea at night
  Tar: '#07090f',        // outlines, shadows
  Deepwater: '#12303d',  // sea mid-tone
  Driftwood: '#6b5a46',  // planks, props
  Bone: '#e8dfc8',       // paper, text, UI panels
  Lantern: '#f2a541',    // warm light, interactable highlights
  TideGlow: '#5fd3c4',   // relic, ghost, journal highlights
  BloodRust: '#b23a3a',  // danger, mutiny, death
  Ash: '#8a8f98',        // neutral grey, statue stone
} as const;

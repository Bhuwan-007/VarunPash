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
  INTERACT_RADIUS: 1.6, // tiles (generous for 1-tile solid props)
  GHOST_HZ: 10,
  TIME_SCALE: 1,        // debug: set >1 to speed up testing
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  BASE_TILE_SIZE: 32,
  PIXEL_SCALE: 3,
  TILE_SIZE: 96,        // 32 * 3 pixels
} as const;

/**
 * Pure function: calculates the loop's starting shipTime based strictly on deathCount.
 * RULES.md section 2: deathCount * CONFIG.RESPAWN_SHIFT.
 * Nothing may compute the respawn from current shipTime.
 */
export function startTimeForDeaths(deathCount: number): number {
  return Math.max(0, deathCount) * CONFIG.RESPAWN_SHIFT;
}

// Dev-only unit test assertions
if (import.meta.env.DEV) {
  console.assert(startTimeForDeaths(0) === 0, 'startTimeForDeaths(0) must equal 0');
  console.assert(startTimeForDeaths(1) === 30, 'startTimeForDeaths(1) must equal 30');
  console.assert(startTimeForDeaths(2) === 60, 'startTimeForDeaths(2) must equal 60');
  console.assert(startTimeForDeaths(3) === 90, 'startTimeForDeaths(3) must equal 90');
  console.assert(startTimeForDeaths(20) === 600, 'startTimeForDeaths(20) must equal 600');
}


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

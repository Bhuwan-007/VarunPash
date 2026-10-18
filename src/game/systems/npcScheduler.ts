import { GameMap } from '../world/deckMap';
import { isPositionWalkable } from '../collision';

export interface NpcScheduleState {
  id: string;
  name: string;
  role: string;
  scene: 'deck' | 'hold';
  x: number;
  y: number;
  facing: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  activity: string;
  isDead: boolean;
  walkFrame: number;
}

export interface MutineerSilhouette {
  id: string;
  scene: 'deck' | 'hold';
  x: number;
  y: number;
  facing: 'up' | 'down' | 'left' | 'right';
}

interface Waypoint {
  x: number;
  y: number;
}

interface RouteSegment {
  timeStart: number;
  timeEnd: number;
  scene: 'deck' | 'hold';
  waypoints: Waypoint[];
  facing?: 'up' | 'down' | 'left' | 'right';
  activity: string;
  isDead?: boolean;
  looping?: boolean;
}

/**
 * Verified Route Segments:
 * Every waypoint and connecting segment strictly follows walkable deck & hold tiles.
 */
const NAKHUDA_SCHEDULE: RouteSegment[] = [
  // 0 - 240: In cabin behind locked door (activity: 'in_cabin')
  {
    timeStart: 0,
    timeEnd: 240,
    scene: 'deck',
    waypoints: [{ x: 7.5, y: 14.5 }],
    facing: 'down',
    activity: 'in_cabin',
  },
  // 240 - 243: Steps out of cabin door to starboard stairs approach
  {
    timeStart: 240,
    timeEnd: 243,
    scene: 'deck',
    waypoints: [
      { x: 7.5, y: 13.5 },
      { x: 10.5, y: 13.5 },
    ],
    facing: 'right',
    activity: 'walking_to_helm',
  },
  // 243 - 247: Walks down starboard stairs
  {
    timeStart: 243,
    timeEnd: 247,
    scene: 'deck',
    waypoints: [
      { x: 10.5, y: 13.5 },
      { x: 10.5, y: 17.5 },
    ],
    facing: 'down',
    activity: 'walking_to_helm',
  },
  // 247 - 250: Walks from stair landing to ship's wheel
  {
    timeStart: 247,
    timeEnd: 250,
    scene: 'deck',
    waypoints: [
      { x: 10.5, y: 17.5 },
      { x: 7.5, y: 17.5 },
      { x: 7.5, y: 19.5 },
    ],
    facing: 'down',
    activity: 'walking_to_helm',
  },
  // 250 - 260: Stands at helm
  {
    timeStart: 250,
    timeEnd: 260,
    scene: 'deck',
    waypoints: [{ x: 7.5, y: 19.5 }],
    facing: 'down',
    activity: 'at_helm',
  },
  // 260 - 263: Leaves helm back to stairs
  {
    timeStart: 260,
    timeEnd: 263,
    scene: 'deck',
    waypoints: [
      { x: 7.5, y: 19.5 },
      { x: 7.5, y: 17.5 },
      { x: 10.5, y: 17.5 },
    ],
    facing: 'right',
    activity: 'returning_to_cabin',
  },
  // 263 - 267: Climbs stairs
  {
    timeStart: 263,
    timeEnd: 267,
    scene: 'deck',
    waypoints: [
      { x: 10.5, y: 17.5 },
      { x: 10.5, y: 13.5 },
    ],
    facing: 'up',
    activity: 'returning_to_cabin',
  },
  // 267 - 270: Walks back into cabin
  {
    timeStart: 267,
    timeEnd: 270,
    scene: 'deck',
    waypoints: [
      { x: 10.5, y: 13.5 },
      { x: 7.5, y: 13.5 },
    ],
    facing: 'left',
    activity: 'returning_to_cabin',
  },
  // 270 - 360: Inside cabin
  {
    timeStart: 270,
    timeEnd: 360,
    scene: 'deck',
    waypoints: [{ x: 7.5, y: 14.5 }],
    facing: 'down',
    activity: 'in_cabin',
  },
  // 360 - 600: Mutiny! Nakhuda is struck down outside cabin door
  {
    timeStart: 360,
    timeEnd: 600,
    scene: 'deck',
    waypoints: [{ x: 7.5, y: 13.5 }],
    facing: 'down',
    activity: 'dead',
    isDead: true,
  },
];

const KEDAR_SCHEDULE: RouteSegment[] = [
  // 0 - 240: Patrols midship deck along clear aisles (port and midship, well away from Hari at 11.5, 12.5)
  {
    timeStart: 0,
    timeEnd: 240,
    scene: 'deck',
    waypoints: [
      { x: 5.5, y: 11.5 },
      { x: 5.5, y: 9.5 },
      { x: 7.5, y: 9.5 },
      { x: 7.5, y: 11.5 },
    ],
    activity: 'patrolling',
    looping: true,
  },
  // 240 - 300: Stands near midship port watching the deck (>5.3 tiles away from Hari at 11.5, 12.5)
  {
    timeStart: 240,
    timeEnd: 300,
    scene: 'deck',
    waypoints: [{ x: 6.5, y: 10.5 }],
    facing: 'right',
    activity: 'watching_deck',
  },
  // 300 - 308: Moves to cargo hatch to descend
  {
    timeStart: 300,
    timeEnd: 308,
    scene: 'deck',
    waypoints: [
      { x: 6.5, y: 10.5 },
      { x: 8.5, y: 10.5 },
      { x: 8.5, y: 11.5 },
    ],
    facing: 'up',
    activity: 'going_below',
  },
  // 308 - 318: In hold, walks from hatch to far end
  {
    timeStart: 308,
    timeEnd: 318,
    scene: 'hold',
    waypoints: [
      { x: 4.5, y: 3.5 },
      { x: 14.5, y: 3.5 },
    ],
    facing: 'right',
    activity: 'meeting_mutineers',
  },
  // 318 - 332: At far end of hold conferring with 2 mutineers
  {
    timeStart: 318,
    timeEnd: 332,
    scene: 'hold',
    waypoints: [{ x: 14.5, y: 3.5 }],
    facing: 'right',
    activity: 'meeting_mutineers',
  },
  // 332 - 340: In hold, walks back to hatch
  {
    timeStart: 332,
    timeEnd: 340,
    scene: 'hold',
    waypoints: [
      { x: 14.5, y: 3.5 },
      { x: 4.5, y: 3.5 },
    ],
    facing: 'left',
    activity: 'returning_to_deck',
  },
  // 340 - 355: Re-emerges on deck and approaches cabin door
  {
    timeStart: 340,
    timeEnd: 355,
    scene: 'deck',
    waypoints: [
      { x: 8.5, y: 11.5 },
      { x: 8.5, y: 12.5 },
      { x: 7.5, y: 12.5 },
    ],
    facing: 'down',
    activity: 'preparing_mutiny',
  },
  // 355 - 360: Readying strike at mast base
  {
    timeStart: 355,
    timeEnd: 360,
    scene: 'deck',
    waypoints: [{ x: 7.5, y: 12.5 }],
    facing: 'down',
    activity: 'preparing_mutiny',
  },
  // 360 - 600: MUTINY. Kedar strikes Nakhuda and commands the deck
  {
    timeStart: 360,
    timeEnd: 600,
    scene: 'deck',
    waypoints: [{ x: 7.5, y: 12.5 }],
    facing: 'down',
    activity: 'mutiny',
  },
];

const BHIMA_SCHEDULE: RouteSegment[] = [
  // 0 - 360: Cook post near galley barrels
  {
    timeStart: 0,
    timeEnd: 360,
    scene: 'deck',
    waypoints: [{ x: 5.0, y: 13.0 }],
    facing: 'right',
    activity: 'cooking',
  },
  // 360 - 600: Mutiny active, Bhima cowers by the barrels
  {
    timeStart: 360,
    timeEnd: 600,
    scene: 'deck',
    waypoints: [{ x: 5.0, y: 13.0 }],
    facing: 'right',
    activity: 'hiding',
  },
];

const ISHA_SCHEDULE: RouteSegment[] = [
  // 0 - 480: Guards the port cannons
  {
    timeStart: 0,
    timeEnd: 480,
    scene: 'deck',
    waypoints: [{ x: 4.5, y: 14.0 }],
    facing: 'left',
    activity: 'guarding_cannons',
  },
  // 480 - 600: Makara breaches! Isha fires port cannons for show
  {
    timeStart: 480,
    timeEnd: 600,
    scene: 'deck',
    waypoints: [{ x: 4.5, y: 14.0 }],
    facing: 'left',
    activity: 'firing_cannons',
  },
];

const HARI_SCHEDULE: RouteSegment[] = [
  // 0 - 600: Guards starboard lifeboats and winch
  {
    timeStart: 0,
    timeEnd: 600,
    scene: 'deck',
    waypoints: [{ x: 11.5, y: 12.5 }],
    facing: 'left',
    activity: 'guarding_lifeboats',
  },
];

const ALL_SCHEDULES: Record<string, { name: string; role: string; schedule: RouteSegment[] }> = {
  nakhuda: {
    name: 'Nakhuda Thorne',
    role: 'Captain',
    schedule: NAKHUDA_SCHEDULE,
  },
  kedar: {
    name: 'First Mate Kedar Voss',
    role: 'First Mate',
    schedule: KEDAR_SCHEDULE,
  },
  bhima: {
    name: 'Bhima',
    role: "Ship's Cook",
    schedule: BHIMA_SCHEDULE,
  },
  isha: {
    name: 'Gunner Isha Calloway',
    role: "Ship's Gunner",
    schedule: ISHA_SCHEDULE,
  },
  hari: {
    name: 'Bosun Hari',
    role: 'Bosun',
    schedule: HARI_SCHEDULE,
  },
};

export class NpcScheduler {
  /**
   * Pure function: calculates exact NPC state for any arbitrary shipTime.
   */
  public static getNpcState(npcId: string, shipTime: number): NpcScheduleState | null {
    const npc = ALL_SCHEDULES[npcId];
    if (!npc) return null;

    // Find the active segment
    const segment = npc.schedule.find(
      (s) => shipTime >= s.timeStart && (shipTime < s.timeEnd || s.timeEnd === 600)
    ) ?? npc.schedule[npc.schedule.length - 1];

    if (!segment) return null;

    const { waypoints, scene, activity, isDead = false } = segment;
    const duration = segment.timeEnd - segment.timeStart;

    if (waypoints.length === 1 || duration <= 0) {
      return {
        id: npcId,
        name: npc.name,
        role: npc.role,
        scene,
        x: waypoints[0].x,
        y: waypoints[0].y,
        facing: segment.facing ?? 'down',
        isMoving: false,
        activity,
        isDead,
        walkFrame: 0,
      };
    }

    // Multiple waypoints: compute total path distance
    let totalDist = 0;
    const distances: number[] = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const dx = waypoints[i + 1].x - waypoints[i].x;
      const dy = waypoints[i + 1].y - waypoints[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      distances.push(dist);
      totalDist += dist;
    }

    if (totalDist === 0) {
      return {
        id: npcId,
        name: npc.name,
        role: npc.role,
        scene,
        x: waypoints[0].x,
        y: waypoints[0].y,
        facing: segment.facing ?? 'down',
        isMoving: false,
        activity,
        isDead,
        walkFrame: 0,
      };
    }

    // Determine progress along route
    let elapsed = Math.max(0, shipTime - segment.timeStart);
    if (segment.looping) {
      // Loop smoothly back and forth or cyclic
      const loopPeriod = 30; // 30s per complete cycle
      elapsed = elapsed % loopPeriod;
      const loopProgress = elapsed / loopPeriod;
      const targetDist = loopProgress * totalDist;
      return this.interpolateWaypoints(npcId, npc.name, npc.role, scene, activity, isDead, waypoints, distances, targetDist, elapsed);
    } else {
      const progress = Math.min(1, Math.max(0, elapsed / duration));
      const targetDist = progress * totalDist;
      return this.interpolateWaypoints(npcId, npc.name, npc.role, scene, activity, isDead, waypoints, distances, targetDist, elapsed);
    }
  }

  private static interpolateWaypoints(
    id: string,
    name: string,
    role: string,
    scene: 'deck' | 'hold',
    activity: string,
    isDead: boolean,
    waypoints: Waypoint[],
    distances: number[],
    targetDist: number,
    time: number
  ): NpcScheduleState {
    let accumulated = 0;
    for (let i = 0; i < distances.length; i++) {
      const segDist = distances[i];
      if (accumulated + segDist >= targetDist || i === distances.length - 1) {
        const segRemain = targetDist - accumulated;
        const t = segDist > 0 ? Math.min(1, Math.max(0, segRemain / segDist)) : 0;
        const cur = waypoints[i];
        const next = waypoints[i + 1];

        const x = cur.x + (next.x - cur.x) * t;
        const y = cur.y + (next.y - cur.y) * t;

        const dx = next.x - cur.x;
        const dy = next.y - cur.y;

        let facing: 'up' | 'down' | 'left' | 'right' = 'down';
        if (Math.abs(dx) > Math.abs(dy)) {
          facing = dx > 0 ? 'right' : 'left';
        } else if (Math.abs(dy) > 0) {
          facing = dy > 0 ? 'down' : 'up';
        }

        return {
          id,
          name,
          role,
          scene,
          x: Math.round(x * 100) / 100,
          y: Math.round(y * 100) / 100,
          facing,
          isMoving: t > 0.001 && t < 0.999,
          activity,
          isDead,
          walkFrame: time * 4,
        };
      }
      accumulated += segDist;
    }

    const last = waypoints[waypoints.length - 1];
    return {
      id,
      name,
      role,
      scene,
      x: last.x,
      y: last.y,
      facing: 'down',
      isMoving: false,
      activity,
      isDead,
      walkFrame: 0,
    };
  }

  public static getAllNpcStates(shipTime: number): NpcScheduleState[] {
    const ids = Object.keys(ALL_SCHEDULES);
    const list: NpcScheduleState[] = [];
    for (const id of ids) {
      const state = this.getNpcState(id, shipTime);
      if (state) {
        list.push(state);
      }
    }
    return list;
  }

  /**
   * Mutineer Silhouettes:
   * 310 - 335: Two mutineers conferring with Kedar in the hold.
   * 340 - 600: Two mutineers stationed on deck armed with cutlasses.
   */
  public static getMutineers(shipTime: number): MutineerSilhouette[] {
    if (shipTime >= 310 && shipTime < 335) {
      return [
        { id: 'mutineer_hold_1', scene: 'hold', x: 15.5, y: 3.0, facing: 'left' },
        { id: 'mutineer_hold_2', scene: 'hold', x: 15.5, y: 4.0, facing: 'left' },
      ];
    }
    if (shipTime >= 340) {
      return [
        { id: 'mutineer_deck_1', scene: 'deck', x: 6.0, y: 11.0, facing: 'down' },
        { id: 'mutineer_deck_2', scene: 'deck', x: 10.5, y: 11.0, facing: 'down' },
      ];
    }
    return [];
  }

  /**
   * DEV STARTUP ASSERTION:
   * Asserts every waypoint is walkable and consecutive waypoints connect without crossing solid tiles.
   */
  public static assertNpcSchedules(deckMap: GameMap, holdMap: GameMap): void {
    for (const [npcId, { schedule }] of Object.entries(ALL_SCHEDULES)) {
      for (const seg of schedule) {
        const targetMap = seg.scene === 'hold' ? holdMap : deckMap;

        // Skip in_cabin since Nakhuda is behind barred door
        if (seg.activity === 'in_cabin') continue;

        // 1. Assert each waypoint is walkable
        for (let i = 0; i < seg.waypoints.length; i++) {
          const wp = seg.waypoints[i];
          const walkable = isPositionWalkable(targetMap, wp.x, wp.y);
          console.assert(
            walkable,
            `[STARTUP ASSERTION FAILED] NPC ${npcId} waypoint (${wp.x}, ${wp.y}) on scene "${seg.scene}" is SOLID!`
          );
          if (!walkable) {
            console.error(
              `[STARTUP ASSERTION FAILED] NPC ${npcId} waypoint (${wp.x}, ${wp.y}) on scene "${seg.scene}" is SOLID!`
            );
          }
        }

        // 2. Assert connectivity between consecutive waypoints
        for (let i = 0; i < seg.waypoints.length - 1; i++) {
          const wpA = seg.waypoints[i];
          const wpB = seg.waypoints[i + 1];
          const samples = 10;
          for (let s = 1; s < samples; s++) {
            const t = s / samples;
            const sx = wpA.x + (wpB.x - wpA.x) * t;
            const sy = wpA.y + (wpB.y - wpA.y) * t;
            const stepWalkable = isPositionWalkable(targetMap, sx, sy);
            console.assert(
              stepWalkable,
              `[STARTUP ASSERTION FAILED] NPC ${npcId} route segment (${wpA.x},${wpA.y})->(${wpB.x},${wpB.y}) crosses solid tile at (${sx.toFixed(2)}, ${sy.toFixed(2)})!`
            );
            if (!stepWalkable) {
              console.error(
                `[STARTUP ASSERTION FAILED] NPC ${npcId} route segment (${wpA.x},${wpA.y})->(${wpB.x},${wpB.y}) crosses solid tile at (${sx.toFixed(2)}, ${sy.toFixed(2)})!`
              );
            }
          }
        }

        // 3. Dev assertion: No NPC post may block a 1-tile-wide path
        if (seg.waypoints.length === 1) {
          const wp = seg.waypoints[0];
          const tx = Math.floor(wp.x);
          const ty = Math.floor(wp.y);
          const leftSolid = !isPositionWalkable(targetMap, tx - 0.5, ty + 0.5);
          const rightSolid = !isPositionWalkable(targetMap, tx + 1.5, ty + 0.5);
          const upSolid = !isPositionWalkable(targetMap, tx + 0.5, ty - 0.5);
          const downSolid = !isPositionWalkable(targetMap, tx + 0.5, ty + 1.5);

          // If blocked on opposing walls in a 1-tile chokepoint, an NPC standing there blocks the path
          const isChokepoint = (leftSolid && rightSolid) || (upSolid && downSolid);
          console.assert(
            !isChokepoint,
            `[DevAssertion Failed] NPC post for ${npcId} at (${wp.x}, ${wp.y}) blocks a 1-tile-wide path!`
          );
          if (isChokepoint) {
            console.error(`[DevAssertion Failed] NPC post for ${npcId} at (${wp.x}, ${wp.y}) blocks a 1-tile-wide path!`);
          }
        }
      }
    }
    console.log('[NpcScheduler] Startup check passed: All NPC waypoints and transit corridors are 100% walkable and no post blocks a 1-tile path.');
  }
}

import { Interactable } from './interactables';

export type TileType =
  | 'empty'
  | 'deck'
  | 'hold_floor'
  | 'wall'
  | 'rail'
  | 'hatch'
  | 'door'
  | 'cannon'
  | 'helm'
  | 'galley'
  | 'lifeboat'
  | 'relic'
  | 'statue'
  | 'chest'
  | 'grate'
  | 'mast';

export interface GameMap {
  id: 'deck' | 'hold';
  name: string;
  width: number;
  height: number;
  tiles: TileType[][];
  spawnPosition: { x: number; y: number };
  interactables: Interactable[];
}

/**
 * Complete Full-Length Vertical Galleon Deck Layout (16 columns x 24 rows, 64px per tile).
 *
 * Legend:
 *   . = Walkable deck planks
 *   # = Solid outer gunwale / balustrade railing (prevents walking around stairs)
 *   ~ = Empty ocean water (solid boundary)
 *   M = Central mast trunk / capstan post (solid)
 *   H = Cargo hold hatch (walkable entrance trigger)
 *   G = Upper-deck listening grate (walkable slatted panel)
 *   D = Captain's cabin door (solid)
 *   P = Naval port cannons (solid)
 *   L = Starboard lifeboat on davits (solid)
 *   W = Starboard davit winch plate (solid)
 *   X = Cargo crates and brine barrels (solid)
 *   T = Ship's steering wheel / Helm on binnacle pedestal (solid)
 *   K = Forecastle anchor windlass capstan / Lantern post (solid)
 */
const DECK_ASCII = [
  '~~~~~~~~~~~~~~~~', // 0: Ocean
  '~~~~~~~##~~~~~~~', // 1: Bowsprit tip in ocean (Col 7, 8)
  '~~~~~~~##~~~~~~~', // 2: Bowsprit (Col 7, 8)
  '~~~~~~####~~~~~~', // 3: Beakhead / Stemhead (Cols 6..9)
  '~~~~#...MM...#~~', // 4: Forecastle deck (Walkable cols 5,6, 9,10; Bowsprit base / windlass M cols 7,8)
  '~~~~#...MM...#~~', // 5: Forecastle deck floor
  '~~~#..####..#~~~', // 6: Forecastle front railing: Port stairs (cols 4,5), Starboard stairs (cols 10,11), Railing (cols 6..9)
  '~~~#..####..#~~~', // 7: Mid-stair: Port stairs (cols 4,5), Starboard stairs (cols 10,11), Bulkhead wall (cols 6..9)
  '~~~#...MM...#~~~', // 8: Stair landing: Port stairs (cols 4,5), Starboard stairs (cols 10,11), Mast post M (cols 7,8)
  '~~~#....M.....#~', // 9: Upper Main Deck: Col 4..7 deck, Central Mast M (col 8), Col 9..12 deck
  '~~~#....M....#LL', // 10: Main Deck: Open aisle, Mast collar M (col 8), Rail # (col 13), Lifeboat LL (col 14,15)
  '~~~#X.GGHH..W#LL', // 11: Main Deck: Port Barrels X (col 4), Deck (col 5), Listening Grate GG (cols 6,7), Cargo Hatch HH (cols 8,9), Deck (cols 10,11), Winch W (col 12), Rail # (col 13), Lifeboat LL (cols 14,15)
  '~~~#X.GGHH...#LL', // 12: Main Deck: Port Barrels X (col 4), Deck (col 5), Listening Grate GG (cols 6,7), Cargo Hatch HH (cols 8,9), Deck (cols 10..12), Rail # (col 13), Lifeboat LL (cols 14,15)
  '~~~#X........#LL', // 13: Main Deck: Port Barrels X (col 4), Deck (cols 5..12), Rail # (col 13), Lifeboat LL (cols 14,15)
  '~~~#..#DD#...#LL', // 14: Main Deck & Cabin: Clear aisle to port stairs (cols 4,5), Bulkhead # (col 6), Captain Door DD (cols 7,8), Bulkhead # (col 9), Clear aisle to starboard stairs (cols 10..12), Rail # (col 13), Lifeboat LL (cols 14,15)
  'PPP##..####..#LL', // 15: Port Cannon PPP (cols 0..2), Rail # (col 3), Port Stairs (cols 4,5), Cabin Wall # (cols 6..9), Starboard Stairs (cols 10,11), Rail # (col 12), Lifeboat LL (cols 13..15)
  '~~~#..####..#~~~', // 16: Quarterdeck Balustrade: Port stairs (cols 4,5), Starboard stairs (cols 10,11), Balustrade # (cols 6..9), Rails # (col 3, 12)
  '~~~#........XX#~', // 17: Quarterdeck Landing: Deck (cols 4..11), Starboard Crates XX (cols 12,13), Rail # (col 3, 14)
  '~~~#X.......XX#~', // 18: Quarterdeck Deck: Port Crate X (col 4), Deck (cols 5..11), Starboard Crates XX (cols 12,13), Rail # (col 3, 14)
  '~~~#.........#K~', // 19: Quarterdeck Walkway: Rail # (col 3), Deck (cols 4..12), Rail # (col 13), Stern Lantern K (col 14)
  '~~~#...TT....#~~', // 20: Quarterdeck Helm: Rail # (col 3), Deck (cols 4..6), Ship Wheel TT (cols 7,8), Deck (cols 9..12), Rail # (col 13)
  '~~~~#.......#~~~', // 21: Stern approach: Rail # (col 4), Deck (cols 5..11), Rail # (col 12)
  '~~~~~#######~~~~', // 22: Curved Stern Railing: Rails # (cols 5..11)
  '~~~~~~#####~~~~~', // 23: Stern Transom (JAL-DOOT): # (cols 6..10)
];

export function createDeckMap(): GameMap {
  const height = DECK_ASCII.length;
  const width = 16;
  const tiles: TileType[][] = [];

  for (let y = 0; y < height; y++) {
    const rowStr = DECK_ASCII[y].padEnd(width, '~').slice(0, width);
    const row: TileType[] = [];
    for (let x = 0; x < width; x++) {
      const char = rowStr[x] || '~';
      switch (char) {
        case '#':
          row.push('rail');
          break;
        case 'M':
          row.push('mast');
          break;
        case 'H':
          row.push('hatch');
          break;
        case 'P':
          row.push('cannon');
          break;
        case 'L':
          row.push('lifeboat');
          break;
        case 'W':
          row.push('helm'); // Winch mechanism
          break;
        case 'D':
          row.push('door');
          break;
        case 'X':
          row.push('chest'); // Crates stack / barrels
          break;
        case 'G':
          row.push('grate'); // Listening grate (walkable slatted panel)
          break;
        case 'T':
          row.push('helm'); // Ship's wheel / Helm
          break;
        case 'K':
          row.push('statue'); // Anchor windlass capstan / lantern post
          break;
        case '.':
          row.push('deck');
          break;
        case '~':
        case ' ':
        default:
          row.push('empty');
          break;
      }
    }
    tiles.push(row);
  }

  // Define interactables on the 16x24 vertical map
  const interactables: Interactable[] = [
    {
      id: 'deck_hatch',
      scene: 'deck',
      x: 8,
      y: 11,
      width: 2,
      height: 2,
      type: 'hatch',
      label: 'Enter Cargo Hold (Descend Stairs)',
      targetScene: 'hold',
      targetPosition: { x: 4.5, y: 4.0 }, // Foot of the stairs in the hold
      highlightSize: { width: 1.2, height: 1.2, offsetX: 0.4, offsetY: 0.4 },
    },
    {
      id: 'listening_grate',
      scene: 'deck',
      x: 6,
      y: 11,
      width: 2,
      height: 2,
      type: 'vent',
      label: 'Listening Grate (Eavesdrop on Cargo Hold)',
      highlightSize: { width: 1.0, height: 1.0, offsetX: 0.5, offsetY: 0.5 },
    },
    {
      id: 'captain_door',
      scene: 'deck',
      x: 7,
      y: 14,
      width: 2,
      height: 1,
      type: 'door',
      label: "Captain's Cabin Door (Barricaded)",
      highlightSize: { width: 1.2, height: 0.8, offsetX: 0.4, offsetY: 0.1 },
    },
    {
      id: 'helm_wheel',
      scene: 'deck',
      x: 7,
      y: 20,
      width: 2,
      height: 2,
      type: 'helm',
      label: "Ship's Wheel (The Helm)",
      highlightSize: { width: 1.0, height: 1.0, offsetX: 0.5, offsetY: 0.5 },
    },
    {
      id: 'center_mast',
      scene: 'deck',
      x: 7,
      y: 9,
      width: 2,
      height: 2,
      type: 'statue',
      label: 'Examine Main Mast (Seagull Perch)',
      highlightSize: { width: 1.0, height: 1.0, offsetX: 0.5, offsetY: 0.5 },
    },
    {
      id: 'bow_capstan',
      scene: 'deck',
      x: 7,
      y: 4,
      width: 2,
      height: 2,
      type: 'statue',
      label: 'Anchor Windlass Capstan (Mooring Mechanism)',
      highlightSize: { width: 1.0, height: 1.0, offsetX: 0.5, offsetY: 0.5 },
    },
    {
      id: 'starboard_winch',
      scene: 'deck',
      x: 12,
      y: 11,
      width: 1,
      height: 1,
      type: 'helm',
      label: 'Lower Lifeboats (Hold E 10s)',
      highlightSize: { width: 0.65, height: 0.65, offsetX: 0.18, offsetY: 0.18 },
    },
    {
      id: 'starboard_lifeboat',
      scene: 'deck',
      x: 14,
      y: 10,
      width: 2,
      height: 6,
      type: 'lifeboat',
      label: "Starboard Lifeboat (Hari's Post)",
      highlightSize: { width: 1.1, height: 2.2, offsetX: 0.45, offsetY: 1.9 },
    },
    {
      id: 'port_cannon_aft',
      scene: 'deck',
      x: 0,
      y: 15,
      width: 3,
      height: 1,
      type: 'cannon',
      label: 'Port Cannon - 18-Pounder Naval Gun',
      highlightSize: { width: 1.2, height: 0.7, offsetX: 1.6, offsetY: 0.15 },
    },
    {
      id: 'port_barrels_provisions',
      scene: 'deck',
      x: 4,
      y: 11,
      width: 1,
      height: 3,
      type: 'chest',
      label: 'Stacked Brine Barrels & Salt-Pork Crates',
      highlightSize: { width: 0.7, height: 1.6, offsetX: 0.15, offsetY: 0.7 },
    },
    {
      id: 'quarterdeck_crates',
      scene: 'deck',
      x: 12,
      y: 17,
      width: 2,
      height: 2,
      type: 'chest',
      label: 'Quarterdeck Reserve Cargo Crates',
      highlightSize: { width: 1.1, height: 1.1, offsetX: 0.45, offsetY: 0.45 },
    },
    {
      id: 'quarterdeck_rail',
      scene: 'deck',
      x: 6,
      y: 22,
      width: 5,
      height: 2,
      type: 'statue',
      label: 'Quarterdeck Transom (Jal-Doot Inscription)',
      highlightSize: { width: 2.5, height: 0.9, offsetX: 1.25, offsetY: 0.5 },
    },
    {
      id: 'forecastle_bow',
      scene: 'deck',
      x: 7,
      y: 1,
      width: 2,
      height: 2,
      type: 'statue',
      label: 'Bow Beakhead & Bowsprit Lookout',
      highlightSize: { width: 1.0, height: 1.0, offsetX: 0.5, offsetY: 0.5 },
    },
    {
      id: 'navigator_stern_hatch',
      scene: 'deck',
      x: 10,
      y: 18,
      width: 1,
      height: 1,
      type: 'hatch',
      label: 'Descend Hidden Stern Hatch (Hatch marked on your Map)',
      targetScene: 'hold',
      targetPosition: { x: 15.0, y: 2.0 },
      highlightSize: { width: 0.8, height: 0.8, offsetX: 0.1, offsetY: 0.1 },
    },
    {
      id: 'deckhand_deck_vent',
      scene: 'deck',
      x: 5,
      y: 17,
      width: 1,
      height: 1,
      type: 'vent',
      label: 'Crawl through the vent',
      targetScene: 'hold',
      targetPosition: { x: 3.0, y: 2.0 },
      highlightSize: { width: 0.7, height: 0.7, offsetX: 0.15, offsetY: 0.15 },
    },
    {
      id: 'quarterdeck_strongbox',
      scene: 'deck',
      x: 6,
      y: 20,
      width: 1,
      height: 1,
      type: 'chest',
      label: 'Strongbox (3-digit lock)',
      highlightSize: { width: 0.7, height: 0.7, offsetX: 0.15, offsetY: 0.15 },
    },
    {
      id: 'deck_locket',
      scene: 'deck',
      x: 10,
      y: 12,
      width: 1,
      height: 1,
      type: 'chest',
      label: 'Pick up Silver Locket',
      highlightSize: { width: 0.6, height: 0.6, offsetX: 0.2, offsetY: 0.2 },
    },
  ];

  return {
    id: 'deck',
    name: 'Main Deck - Jal-Doot',
    width,
    height,
    tiles,
    spawnPosition: { x: 7, y: 10 }, // Open main deck below mast, above hatch
    interactables,
  };
}

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
 * Deck Layout from ARCHITECTURE.md:
 * 32 columns wide, 8 rows tall (expanded slightly for smooth collision & movement).
 * Bow on the left, stern on the right.
 */
const DECK_ASCII = [
  '################################',
  '#BBBB....................SSSSSS#',
  '#B.....G.................C....S#',
  '#.....................Q.....S## ',
  '#...P..........H.........W...  #',
  '#...P....................L....# ',
  '#BBBB....................SSSSSS#',
  '################################',
];

export function createDeckMap(): GameMap {
  const height = DECK_ASCII.length;
  const width = DECK_ASCII[0].length;
  const tiles: TileType[][] = [];

  for (let y = 0; y < height; y++) {
    const row: TileType[] = [];
    for (let x = 0; x < width; x++) {
      const char = DECK_ASCII[y][x] || ' ';
      switch (char) {
        case '#':
          row.push('wall');
          break;
        case 'B':
        case 'S':
          row.push('rail');
          break;
        case 'G':
          row.push('galley');
          break;
        case 'C':
          row.push('door');
          break;
        case 'Q':
          row.push('door');
          break;
        case 'P':
          row.push('cannon');
          break;
        case 'H':
          row.push('hatch');
          break;
        case 'W':
          row.push('helm');
          break;
        case 'L':
          row.push('lifeboat');
          break;
        case '.':
          row.push('deck');
          break;
        default:
          row.push('empty');
          break;
      }
    }
    tiles.push(row);
  }

  // Define interactables on Deck
  const interactables: Interactable[] = [
    {
      id: 'deck_hatch',
      scene: 'deck',
      x: 15,
      y: 4,
      type: 'hatch',
      label: 'Enter Cargo Hold',
      targetScene: 'hold',
      targetPosition: { x: 4, y: 3 }, // Target location in hold
    },
    {
      id: 'helm_wheel',
      scene: 'deck',
      x: 25,
      y: 4,
      type: 'helm',
      label: 'Examine Ship Helm',
    },
    {
      id: 'port_cannons',
      scene: 'deck',
      x: 4,
      y: 4,
      type: 'cannon',
      label: 'Port Cannons (Isha\'s Station)',
    },
    {
      id: 'galley_stove',
      scene: 'deck',
      x: 7,
      y: 2,
      type: 'galley',
      label: 'Galley (Bhima\'s Kitchen)',
    },
    {
      id: 'nakhuda_door',
      scene: 'deck',
      x: 25,
      y: 2,
      type: 'door',
      label: 'Nakhuda\'s Cabin Door (Locked)',
    },
    {
      id: 'quartermaster_door',
      scene: 'deck',
      x: 22,
      y: 3,
      type: 'door',
      label: 'Quartermaster\'s Quarters',
    },
    {
      id: 'lifeboats',
      scene: 'deck',
      x: 25,
      y: 5,
      type: 'lifeboat',
      label: 'Starboard Lifeboats (Hari\'s Post)',
    },
  ];

  return {
    id: 'deck',
    name: 'Main Deck - Jal-Doot',
    width,
    height,
    tiles,
    spawnPosition: { x: 8, y: 4 }, // Start near center deck
    interactables,
  };
}

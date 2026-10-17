import { GameMap, TileType } from './deckMap';
import { Interactable } from './interactables';

/**
 * Hold layout:
 * Lower cargo hold beneath the deck where the Kaal Mani, petrified statue, and gold are located.
 */
const HOLD_ASCII = [
  '##################',
  '#................#',
  '#..V.........T...#', // V = Vent/Grate, T = Statue
  '#...H............#', // H = Hatch to deck
  '#............K...#', // K = Kaal Mani Relic
  '#.........O......#', // O = Gold Chest
  '#................#',
  '##################',
];

export function createHoldMap(): GameMap {
  const height = HOLD_ASCII.length;
  const width = HOLD_ASCII[0].length;
  const tiles: TileType[][] = [];

  for (let y = 0; y < height; y++) {
    const row: TileType[] = [];
    for (let x = 0; x < width; x++) {
      const char = HOLD_ASCII[y][x] || ' ';
      switch (char) {
        case '#':
          row.push('wall');
          break;
        case 'H':
          row.push('hatch');
          break;
        case 'K':
          row.push('relic');
          break;
        case 'T':
          row.push('statue');
          break;
        case 'O':
          row.push('chest');
          break;
        case 'V':
          row.push('grate');
          break;
        case '.':
          row.push('hold_floor');
          break;
        default:
          row.push('empty');
          break;
      }
    }
    tiles.push(row);
  }

  const interactables: Interactable[] = [
    {
      id: 'hold_hatch',
      scene: 'hold',
      x: 4,
      y: 3,
      type: 'hatch',
      label: 'Climb Ladder to Deck',
      targetScene: 'deck',
      targetPosition: { x: 15, y: 4 },
    },
    {
      id: 'relic_kaal_mani',
      scene: 'hold',
      x: 13,
      y: 4,
      type: 'relic',
      label: 'Examine Kaal Mani (Humming Teal Crystal)',
    },
    {
      id: 'statue_figure',
      scene: 'hold',
      x: 13,
      y: 2,
      type: 'statue',
      label: 'Examine Petrified Statue',
    },
    {
      id: 'hold_gold_chest',
      scene: 'hold',
      x: 10,
      y: 5,
      type: 'gold',
      label: 'Locked Chest of Hold Gold',
    },
    {
      id: 'hold_vent_grate',
      scene: 'hold',
      x: 3,
      y: 2,
      type: 'vent',
      label: 'Ventilation Grate',
    },
  ];

  return {
    id: 'hold',
    name: 'Cargo Hold - Jal-Doot',
    width,
    height,
    tiles,
    spawnPosition: { x: 5, y: 3 },
    interactables,
  };
}

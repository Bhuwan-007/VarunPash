import { GameMap, TileType } from './deckMap';
import { Interactable } from './interactables';

/**
 * Hold layout:
 * Lower cargo hold beneath the deck where the Kaal Mani, petrified statue, and gold are located.
 * Features an ascent staircase leading up to the main deck hatch, and a chained stern companionway stair at the far end.
 */
const HOLD_ASCII = [
  '##################',
  '#................#',
  '#..V.........T..S#', // V = Vent/Grate, T = Statue, S = Stern Stairs
  '#...H............#', // H = Ascent Stairs to deck hatch
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
        case 'S':
          row.push('door');
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
      label: 'Climb Stairs to Deck',
      targetScene: 'deck',
      targetPosition: { x: 10.5, y: 11.5 }, // Top of stairs beside the deck hatch
      highlightSize: { width: 0.7, height: 0.8, offsetX: 0.15, offsetY: 0.1 },
    },
    {
      id: 'hold_stern_stairs',
      scene: 'hold',
      x: 16,
      y: 2,
      type: 'door',
      label: "Navigator's Stern Companionway",
      targetScene: 'deck',
      targetPosition: { x: 10.0, y: 18.0 },
      highlightSize: { width: 0.7, height: 0.8, offsetX: 0.15, offsetY: 0.1 },
    },
    {
      id: 'relic_kaal_mani',
      scene: 'hold',
      x: 13,
      y: 4,
      type: 'relic',
      label: 'Examine Kaal Mani (Humming Teal Crystal)',
      highlightSize: { width: 0.6, height: 0.6, offsetX: 0.2, offsetY: 0.2 },
    },
    {
      id: 'statue_figure',
      scene: 'hold',
      x: 13,
      y: 2,
      type: 'statue',
      label: 'Examine Petrified Statue',
      highlightSize: { width: 0.6, height: 0.7, offsetX: 0.2, offsetY: 0.15 },
    },
    {
      id: 'hold_gold_chest',
      scene: 'hold',
      x: 10,
      y: 5,
      type: 'gold',
      label: 'Locked Chest of Hold Gold',
      highlightSize: { width: 0.7, height: 0.6, offsetX: 0.15, offsetY: 0.2 },
    },
    {
      id: 'hold_vent_grate',
      scene: 'hold',
      x: 3,
      y: 2,
      type: 'vent',
      label: 'Ventilation Grate to Quarterdeck',
      targetScene: 'deck',
      targetPosition: { x: 5.0, y: 17.0 },
      highlightSize: { width: 0.65, height: 0.65, offsetX: 0.18, offsetY: 0.18 },
    },
    {
      id: 'hold_eavesdrop_vent',
      scene: 'hold',
      x: 14,
      y: 2,
      type: 'vent',
      label: 'Listening Grate (Mutineers)',
      highlightSize: { width: 0.65, height: 0.65, offsetX: 0.18, offsetY: 0.18 },
    },
  ];

  return {
    id: 'hold',
    name: 'Cargo Hold - Jal-Doot',
    width,
    height,
    tiles,
    spawnPosition: { x: 4.5, y: 4.0 }, // Foot of the stairs in the hold
    interactables,
  };
}

export type PanelFit = 'cover' | 'contain';

export type BubbleType = 'narration' | 'speech' | 'shout' | 'whisper' | 'sfx';

export interface MangaItem {
  type: BubbleType;
  at: [number, number]; // [x%, y%] of panel
  w?: number; // width % of panel
  text: string;
  tail?: [number, number]; // [x%, y%] pointing to speaker
  rot?: number; // rotation in deg for sfx
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string; // e.g. '#5fd3c4' for teal hums/ticks
}

export interface MangaPanelDef {
  id: string;
  rect: [number, number, number, number]; // [x, y, w, h] in 1600x900 page units
  image: string; // filename in /assets/cinematics/
  fit?: PanelFit; // default 'cover'
  focus?: [number, number]; // default [0.5, 0.5]
  impact?: boolean; // white flash + screen shake
  items: MangaItem[];
}

export interface MangaPageDef {
  id: string;
  title: string;
  panels: MangaPanelDef[];
}

export interface MangaCutsceneDef {
  id: string;
  titleCard?: string; // shown for 3s after cutscene
  pages: MangaPageDef[];
}

export const MANGA_CUTSCENES: Record<string, MangaCutsceneDef> = {
  intro: {
    id: 'intro',
    titleCard: 'THE ABYSSAL TIDE',
    pages: [
      {
        id: 'page_1',
        title: 'The Tide Runs Backward',
        panels: [
          {
            id: 'p1a',
            rect: [20, 20, 1000, 520],
            image: 'intro-p1a.webp',
            fit: 'cover',
            focus: [0.5, 0.5],
            items: [
              {
                type: 'narration',
                at: [3, 5],
                w: 42,
                text: 'The Jal-Doot left port with a full hold and a crew that never said where they were going.',
              },
              {
                type: 'sfx',
                at: [60, 80],
                size: 'md',
                rot: -4,
                text: 'creeeak...',
              },
            ],
          },
          {
            id: 'p1b',
            rect: [1040, 20, 540, 250],
            image: 'intro-p1b.webp',
            fit: 'cover',
            focus: [0.5, 0.5],
            items: [
              {
                type: 'narration',
                at: [4, 62],
                w: 58,
                text: 'Past the last chart, the sea stopped moving.',
              },
            ],
          },
          {
            id: 'p1c',
            rect: [1040, 290, 540, 250],
            image: 'intro-p1c.webp',
            fit: 'cover',
            focus: [0.5, 0.5],
            items: [
              {
                type: 'speech',
                at: [2, 4],
                w: 26,
                tail: [28, 25],
                text: 'The compass is spinning. The tide is running backwards.',
              },
              {
                type: 'speech',
                at: [64, 4],
                w: 33,
                tail: [74, 20],
                text: "Water doesn't run backwards, Captain.",
              },
            ],
          },
          {
            id: 'p1d1',
            rect: [20, 560, 820, 320],
            image: 'intro-p1d1.webp',
            fit: 'cover',
            focus: [0.5, 0.5],
            items: [
              {
                type: 'narration',
                at: [2, 4],
                w: 25,
                text: 'In the hold, something that had no business aboard began to hum.',
              },
              {
                type: 'sfx',
                at: [66, 72],
                size: 'md',
                color: '#5fd3c4',
                text: 'hmmmm...',
              },
            ],
          },
          {
            id: 'p1d2',
            rect: [860, 560, 720, 320],
            image: 'intro-p1d2.webp',
            fit: 'cover',
            focus: [0.35, 0.5],
            items: [
              {
                type: 'speech',
                at: [52, 8],
                w: 44,
                tail: [36, 45],
                text: "Let it hum. Gold doesn't care what the sea does.",
              },
            ],
          },
        ],
      },
      {
        id: 'page_2',
        title: 'The Sixth Bell',
        panels: [
          {
            id: 'p2e',
            rect: [20, 20, 500, 250],
            image: 'intro-p2e.webp',
            fit: 'cover',
            focus: [0.5, 0.5],
            items: [
              {
                type: 'narration',
                at: [60, 4],
                w: 38,
                text: 'I was nobody important. That is why I was awake when it began.',
              },
            ],
          },
          {
            id: 'p2f',
            rect: [540, 20, 500, 250],
            image: 'intro-p2f.webp',
            fit: 'cover',
            focus: [0.5, 0.5],
            items: [
              {
                type: 'sfx',
                at: [4, 18],
                size: 'lg',
                rot: -6,
                text: 'KRAA! KRAA! KRAA!',
              },
              {
                type: 'narration',
                at: [58, 72],
                w: 38,
                text: 'Three cries. Then the knives.',
              },
            ],
          },
          {
            id: 'p2g',
            rect: [1060, 20, 520, 250],
            image: 'intro-p2g.webp',
            fit: 'cover',
            focus: [0.5, 0.5],
            items: [
              {
                type: 'whisper',
                at: [60, 4],
                w: 36,
                tail: [24, 48],
                text: 'Forgive me, Captain.',
              },
            ],
          },
          {
            id: 'p2h',
            rect: [20, 290, 1040, 400],
            image: 'intro-p2h.webp',
            fit: 'cover',
            focus: [0.5, 0.5],
            impact: true,
            items: [
              {
                type: 'sfx',
                at: [6, 4],
                size: 'lg',
                rot: -4,
                text: 'KRRRAAASSSH!!',
              },
              {
                type: 'narration',
                at: [3, 82],
                w: 36,
                text: 'At the sixth bell, the sea stood up.',
              },
            ],
          },
          {
            id: 'p2i',
            rect: [1080, 290, 500, 400],
            image: 'intro-p2i.webp',
            fit: 'cover',
            focus: [0.5, 0.5],
            items: [
              {
                type: 'shout',
                at: [2, 4],
                w: 46,
                tail: [54, 38],
                text: 'PORT SIDE! ALL HANDS TO THE PORT SIDE!!',
              },
            ],
          },
          {
            id: 'p2j',
            rect: [20, 710, 1560, 170],
            image: 'intro-p2j.webp',
            fit: 'contain',
            focus: [0.5, 0.5],
            items: [
              {
                type: 'narration',
                at: [2, 16],
                w: 32,
                text: 'Then, the deck again. The same gull. The same locket. The same sky.',
              },
              {
                type: 'sfx',
                at: [76, 40],
                size: 'sm',
                color: '#5fd3c4',
                text: 'tick... tick...',
              },
            ],
          },
        ],
      },
    ],
  },
};

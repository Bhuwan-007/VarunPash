export interface CinematicPanel {
  image?: string;
  caption: string;
}

export interface CinematicDef {
  id: string;
  title: string;
  panels: CinematicPanel[];
  endCard?: string;
}

export const CINEMATICS: Record<string, CinematicDef> = {
  ending_hero: {
    id: 'ending_hero',
    title: "THE HERO'S SACRIFICE",
    panels: [
      {
        image: 'eh-a.webp',
        caption: 'They asked who would stay. No one asked twice.',
      },
      {
        image: 'eh-c.webp',
        caption: 'The chant came easily. It was my own voice.',
      },
      {
        image: 'eh-d.webp',
        caption: 'The crew lived. The ship did not.',
      },
      {
        image: 'm-statue-a.webp',
        caption: 'In the hold, a stone figure with my face. It had always been there.',
      },
    ],
    endCard: "THE HERO'S SACRIFICE",
  },
};

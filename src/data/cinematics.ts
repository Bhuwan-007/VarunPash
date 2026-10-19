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
  ending_coward: {
    id: 'ending_coward',
    title: "COWARD'S END",
    panels: [
      {
        image: 'ec-a.webp',
        caption: 'You rowed. You did not look back.',
      },
      {
        image: 'ec-b.webp',
        caption: 'A lantern burned on the deck. Then it did not.',
      },
      {
        image: 'ec-c.webp',
        caption: 'The loop broke. So did every voice that had ever answered you.',
      },
      {
        image: 'ec-d.webp',
        caption: 'You are alive. That is the whole of the sentence.',
      },
    ],
    endCard: "COWARD'S END",
  },
  ending_mutineer: {
    id: 'ending_mutineer',
    title: "MUTINEER'S REIGN",
    panels: [
      {
        image: 'em-a.webp',
        caption: "The Nakhuda's turban fit Kedar well.",
      },
      {
        image: 'em-b.webp',
        caption: 'The cannons did what cannons do.',
      },
      {
        image: 'em-c.webp',
        caption: 'A share is a share. Two shares are a debt.',
      },
      {
        image: 'em-d.webp',
        caption: 'You scratched the days into the wall. They did not repeat. That was the cruelty of it.',
      },
    ],
    endCard: "MUTINEER'S REIGN",
  },
  ending_drowned: {
    id: 'ending_drowned',
    title: 'THE DROWNED LOOP',
    panels: [
      {
        image: 'ed-a.webp',
        caption: 'You arrived as the ship went down.',
      },
      {
        image: 'ed-b.webp',
        caption: 'The tide did not ask.',
      },
      {
        image: 'ed-c.webp',
        caption: 'There was no one to choose. So you were chosen.',
      },
      {
        image: 'ed-d.webp',
        caption: 'And the tide began again.',
      },
    ],
    endCard: 'THE DROWNED LOOP',
  },
};

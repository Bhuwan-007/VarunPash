export type JournalTab = 'Clues' | 'Tide Table' | 'People' | 'Codes';

export interface JournalEntryDef {
  id: string;
  flag: string;
  tab: JournalTab;
  title: string;
  text: string;
  code?: string;
  tideTime?: string;
  tideSeconds?: number;
}

export const JOURNAL_ENTRIES: Record<string, JournalEntryDef> = {
  K_SAFE_CODE: {
    id: 'entry_safe_code',
    flag: 'K_SAFE_CODE',
    tab: 'Codes',
    title: "Nakhuda's Safe Code",
    text: "The Nakhuda screamed seven-three-one before the pistol spoke. Odd thing to remember.",
    code: '7-3-1',
  },
  K_MUTINEER: {
    id: 'entry_mutineer',
    flag: 'K_MUTINEER',
    tab: 'Tide Table',
    title: 'The Mutiny Hour',
    text: "The mutiny begins when the tide is four minutes from taking us (T-4:00). Kedar's knives will be drawn unless he is bribed or Thorne is forewarned.",
    tideTime: 'T-4:00 (360s)',
    tideSeconds: 360,
  },
  K_Makara_WEAKNESS: {
    id: 'entry_makara_weakness',
    flag: 'K_Makara_WEAKNESS',
    tab: 'Clues',
    title: "The Harpoon in the Gullet",
    text: "A glowing harpoon point remains lodged deep inside the Makara's throat on the port rail. That is where it bleeds.",
  },
  K_CHANT: {
    id: 'entry_chant',
    flag: 'K_CHANT',
    tab: 'Clues',
    title: 'The Sealing Chant',
    text: 'Seven syllables whispered in the cold deep. Spoken to the relic, they hold the black waters at bay.',
  },
  K_LOCKET_TWIN: {
    id: 'entry_locket_twin',
    flag: 'K_LOCKET_TWIN',
    tab: 'People',
    title: 'The Stone Hand',
    text: 'The statue in the hold clutches a brass locket—the exact twin of the one on the deck. And it wears my own sash in stone.',
  },
  K_STATUE_TRUTH: {
    id: 'entry_statue_truth',
    flag: 'K_STATUE_TRUTH',
    tab: 'Clues',
    title: 'Voice from Above',
    text: "Carved into the statue's base: 'It speaks from above, never from the deep.' The chant must be read through the upper listening grate, not beside the relic.",
  },
  K_OMEN_GULL: {
    id: 'entry_omen_gull',
    flag: 'K_OMEN_GULL',
    tab: 'Tide Table',
    title: 'Three Cries of the Gull',
    text: 'At T-4:05 (355s), a gull cries thrice from the main mast. Exactly five seconds before the knives are drawn.',
    tideTime: 'T-4:05 (355s)',
    tideSeconds: 355,
  },
  K_BHIMA_GOSSIP: {
    id: 'entry_bhima_gossip',
    flag: 'K_BHIMA_GOSSIP',
    tab: 'People',
    title: "Bhima's Whispers",
    text: 'Bhima says Kedar counts the gold when he thinks no one is watching, and Hari can be bought with coin.',
  },
  K_ALLIED_KEDAR: {
    id: 'entry_allied_kedar',
    flag: 'K_ALLIED_KEDAR',
    tab: 'Clues',
    title: 'Pact with Kedar',
    text: "Kedar agreed to spare the ship if his port cannons repel the Makara. A fragile truce sealed with stolen coin.",
  },
};

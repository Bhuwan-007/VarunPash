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
    tab: 'Tide Table',
    title: 'The Makara Breaches',
    text: "At T-2:00 (480s), the great beast breaches on the port side. In its throat, a glowing harpoon still bleeds.",
    tideTime: 'T-2:00 (480s)',
    tideSeconds: 480,
  },
  K_LEVIATHAN_WEAKNESS: {
    id: 'entry_makara_weakness',
    flag: 'K_LEVIATHAN_WEAKNESS',
    tab: 'Tide Table',
    title: 'The Makara Breaches',
    text: "At T-2:00 (480s), the great beast breaches on the port side. In its throat, a glowing harpoon still bleeds.",
    tideTime: 'T-2:00 (480s)',
    tideSeconds: 480,
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
  CLUE_DEATH_SHOT: {
    id: 'entry_clue_death_shot',
    flag: 'CLUE_DEATH_SHOT',
    tab: 'Clues',
    title: 'Cause of Death: Shot by Nakhuda',
    text: "Thorne's flintlock pistol killed me. He fires without warning at anyone who steps through his cabin door.",
  },
  CLUE_DEATH_STAB: {
    id: 'entry_clue_death_stab',
    flag: 'CLUE_DEATH_STAB',
    tab: 'Clues',
    title: 'Cause of Death: Kedar\'s Blade',
    text: "Kedar's steel cut me down during the mutiny. He leaves no witnesses to his coup.",
  },
  CLUE_DEATH_MAKARA: {
    id: 'entry_clue_death_makara',
    flag: 'CLUE_DEATH_MAKARA',
    tab: 'Clues',
    title: 'Cause of Death: Makara Leviathan',
    text: "The Leviathan breached the port rail and crushed the deck. Its maw swallowed the ship in black brine.",
  },
  CLUE_DEATH_DROWN: {
    id: 'entry_clue_death_drown',
    flag: 'CLUE_DEATH_DROWN',
    tab: 'Clues',
    title: 'Cause of Death: The Drowned Ship',
    text: "Ten minutes expired. The Jal-Doot slipped under the waves and the cold black water swallowed us all.",
  },
  CLUE_GULL_CRIES: {
    id: 'entry_clue_gull_cries',
    flag: 'CLUE_GULL_CRIES',
    tab: 'Clues',
    title: 'The Gull\'s Three Cries',
    text: "The white gull perched upon the spar calls three times at 355s—a five-second omen before the knives are drawn.",
  },
  CLUE_LOCKET: {
    id: 'entry_clue_locket',
    flag: 'CLUE_LOCKET',
    tab: 'Clues',
    title: 'The Tarnished Locket',
    text: "A brass locket dropped upon the deck planks. It bears the same tide-knot carving as the stone statue below.",
  },
};

export const INITIAL_CLUES_ENTRY: JournalEntryDef = {
  id: 'entry_initial_clue',
  flag: 'K_INITIAL_WAKE',
  tab: 'Clues',
  title: 'The Recurring Wake',
  text: 'The Jal-Doot sinks ten minutes after I wake. I do not know why. Every time I die I wake again, a little later in the night. I must learn what is killing us, and remember it.',
};

export const PINNED_OBJECTIVE = 'Learn what sinks the Jal-Doot. Remember it. Use it.';

export const NPC_PROFILE_CARDS: Record<string, { id: string; name: string; role: string; description: string }> = {
  bhima: {
    id: 'card_bhima',
    name: 'Bhima',
    role: "Ship's Cook",
    description: "Round, cautious, and grease-stained. Sells gossip for coin, but prefers quiet to mutiny.",
  },
  kedar: {
    id: 'card_kedar',
    name: 'First Mate Kedar Voss',
    role: 'First Mate',
    description: 'Lean with a red sash and a gold tooth. Whispering with the crew; eyes fixed on the hold.',
  },
  nakhuda: {
    id: 'card_nakhuda',
    name: 'Nakhuda Thorne',
    role: 'Captain of the Jal-Doot',
    description: 'Scarred, grey-bearded, and paranoid. Locked in his cabin with a primed flintlock.',
  },
  isha: {
    id: 'card_isha',
    name: 'Gunner Isha Calloway',
    role: "Ship's Gunner",
    description: 'Tall, braided, with powder-burned forearms. Loyal to orders, deadly with port iron.',
  },
  hari: {
    id: 'card_hari',
    name: 'Bosun Hari',
    role: 'Bosun',
    description: 'Massive, bald, and anchor-tattooed. Guards the starboard lifeboats; coin is his only loyalty.',
  },
};


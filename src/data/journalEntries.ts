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
    text: 'Seven syllables will seal the Kaal Mani. But I will not speak them while the crew is still aboard.',
  },
  K_LOCKET_TWIN: {
    id: 'entry_locket_twin',
    flag: 'K_LOCKET_TWIN',
    tab: 'Clues',
    title: 'The Twin Locket',
    text: "The statue's locket matches mine. The engraving is the same.",
  },
  K_STATUE_TRUTH: {
    id: 'entry_statue_truth',
    flag: 'K_STATUE_TRUTH',
    tab: 'Clues',
    title: 'Voice from Above',
    text: 'Glyphs on the base: speak it from above, never from the deep.',
  },
  K_OMEN_GULL: {
    id: 'entry_omen_gull',
    flag: 'K_OMEN_GULL',
    tab: 'Tide Table',
    title: 'The Gull Omen',
    text: 'The gull cries three times before the knives come.',
    tideTime: 'T-4:05 (355s)',
    tideSeconds: 355,
  },
  TIDE_NAKHUDA_HELM: {
    id: 'entry_tide_nakhuda_helm',
    flag: 'TIDE_NAKHUDA_HELM',
    tab: 'Tide Table',
    title: "Nakhuda at the Helm",
    text: 'At T-6:00 (240s-270s), Nakhuda Thorne steps out from his cabin to the helm. The only time he leaves his barricade.',
    tideTime: 'T-6:00 (240s)',
    tideSeconds: 240,
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
  CLUE_LOCKET_DECK: {
    id: 'entry_clue_locket_deck',
    flag: 'CLUE_LOCKET_DECK',
    tab: 'Clues',
    title: 'Silver Locket on Deck',
    text: "A silver locket on the deck. Engraved: 'Return to the start.'",
  },
  CLUE_LOCKET_STRONGBOX: {
    id: 'entry_clue_locket_strongbox',
    flag: 'CLUE_LOCKET_STRONGBOX',
    tab: 'Clues',
    title: 'A Second Locket',
    text: 'A second locket in the strongbox, engraved the same as the one on the deck. Both cannot be real.',
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

export function getNextLead(knowledge: string[]): { title: string; hint: string } {
  // 1. Cabin door / safe
  if (!knowledge.includes('K_SAFE_CODE')) {
    return {
      title: 'Next Lead: The Captain’s Cabin',
      hint: "Nakhuda's cabin is barred. Someone inside knows something.",
    };
  }
  // 2. Kedar / mutiny
  if (!knowledge.includes('K_MUTINEER')) {
    return {
      title: 'Next Lead: Whispers on Deck',
      hint: 'Kedar whispers with the crew before the bell. What are they planning?',
    };
  }
  // 3. Makara weakness
  if (!knowledge.includes('K_Makara_WEAKNESS') && !knowledge.includes('K_LEVIATHAN_WEAKNESS')) {
    return {
      title: 'Next Lead: The Port Deep',
      hint: 'At the eighth bell, something rises from the port deep. Witness its wound.',
    };
  }
  // 4. Kaal Mani relic chant
  if (!knowledge.includes('K_CHANT')) {
    return {
      title: 'Next Lead: The Hold Relic',
      hint: 'A humming stone rests in the hold. It speaks in a voice you know.',
    };
  }
  // 5. Statue truth
  if (!knowledge.includes('K_STATUE_TRUTH')) {
    return {
      title: 'Next Lead: The Stone Twin',
      hint: 'The stone figure in the hold clutches a locket. Examine where the voice truly belongs.',
    };
  }
  // All clues learned
  return {
    title: 'Next Lead: Break the Circle',
    hint: 'The circle is closing. Find a way to speak the chant without paying with your life.',
  };
}

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

export interface RoleCardInfo {
  role: 'navigator' | 'quartermaster' | 'deckhand';
  title: string;
  carry: string;
  holdAccess: string;
  crewTreatment: string;
  sashColor: string;
  sashColorName: string;
  journalEntry: {
    id: string;
    tab: 'Clues';
    title: string;
    text: string;
  };
}

export const ROLE_CARDS: Record<'navigator' | 'quartermaster' | 'deckhand', RoleCardInfo> = {
  navigator: {
    role: 'navigator',
    title: 'Navigator',
    carry: 'Sea Chart (Map)',
    holdAccess: 'Hidden stern hatch near the helm (marked on your Map) leading to the stern companionway.',
    crewTreatment: 'The crew treat you with polite courtesy; Nakhuda answers through his barred cabin door.',
    sashColor: '#2e6f9e',
    sashColorName: 'Deepwater Blue',
    journalEntry: {
      id: 'clue_role_navigator',
      tab: 'Clues',
      title: "Navigator's Bearing",
      text: "I carry the sea chart that ends where this voyage began. A secret hatch near the helm opens down to the stern hold. Nakhuda may heed my knock, and Kedar speaks with wary politeness.",
    },
  },
  quartermaster: {
    role: 'quartermaster',
    title: 'Quartermaster',
    carry: 'Hold Key, Armory Key, 6 Silver Coins',
    holdAccess: 'Main deck cargo hatch (unlocked with your Hold Key).',
    crewTreatment: 'The crew are mercenary and watchful; Bhima and Hari demand 1 coin before speaking.',
    sashColor: '#b23a3a',
    sashColorName: 'Blood Rust Red',
    journalEntry: {
      id: 'clue_role_quartermaster',
      tab: 'Clues',
      title: "Quartermaster's Keys",
      text: "The Hold Key and Armory Key hang at my belt with six silver coins. The main cargo hatch opens to my key. Bhima and Hari know my pockets are lined—they demand coin before speaking.",
    },
  },
  deckhand: {
    role: 'deckhand',
    title: 'Deckhand',
    carry: 'Nothing (Empty hands, unseen eyes)',
    holdAccess: 'Deck ventilation grate on the quarterdeck crawling directly into the cargo bilge.',
    crewTreatment: 'Ignored as part of the woodwork; can crawl through vents and eavesdrop on the mutineers.',
    sashColor: '#8a8f98',
    sashColorName: 'Slate Grey',
    journalEntry: {
      id: 'clue_role_deckhand',
      tab: 'Clues',
      title: "Deckhand's Shadow",
      text: "I carry nothing but callous on my hands. The crew look straight through me. I can crawl through the quarterdeck ventilation grate into the bilge, and listen unseen where other men dare not tread.",
    },
  },
};



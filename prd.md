# PRD: VarunPash

> Read this first, then RULES.md (numbers and logic), ARCHITECTURE.md (code structure), FEEL.md (look, sound, voice).

## 1. One-liner
A cursed galleon sinks every 10 minutes. You die, remember, and come back *later* each time, with less time and more knowledge. Break the loop before the tide runs out.

## 2. Theme fit (LOOP)
- Literal: a 10-minute timeline that resets on death.
- Mechanical: knowledge, not items, is the only thing that carries over.
- Narrative: the loop is a closed causal circle. Everything the player "discovers" was left behind by a future version of themselves.
- Pressure: every death moves the respawn 30 seconds forward. At 20 deaths you spawn as the ship goes under.

## 3. Story spine: "The ship is a record of the ending you haven't reached yet"
The galleon *Jal-Doot* sailed into VarunPash. A relic in the hold, the **Kaal Mani**, drinks time and calls the Makara. Three threats run on one clock: a mutiny, a monster, and the relic.

**The twist (revealed gradually, never explained outright):**
- The petrified statue in the hold is **the player**, wearing the player's assigned role.
- The harpoon in the Makara's throat, the locket, the chant the relic whispers (in the player's own voice): all left by a later loop.
- Sealing the relic by chanting from inside the hold petrifies the chanter. That sacrifice is *what created the loop*. Only a chant read from a safe distance breaks the circle.
- The First Mate also remembers the loops. He has never found the chant.

## 4. Design pillars
1. **Death is a tool.** Dying to learn is progress. Dying carelessly is a cost.
2. **The player remembers, not just the game.** The journal shows what you know; using it is on you.
3. **One small ship, dense with secrets.** No filler, every object matters.
4. **The loop is visible before it's explained.** Recurring details (gull, locket, tide marks) tell attentive players first.

## 5. Features
**Must (core build):**
- Top-down 2D ship, walking, collisions, proximity interaction
- Loop timer, death, reset, respawn shift, 20-death limit
- Memory store, in-game journal, memory-gated dialogue
- Random role (Navigator / Quartermaster / Deckhand) with distinct routes
- 5 NPCs, 3 scripted events (mutiny, Makara, sinking)
- Opening cinematic + at least the Hero's Sacrifice ending and the statue twist
- Deployed to itch.io

**Should:** Coward's End, Mutineer's Reign, ghost of previous loop, loop-evidence details (gull, locket), sound/juice.

**Stretch (build last):** Golden Path, Drowned Loop (small, build early if time allows), role-specific dialogue polish.

## 5b. Build priority order
1. Walk, timer, death/reset, memory store, journal, itch test upload
2. One role (Deckhand) end-to-end
3. Hero's Sacrifice + statue twist (first complete ending)
4. Other two roles as item/route swaps
5. Coward's End, Mutineer's Reign
6. Ghost replay and plates
7. Drowned Loop
8. Golden Path
9. Cinematics, audio, polish

If time runs out, ship what is finished and playable. Never leave a half-wired feature in the build.

## 6. Roles (assigned randomly per new game)
| Role | Starts with | Strength | Weakness |
|---|---|---|---|
| Navigator | The Map | Unlocks the helm, sees the hidden stern hatch, Nakhuda trusts you | Cannot win fights |
| Quartermaster | Armory Key, Hold Key, 6 coins | Can fight, direct access to armory and hold | Crew demand bribes to talk or move |
| Deckhand | Nothing | Vent grates bypass locked doors, eavesdrops unseen | Ignored by authority, weakest social access |

## 7. Cast (5 NPCs)
- **Nakhuda Thorne**: locked in cabin, paranoid, shoots intruders.
- **First Mate Kedar Voss**: the mutineer, also remembers the loops.
- **Bhima**: the cook, gossip, sells information.
- **Gunner Isha Calloway**: runs the port cannons, loyal to the Nakhuda.
- **Bosun Hari**: guards the lifeboats, bribable.

## 8. Endings (5)
1. **Coward's End (bad):** row away alone before the Makara. Loop breaks, you are alone.
2. **Mutineer's Reign (neutral/bad):** side with Kedar, Makara is repelled by his cannons, then he locks you in the brig.
3. **Hero's Sacrifice (bittersweet):** chant from inside the hold while the crew escapes. You become the statue.
4. **Golden Path (perfect):** bribe Kedar with hold gold, expose the Makara's throat, read the chant from the upper deck. The statue crumbles to sand.
5. **The Drowned Loop (hidden, 20 deaths):** you spawn as the ship goes down and are petrified without choosing. The loop starts again.

Exact trigger conditions are in RULES.md. Cinematic scripts are in PROMPTS.md.

## 9. Journal
Opened with `J`. Auto-filled, written in first person. Tabs: **Clues**, **Tide Table** (event times learned), **People**, **Codes**. From the loop after you learn the safe code, it is shown on screen. The journal is the main visible proof of the loop theme.

## 10. Loop evidence (for observant players)
- A seagull lands on the same mast every loop and cries three times at T-4:05, just before the mutiny.
- A locket lies on the deck. The statue in the hold clutches an identical one.
- Scratched tally marks on the rail increase with each loop (one per death, a visible counter).
- Water level on the deck visibly rises with the respawn shift.

## 11. Success criteria
- A judge who plays for 5 minutes sees: a death, a respawn, a journal entry, a memory-gated line, and understands the shrinking clock.
- A judge who plays for 15 minutes can reach one full ending and notices the statue.
- Runs in a browser on itch.io with no install, no crashes, no soft-lock.

## 12. itch.io page checklist
- Cover image (630x500) and 3 screenshots (journal, death toast, statue)
- Short description: "Die to learn. Remember to survive. Every death costs 30 seconds of the tide."
- Controls listed: WASD/arrows move, E interact, J journal, R restart (debug)
- Tag: loop, time-loop, puzzle, pirate, narrative
- Credit asset packs and fonts with licenses
- Mention "future roles and endings" only if truly not built
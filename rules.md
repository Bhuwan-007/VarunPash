# RULES: Loop Mechanics, Roles, Events, Endings

All numbers live in `src/config.ts`. Never hardcode them elsewhere.

## 1. Constants
```ts
export const CONFIG = {
  TIMELINE: 600,        // seconds, calm seas to sinking
  RESPAWN_SHIFT: 30,    // seconds added to the loop start per death
  MAX_DEATHS: 20,       // 20th death triggers the Drowned Loop
  MUTINY_AT: 360,       // ship time (T-4:00)
  GULL_AT: 355,         // omen, 5s before mutiny
  Makara_AT: 480,    // ship time (T-2:00)
  SINK_AT: 600,
  PLAYER_SPEED: 3.2,    // tiles per second
  INTERACT_RADIUS: 1.2, // tiles
  GHOST_HZ: 10,
  TIME_SCALE: 1,        // debug: set >1 to speed up testing
};
```

## 2. Ship time and respawn shift
- **Ship time** is a single clock from 0 to 600. All events, NPC schedules and the sea level run on ship time.
- Loop `n` (after `d` deaths) starts at `shipTime = d * 30`. The player has `600 - start` seconds.
- Dying at any moment costs the same 30 seconds, so a death at 5 seconds is as cheap as one at 5 minutes.
- Events fire at the same ship time every loop. Later starts mean you arrive *into* events already in progress.
  - Start >= 360 (d >= 12): the mutiny has begun when you spawn.
  - Start >= 480 (d >= 16): the Makara is already attacking.
- **The 20th death:** respawn would be at 600. Skip gameplay and play the Drowned Loop ending.
- HUD shows 20 tally marks; each death scratches one. Warn visually at 15 deaths (the sea reaches the hatch).

## 3. What resets and what persists
| Persists (MemoryStore) | Resets on death (LoopStore) |
|---|---|
| playerRole, knowledge flags, journal entries, deathCount, seen endings | inventory, NPC states, player position, door/safe states, Hold gold, ghost plates |

Exception: the **ghost recording** of the just-finished loop is kept for exactly one loop.

## 4. Death types
- **Strategic:** the death added at least one new knowledge flag or journal entry. Show: `The tide takes you. You remember: <entry>.`
- **Wasted:** nothing new learned. Show: `The tide takes you. Nothing remembered. 30 seconds lost.`
- Causes: shot by Captain, stabbed by First Mate, eaten by Makara, vaporized by relic, drowned (overboard or sinking), flogged (caught in a restricted area), poisoned rations.
- Walking off the deck edge, eating poisoned rations out of curiosity and similar are always wasted deaths.

## 5. Roles
| | Navigator | Quartermaster | Deckhand |
|---|---|---|---|
| Start items | Map | Armory Key, Hold Key, 6 coins | none |
| Hold access | Hidden stern hatch (shown on Map) | Hold Key | Vent grates (deck to hold, cabin, quarters) |
| Armory | Needs key from Quartermaster's safe | Direct | Needs key via vents |
| Helm | Can unlock | Needs Helm Key from safe | Needs Helm Key from safe |
| Fighting | Cannot win | Can win vs Hale and Corvin | Cannot win |
| Warn Captain | Knock on cabin door, Captain listens | Meet him on deck at 240-270 | Needs proof (Corvin's coin purse, stolen via vents) |
| NPC attitude | Respectful | Demand a coin for each talk or favour | Ignored, can eavesdrop unseen |
| Special | Reveals Makara's course | Pay bribes | Eavesdrop at 300 for free mutiny info |

Role is set once per session. New Game reassigns. The statue in the hold always matches the assigned role (sprite swap).

## 6. Event timeline (ship time)
| Time | Event |
|---|---|
| 0-240 | Calm. Captain locked in cabin. Corvin patrols. Brine in galley. Ines at port cannons. Hale at starboard lifeboats. |
| 240-270 | Captain steps out to the helm (talk window). |
| 300 | Corvin meets two mutineers below deck (vent audio, Deckhand eavesdrops). |
| 355 | Gull cries three times. |
| 360 | **Mutiny:** Corvin attacks Captain unless stopped (Captain warned or Corvin bribed). |
| 480 | **Makara** attacks port side. Port deck is lethal. |
| 600 | Ship sinks. Death by drowning if still aboard. |

## 7. Knowledge flags
| Flag | How earned | Unlocks |
|---|---|---|
| `K_SAFE_CODE` | Break into the cabin; Captain shouts the code (7-3-1) before shooting | Open safe in Quartermaster's quarters (Helm Key, Armory Key) |
| `K_MUTINEER` | Die to Corvin at 360, or eavesdrop (Deckhand) | Warn Captain, confront or bribe Corvin |
| `K_Makara_WEAKNESS` | Be on the port side at 480 and see the harpoon in its throat | Cannon aim on the throat |
| `K_CHANT` | Touch the relic; hear the sealing chant as you die | Safe chanting |
| `K_LOCKET_TWIN` | Carry the deck locket to the statue and examine its hand | Statue truth |
| `K_STATUE_TRUTH` | Examine statue base after `K_CHANT` and `K_LOCKET_TWIN`: "It speaks from above, never from the deep" | Chant from the upper deck listening grate (Golden Path) |
| `K_OMEN_GULL` | Notice the gull on 3 separate loops | Free cue for mutiny timing |
| `K_BRINE_GOSSIP` | Talk to Brine | Hints: Corvin counts the gold at night, Hale likes coin |
| `K_ALLIED_CORVIN` | After `K_MUTINEER`, talk to Corvin and agree | Mutineer's Reign |

Dialogue lines are gated with `requires: [flags]`, optionally `role`, `minLoop`. Lines the player has earned appear automatically.

## 8. Puzzles and plates
- **Ghost:** the previous loop is replayed as a translucent figure until its recorded death. It cannot be hurt and cannot interact except by standing on **plates**.
- **Plates:** Winch Plate (starboard, lifeboats), Helm Plate (stern). A plate is active while the player or ghost stands on it.
- **Lifeboat launch:** Winch Plate held for 10 seconds while crew board.
- **Helm turn:** Helm Plate held for 15 seconds during 480-510 to expose the Makara's throat.
- Because the ghost only exists from your new start time, its first 30 seconds are skipped. Plan deaths so the ghost stands where you need it.

## 9. Ending conditions
1. **Coward's End:** player boards a lifeboat while at least one crew member is still aboard, before 480. Guard Hale must be neutralized: killed (Quartermaster), bribed with hold gold or 3 coins (Navigator, Quartermaster), or lured away (Deckhand, rattles a vent).
2. **Mutineer's Reign:** `K_ALLIED_CORVIN`, Captain killed in the mutiny, Corvin's cannons beat back the Makara, ship survives to 600.
3. **Hero's Sacrifice:** lifeboat launch completed with crew aboard, `K_CHANT`, and player chants at the relic in the hold by 590.
4. **Golden Path:** all of: stole hold gold, `K_MUTINEER` and bribed Corvin before 360, Captain alive, `K_Makara_WEAKNESS`, Helm Plate held 15s during 480-510 while Ines fires, `K_STATUE_TRUTH` and chant read from the upper deck listening grate by 570.
5. **The Drowned Loop:** 20th death. Automatic. The statue's face is blank.

Each ending sets `endingsSeen` in MemoryStore, shown on the title screen.

## 10. NPC behavior notes
- **Corvin:** from loop 4, if `K_MUTINEER` and confronted, lines show he remembers ("You again." "Third time you've found the knife, haven't you.").
- **Hale:** blocks lifeboats; accepts 3 coins or 1 gold bar; Quartermaster's coins are spent from inventory.
- **Ines:** fires only on the Captain's or Corvin's order; if both are dead she holds fire.
- **Brine:** sells info for a coin if the player is a Quartermaster, otherwise free but vague.
- **Captain:** shoots on forced entry; opens only to the Navigator or with proof.

## 11. Edge cases
- Never soft-lock: if no ending is reachable the player can always die and reset.
- Pause the clock when the tab is hidden, when the journal is open, and during dialogue.
- Interactions are ignored on the first 0.5s after respawn.
- Save to localStorage in try/catch; if blocked, play in-session and warn on the title screen.
# FEEL: Ink & Brine

The look, sound and voice of VarunPash. Every asset, UI element and line of dialogue should feel like it comes from the same cursed ship log.

## 1. Mood in one sentence
A hand-inked manga about a drowned ship: cold, salt-stained, quiet, with one small warm lantern of hope.

## 2. Visual style
- **In-game:** pixel-art top-down, 32x32 tiles, limited palette (max 20 colors), hard shadows, no gradients except the sea.
- **Cinematics and portraits:** black-and-white manga. Heavy ink lines, screentone halftone shading, dramatic angles, one spot color (teal glow) reserved for the Kaal Mani and the ghost.
- **UI:** looks like a weathered ship's log: torn paper, ink stains, wax seals, rope borders.

## 3. Palette
| Name | Hex | Use |
|---|---|---|
| Abyss | `#0b1320` | backgrounds, sea at night |
| Tar | `#07090f` | outlines, shadows |
| Deepwater | `#12303d` | sea mid-tone |
| Driftwood | `#6b5a46` | planks, props |
| Bone | `#e8dfc8` | paper, text, UI panels |
| Lantern | `#f2a541` | warm light, interactable highlights |
| Tide Glow | `#5fd3c4` | relic, ghost, journal highlights |
| Blood Rust | `#b23a3a` | danger, mutiny, death |
| Ash | `#8a8f98` | neutral grey, statue stone |

Rules: Tide Glow is only for the relic, the ghost, and memory-gain moments. Blood Rust is only for danger. Never use pure white or pure black.

## 4. Atmosphere over time
- **0-240:** dusk teal grade, calm waves, creaking wood.
- **240-360:** colors cool and tighten, gull appears.
- **360 (mutiny):** vignette turns Blood Rust, shouts and steel audio.
- **480 (Makara):** screen shake, sea level surges, low rumble, port side desaturates.
- **540+:** water on deck, lantern flicker, music slows.
- **Each loop:** water on deck is slightly higher; tally marks on the rail grow.

## 5. Typography (bundle locally)
- Narration and captions: **IM Fell English SC**
- HUD and menus: **Pixelify Sans** (or VT323)
- Journal handwriting: **Caveat**
- Dialogue: **Special Elite** (typewritten, a little ominous)

## 6. Audio
- **Music:** one looping ambient track (low drone, creaking strings), slows and detunes as the clock runs out. A second layer adds percussion at 360 and 480.
- **Loop rewind sting:** a reversed wave crash plus a clock tick, about 1.5 seconds.
- **SFX:** footsteps on wood, rope creak, gull cry (x3 for the omen), cannon, door lock, journal page turn, memory-gain chime (soft bell), death gurgle.
- **Sources:** Kenney audio (CC0), freesound.org (check license), or Web Audio synth fallbacks.

## 7. Juice checklist
- Screen shake on cannon, Makara, death
- Ink-wipe transition on death and respawn
- Memory gain: the journal icon pulses in Tide Glow with a bell
- Interactable highlight in Lantern color with a small `E` prompt
- Water ripple at the ship edges
- Ghost leaves a faint teal trail

## 8. UI direction
- HUD top-left: loop number as roman numeral plus a countdown in Pixelify Sans.
- Top-right: tally marks (20 slots, filled marks scratched in Blood Rust).
- Dialogue box bottom: Bone panel, ink-stained border, NPC portrait at left.
- Journal: open-book layout, tabs as ribbon bookmarks (Clues, Tide Table, People, Codes). The safe code appears as a handwritten note once learned.
- Death toast: black screen, one line in Bone text, one line in Tide Glow for what you remembered.

## 9. Character design (keep consistent in all art)
- **Player:** hooded sailor, ancient Indian maritime angarakha, no visible face in sprite; sash color by role (Navigator blue, Quartermaster red, Deckhand grey). Silent protagonist.
- **Nakhuda Thorne:** grey beard, ornate maritime turban, scarred left eye, ancient Indian angarakha, sash, pistol.
- **First Mate Kedar Voss:** lean, slicked hair, ancient Indian angarakha, red sash, a gold tooth, quiet smile.
- **Bhima:** round, stained apron over ancient maritime angarakha, one pierced ear, always chewing something.
- **Gunner Isha Calloway:** tall, braided hair, fitted angarakha, powder-burned forearms, rolled sleeves.
- **Bosun Hari:** huge, shaved head, sash and waistcloth, anchor tattoo on the neck, rope belt.
- **Makara:** only parts are ever seen: an eye, a ribbed jaw, a coil of tentacle. A glowing harpoon in its throat.
- **Kaal Mani:** a half-buried teal crystal with glyphs, humming.
- **Statue:** grey stone figure mid-chant, hand clutching a locket, wearing the player's role sash in stone.

## 10. Dialogue voice
- Terse, salt-worn, sailor idiom. One to two short lines per box.
- Nobody explains the loop. They hint at it.
- The player never speaks. Their thoughts appear only in the journal.
- Journal entries are first person, practical, slightly haunted.

**NPC voice sheet**
- **Nakhuda:** clipped orders, paranoid. "Count the stars. Count the knives. The knives are winning."
- **Kedar:** polite menace, amused. "You look tired. Sleep. It's cheap, I hear."
- **Bhima:** warm gossip, food metaphors. "Everything on this ship gets cooked in the end."
- **Isha:** blunt, loyal, short. "Give me a target and a reason. Reason's optional."
- **Hari:** slow, suspicious, bribable. "Coin's a kind of kindness."

**Journal entry examples**
- "The Nakhuda screamed seven-three-one before the pistol spoke. Odd thing to remember."
- "The gull. Always the same mast. Always three cries. Always before the knives."
- "The statue wears my sash. I do not like that I recognize the hand."

## 11. Anti-goals
- No bright cartoon colors, no comedy sidekicks, no gore close-ups, no explaining the twist in dialogue.
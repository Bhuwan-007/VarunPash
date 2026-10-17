# PROMPTS: Build Prompts, Story Scripts, Image Prompts

## PART A: Antigravity build prompts (run in order, test after each)

**Rule for every prompt:** "First read PRD.md, RULES.md, ARCHITECTURE.md and FEEL.md in the project root. Follow them exactly. All numbers come from `src/config.ts`. Do not add features I did not ask for. When done, tell me how to test it."

### P0: Scaffold and deploy test
"Create a Vite + React + TypeScript project with Zustand. Set `base: './'` in vite.config.ts. Create the folder structure from ARCHITECTURE.md section 2 with empty files. Add `src/config.ts` from RULES.md. Render a 1280x720 canvas with the text 'VarunPash'. Show me how to build and zip `dist` so index.html is at the zip root for itch.io."
*Then upload to itch.io right now and confirm it runs.*

### P1: Engine, map, movement
"Build the game engine: fixed-timestep loop with requestAnimationFrame, input (WASD/arrows, E, J), camera, AABB collision against a tile grid. Create the deck map from ARCHITECTURE.md section 10 and a hold map. Draw tiles with procedural placeholder rectangles in the FEEL.md palette. Add a player with 4-direction movement and an interaction prompt when within INTERACT_RADIUS of an interactable. Add hatch transitions between deck and hold."

### P2: Stores and the loop
"Implement MemoryStore, LoopStore and UIStore per ARCHITECTURE.md section 3 (persist MemoryStore in try/catch). Implement loopManager: ship time driven by the game loop (not setInterval), death handling, respawn at `deathCount * RESPAWN_SHIFT`, strategic vs wasted death detection, DeathToast UI, HUD with loop numeral, countdown and 20 tally marks. Add a debug panel with the controls from ARCHITECTURE.md section 12. Add a test button that kills the player."

### P3: Journal and dialogue
"Implement the journal (RULES.md section 7, FEEL.md section 8): tabs Clues, Tide Table, People, Codes, opened with J, pausing the clock. Implement the dialogue system from ARCHITECTURE.md section 7 with `requires`, `role`, `minLoop` and `grants`. Add the dialogue box with a portrait placeholder. Add Bhima with 4 lines as a test, one gated by `K_BHIMA_GOSSIP`."

### P4: Events and NPC schedules
"Implement the eventScheduler and npcSchedule from RULES.md sections 6 and 10 for ship time: calm, gull omen at 355, mutiny at 360, Makara at 480, sinking at 600. Events that have already passed at spawn must start in their 'in progress' state. Add the 5 NPCs as colored placeholder sprites with the movement and behavior described. Add death causes: Nakhuda shoots intruders, Kedar stabs, Makara eats port side, drowning."

### P5: Roles
"Implement role randomization on New Game and the role matrix in RULES.md section 5: starting items, hold access (Map hatch, Hold Key, vent grates), armory, helm, fighting, NPC attitudes, Deckhand eavesdrop at 300 granting `K_MUTINEER`. Role-specific sprite sash colors. The statue in the hold must match the role."

### P6: Knowledge gating and puzzles
"Implement every knowledge flag in RULES.md section 7 with how it is earned and what it unlocks: the safe (code 7-3-1), the relic and chant, the statue examination, the locket on the deck, the gull omen counter. The safe code must appear on screen in the journal once learned."

### P7: First complete ending (Hero's Sacrifice) and the statue twist
"Implement the Hero's Sacrifice ending per RULES.md section 9, the lifeboat winch (Winch Plate held 10s), chanting at the relic, and the cutscene system from ARCHITECTURE.md section 8 with the `ending_hero` script from PROMPTS.md Part B. Add the statue in the hold from loop 1."

### P8: Remaining endings
"Implement Coward's End and Mutineer's Reign per RULES.md section 9 with cutscenes `ending_coward` and `ending_mutineer` (Mutineer's Reign triggers immediately when Makara is repelled). Then the Drowned Loop at the 20th death with `ending_drowned`."

### P9: Ghost and plates
"Implement ghostRecorder and Ghost entity (ARCHITECTURE.md section 6) and plates (RULES.md section 8): Winch Plate and Helm Plate activate when the player or ghost stands on them. Ghost is intangible, translucent Tide Glow."

### P10: Golden Path
"Implement the Golden Path per RULES.md section 9: stolen gold, bribing Kedar, Helm Plate held 15s during 480-510 while Isha fires, chant read from the upper-deck listening grate with `K_STATUE_TRUTH`. Play `ending_golden`."

### P11: Opening cinematic, title, polish
"Add the TitleScreen (New Game, Continue, endings seen), the `intro` cinematic, loop-evidence details (gull on the same mast, locket, tally marks, rising water), screen shake, ink-wipe transitions, audio per FEEL.md sections 4-7. Bundle all fonts locally."

### P12: QA and release
"Playtest checklist: can every ending be reached? Can the player soft-lock? Does death at 0.5s after spawn behave? Does the tab-hidden pause work? Does localStorage failure degrade gracefully? Fix bugs only, no new features. Prepare the itch.io build and the page copy from PRD.md section 12."

---

## PART B: Cinematic scripts (captions are the in-game text)

Each cinematic is a list of panels: `{ image: '/assets/cinematics/<id>-<n>.webp', caption }`. Aspect 16:9, 1280x720.

### `intro` (opening story)
1. *Moonless sea, galleon cutting black water.* "The Jal-Doot left port with a full hold and a crew that never said where they were going."
2. *Fog swallows the horizon, the waves go still.* "Past the last chart, the tide stopped moving. Then it began to run backwards."
3. *Hold, teal crystal humming, crew gathered, shadows long.* "In the hold, something that had no business aboard began to hum."
4. *Hooded figure on deck, face hidden, lantern in hand.* "You were nobody important. That is why you were awake."
5. *Makara eye and jaw rising behind the port rail, sails torn.* "At the sixth bell, the sea stood up."
6. *Black panel, a drowned clock face, a gull.* "Then: the deck again. The same gull. The same locket. The same sky." *(Title card: VarunPash)*

### `ending_coward` (Coward's End)
1. *Lifeboat rowing away on black water, burning galleon behind.* "You rowed. You did not look back."
2. *Makara shadow under the boat, silhouettes on the deck.* "A lantern burned on the deck. Then it did not."
3. *Gray empty sea, locket in a shaking hand.* "The loop broke. So did every voice that had ever answered you."
4. *Tiny boat, huge horizon.* "You are alive. That is the whole of the sentence."

### `ending_mutineer` (Mutineer's Reign)
1. *Kedar wearing the Nakhuda's turban, body beneath a flag.* "The Nakhuda's turban fit Kedar well."
2. *Cannons firing, Makara recoiling, ship battered.* "The cannons did what cannons do."
3. *Kedar smiling, guards seizing the player, gold being counted.* "A share is a share. Two shares are a debt."
4. *Brig cell, tally marks scratched on the wall.* "You scratched the days into the wall. They did not repeat. That was the cruelty of it."

### `ending_hero` (Hero's Sacrifice)
1. *Lifeboats lowering, crew faces looking up at the hold hatch.* "They asked who would stay. No one asked twice."
2. *Hold, player's hand on the Kaal Mani, glyphs blazing, stone creeping up the arm.* "The chant came easily. It was your own voice."
3. *Lifeboats on dawn water, Bhima weeping, Isha saluting, the ship slipping under.* "The crew lived. The ship did not."
4. *Seabed hold, a stone figure clutching a locket, a gull cry above.* "In the hold, a stone figure with your face. It had always been there." *(Hint of the intro)*

### `ending_golden` (The Golden Path)
1. *Kedar at the cannon with a gold bar, Nakhuda beside him.* "Greed, correctly aimed, is a kind of loyalty."
2. *Helm turned, Makara's throat exposed, harpoon glowing, cannons firing.* "The sea showed its throat. The Jal-Doot did not miss."
3. *Upper deck, player reading the chant through the grate, relic's light dying, no stone.* "You said the words from far above. The sea heard, and let go."
4. *Sunrise, the hold's statue crumbling to sand, a gull flying free.* "For the first time, nobody was left waiting for you at the end."

### `ending_drowned` (The Drowned Loop)
1. *Deck underwater, clock stopped, player standing in the shallows.* "You arrived as the ship went down."
2. *Hand turning to grey stone, the Kaal Mani glowing.* "The tide did not ask."
3. *Water closing over, the hatch shutting.* "There was no one to choose. So you were chosen."
4. *The statue, face blank, the same pose as the intro; a gull cries three times.* "And the tide began again."

---

## PART C: Manga image prompts

Use any image generator (Gemini/Imagen, Midjourney, Firefly, Stable Diffusion). Generate at 16:9 and export WebP, named `<cinematic-id>-<panel#>.webp`, into `public/assets/cinematics/`.

### Shared STYLE block (paste at the end of every prompt)
```
black-and-white Japanese manga panel, heavy ink linework, screentone halftone shading,
high contrast, dramatic camera angle, hand-inked, gritty nautical horror, spot color teal (#5fd3c4)
used only for glowing relic and ghosts, no text, no speech bubbles, 16:9
```

### Intro
1. `A black galleon cutting through moonless sea at night, long shadow, lanterns on deck, wide shot`
2. `Thick fog swallowing the horizon, perfectly still black water, the galleon small in frame`
3. `Cargo hold interior, a half-buried glowing teal crystal with glyphs, crew silhouettes gathered, long shadows`
4. `Close-up of a hooded sailor on deck holding a lantern, face hidden in shadow, ancient Indian maritime angarakha, sash`
5. `Giant sea monster's eye and ribbed jaw rising behind a ship's port rail, torn sails, spray`
6. `Black background, a drowned clock face half sunk in water, a single seagull above`

### Coward's End
1. `A small lifeboat rowing away on black water, a burning galleon sinking behind, sparks`
2. `A giant monster shadow passing beneath a tiny boat, tiny crew silhouettes on the burning ship`
3. `Empty grey sea at dawn, a trembling hand holding a locket`
4. `A tiny boat in the center of an enormous empty horizon, extreme wide shot`

### Mutineer's Reign
1. `A lean man named Kedar with slicked hair, red sash and gold tooth, wearing an ornate maritime turban and angarakha, standing over a body covered by a flag`
2. `Ship cannons firing at a monster recoiling, wrecked deck, smoke`
3. `The smiling first mate Kedar in an angarakha and sash, two guards gripping a hooded sailor, a chest of gold bars being counted`
4. `A dim brig cell, tally marks scratched into the wall, water dripping`

### Hero's Sacrifice
1. `Lifeboats being lowered, tired crew faces looking up at a hatch, golden dawn light`
2. `A hooded sailor in a hold, hand pressed to a glowing teal crystal, glyphs blazing, stone creeping up the arm`
3. `Lifeboats on calm dawn water, a round cook Bhima weeping in an angarakha, a tall braided gunner Isha saluting, a galleon slipping under the waves`
4. `A grey stone statue of a hooded sailor mid-chant at the bottom of a ship's hold, clutching a locket, silent`

### The Golden Path
1. `A lean first mate Kedar with a red sash and angarakha at a cannon, holding a gold bar, a grey-bearded Nakhuda in an ornate maritime turban and angarakha at his side`
2. `A ship turning, a sea monster's throat exposed with a glowing harpoon, cannons firing`
3. `A hooded sailor on the upper deck reading from a page through a wooden grate, below a crystal's light dying`
4. `Sunrise, a stone statue crumbling into sand in the hold, a gull flying free through the hatch`

### The Drowned Loop
1. `A ship deck half underwater, a stopped clock on the mast, a hooded figure standing in the shallows`
2. `A hand turning to grey stone, glowing teal crystal behind it`
3. `Dark water closing over a hatch, bubbles rising`
4. `A blank-faced grey stone statue in a hold, same pose as a sailor mid-chant, a gull silhouette above`

### Portraits (square 1:1, 512x512, same STYLE block)
- Nakhuda: `grey bearded Nakhuda, ornate maritime turban, scarred left eye, ancient Indian maritime angarakha, sash, stern`
- Kedar: `lean first mate Kedar, slicked hair, ancient Indian angarakha, red sash, gold tooth, quiet amused smile`
- Bhima: `round ship's cook Bhima, ancient maritime angarakha, stained apron, one pierced ear, chewing something, kind tired eyes`
- Isha: `tall woman gunner Isha, braided hair, fitted angarakha, powder-burned forearms, rolled sleeves, blunt stare`
- Hari: `huge shaved-head bosun Hari, sash, waistcloth, anchor tattoo on neck, rope belt, suspicious squint`
- Player: `hooded sailor, face in shadow, ancient Indian maritime angarakha, colored sash` (make 3 versions: blue, red, grey sash)

### Sprites (if you generate rather than use a free pack)
Prompt: `pixel art top-down character sprite sheet, 32x32 per frame, 4 directions x 3 walk frames, limited 16-color palette, dark nautical palette, transparent background`
Generate Player (3 sash colors), Nakhuda, Kedar, Bhima, Isha, Hari. Treat AI sprite sheets as drafts; clean up alignment before use.

---

## PART D: If you run out of time on art
Ship with procedural placeholders and caption-only cutscenes. The code is built to survive missing images. Prioritize assets in this order: intro panels, Hero ending, statue sprite, NPC portraits, everything else.
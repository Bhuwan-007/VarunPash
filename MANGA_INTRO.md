# MANGA_INTRO: Manga page cutscene system and the opening story

Read FEEL.md first (palette, fonts). This file defines how story cutscenes look and play. The same system will be reused for the endings.

## 1. Why this exists
Plain AI images in a grid do not feel like manga. Manga feel comes from: (a) panels of different sizes by importance, (b) text inside bubbles, narration boxes and sound effects, (c) a reading flow that reveals the story one beat at a time, and (d) hand-inked art with speed lines and screentone. The art is generated as images. Everything else (layout, bubbles, SFX, reveal) is built in code so the text is crisp and editable. NEVER put text inside generated images.

## 2. Component: MangaPage (React overlay, read-only renderer untouched)
- Page canvas: a 1600 x 900 coordinate space scaled to fit the screen (keep 16:9, letterbox if needed). Page background aged-paper white, thin white gutters, black ink panel borders (4 px, slightly uneven), a faint screentone dot overlay on the page.
- Panel: `rect [x, y, w, h]` in page units, `image`, `fit` ('cover' default, 'contain' on black for strips), `focus [x, y]` (0 to 1, default 0.5, 0.5) used as the crop focus.
- Items inside a panel are positioned in percent of the panel (`at [x%, y%]`, `w` = width %):
  - `narration`: cream rectangle (#f2ede4), 3 px black border, text in IM Fell English SC italic.
  - `speech`: white ellipse bubble, 3 px black outline, a tail pointing to `tail [x%, y%]`, text in Comic Neue Bold, UPPERCASE.
  - `shout`: spiky burst bubble, bold larger text.
  - `whisper`: dashed-outline bubble, smaller italic text.
  - `sfx`: big stylized text in Bangers, white fill, thick black outline, slight rotation (`rot`), sizes sm/md/lg/xl. It may overlap panel edges. Teal (#5fd3c4) fill with black outline for hums and ticks.
- Reveal flow (left to right, top to bottom): each press of Space, E or click reveals the next panel (about 250 ms scale-in from 1.06 and a fade, 80 ms ink-flash). Its bubbles pop in 250 ms later; SFX slam in (scale 1.6 to 1) with a tiny shake. When a page is complete, the next press flips to the next page (page-turn sound). Esc skips the whole cutscene. The 'impact' flag on a panel adds a white flash and a screen shake.
- Missing image: draw a black halftone panel, text still shows. Never crash.
- Bundle fonts locally: @fontsource/bangers, @fontsource/comic-neue, @fontsource/im-fell-english-sc.
- API: playCutscene(id), `onComplete` callback. After the intro finishes, show a title card "THE ABYSSAL TIDE" (large, ink style) for 3 seconds, then start the game. If there is no title screen, add a minimal one (New Game / Continue). Play the intro only on New Game.

## 3. Intro data (2 pages, 11 panels)
Images live in `public/assets/cinematics/`. Reading order is the order listed.

### Page 1: "The Tide Runs Backward"
| id | rect [x, y, w, h] | image | notes |
|---|---|---|---|
| p1a | [20, 20, 1000, 520] | intro-p1a.webp | HERO panel: the ship at night |
| p1b | [1040, 20, 540, 250] | intro-p1b.webp | ship in fog |
| p1c | [1040, 290, 540, 250] | intro-p1c.webp | Nakhuda (left) and Bhima (right) at the helm |
| p1d1 | [20, 560, 820, 320] | intro-p1d1.webp | crystal in the hold |
| p1d2 | [860, 560, 720, 320] | intro-p1d2.webp | Kedar close-up (left of frame) |

Items:
- p1a: narration at [3, 5], w 46: "The Jal-Doot left port with a full hold and a crew that never said where they were going." sfx "creeeak..." at [60, 80], md, rot -4.
- p1b: narration at [4, 62], w 58: "Past the last chart, the sea stopped moving."
- p1c: speech at [4, 6], w 50, tail [26, 60]: "The compass is spinning. The tide is running backwards." speech at [50, 52], w 44, tail [78, 78]: "Water doesn't run backwards, Captain."
- p1d1: narration at [3, 6], w 50: "In the hold, something that had no business aboard began to hum." sfx "hmmmm..." (teal) at [66, 72], md.
- p1d2: speech at [46, 8], w 50, tail [28, 58]: "Let it hum. Gold doesn't care what the sea does."

### Page 2: "The Sixth Bell"
| id | rect [x, y, w, h] | image | notes |
|---|---|---|---|
| p2e | [20, 20, 500, 250] | intro-p2e.webp | hooded sailor with lantern (on the right of frame) |
| p2f | [540, 20, 500, 250] | intro-p2f.webp | gull on the mast |
| p2g | [1060, 20, 520, 250] | intro-p2g.webp | a dagger drawn behind the Captain |
| p2h | [20, 290, 1040, 400] | intro-p2h.webp | HERO + impact: the Makara breaches |
| p2i | [1080, 290, 500, 400] | intro-p2i.webp | Nakhuda shouting |
| p2j | [20, 710, 1560, 170] | intro-p2j.webp | fit 'contain' on black: the drowned clock and gull |

Items:
- p2e: narration at [4, 6], w 60: "I was nobody important. That is why I was awake when it began."
- p2f: sfx "KRAA! KRAA! KRAA!" at [6, 28], lg, rot -6. narration at [54, 74], w 42: "Three cries. Then the knives."
- p2g: whisper at [48, 10], w 46, tail [22, 58]: "Forgive me, Captain."
- p2h: impact true. sfx "KRRRAAASSSH!!" at [14, 8], xl, rot -3. narration at [3, 80], w 38: "At the sixth bell, the sea stood up."
- p2i: shout at [6, 6], w 88, tail [50, 62]: "PORT SIDE! ALL HANDS TO THE PORT SIDE!!"
- p2j: narration at [3, 14], w 56: "Then, the deck again. The same gull. The same locket. The same sky." sfx "tick... tick..." (teal) at [76, 40], sm.

Title card after page 2: "THE ABYSSAL TIDE".

## 4. Art for the panels (what you provide)
Six panels already exist in your first collage. Crop them from the ORIGINAL downloaded image, not a screenshot, and save as:
| Collage panel | File |
|---|---|
| top-left (ship at night) | intro-p1a.webp |
| top-right (fog) | intro-p1b.webp |
| middle-left (crystal, crew) | intro-p1d1.webp |
| middle-right (hooded sailor, lantern) | intro-p2e.webp |
| bottom-left (Makara) | intro-p2h.webp |
| bottom-right (clock, gull) | intro-p2j.webp |

If a crop looks blurry, regenerate that panel alone at 16:9 using its prompt in PROMPTS.md Part C.

Generate these five NEW panels one at a time, 16:9, with the concept art attached for style. Shared STYLE line: "Black-and-white Japanese manga panel, hand-inked G-pen linework, bold black shadows, dense screentone halftone dots, dynamic composition. No text, no speech bubbles, no sound effects, no panel borders. Landscape 16:9, main subject centered with margin."
- intro-p1c.webp: "Two-shot at a ship's helm at night: on the LEFT a grey-bearded captain in an ornate maritime turban and angarakha gripping the wheel, staring at a spinning compass in his other hand; on the RIGHT a round, nervous cook in a stained apron. Moonless sea behind them, warm lantern light."
- intro-p1d2.webp: "Extreme close-up of a lean first mate on the LEFT of frame, slicked hair, a gold tooth glinting in a quiet amused smile, red sash, eyes lit by faint teal glow from below, dark hold background."
- intro-p2f.webp: "A single seagull perched on a ship's mast crossbeam against a pale foggy sky, wings half open, beak wide in mid-cry, dramatic low angle, rigging ropes, ominous."
- intro-p2g.webp: "Over a captain's shoulder: a lean man's hand drawing a curved dagger from a red sash, the blade catching a cold glint, the captain unaware in the foreground, the man's half-lit face at the LEFT edge, tense close shot."
- intro-p2i.webp: "Dynamic low-angle shot of a grey-bearded captain in an ornate turban shouting, mouth wide open, one arm pointing off-frame, speed lines radiating, wind-blown coat, ship rigging behind."

## 5. Verify
- Panels differ in size and the two hero panels (p1a, p2h) are visibly larger than the rest.
- Reveal runs panel by panel, bubbles pop after the art, SFX slam in, the impact panel flashes and shakes.
- Text is crisp, never inside the images, and never overlaps a character's face (adjust `at` if it does).
- A missing image degrades to a black panel with the text intact.
- Space or E advances, Esc skips, the title card appears, and the intro plays only on New Game.
- The same component can play any page list (endings will reuse it).
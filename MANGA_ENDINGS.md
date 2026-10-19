# MANGA_ENDINGS: Manga pages for the endings

Same MangaPage system, lettering styles and fallbacks as MANGA_INTRO.md (page canvas 1600 x 900). Endings play with manual advance (Space, E or click; Esc skips) and no auto-advance. After the last page, show an end card with the ending name and "Endings found: N" (never a total), then return to the title screen. Further endings will be added here as they are built.

## ending_hero: THE HERO'S SACRIFICE (2 pages)

### Page 1
| id | rect [x, y, w, h] | image | notes |
|---|---|---|---|
| a | [20, 20, 1000, 520] | eh-a.webp | HERO: lifeboats lowering, faces looking up |
| b | [1040, 20, 540, 520] | eh-b.webp | Bhima (left) and Isha (right) |
| c | [20, 560, 820, 320] | eh-c.webp | impact: the chant in the hold |
| d | [860, 560, 720, 320] | eh-d.webp | the ship slipping under |

Items:
- a: narration at [3, 5], w 44: "They asked who would stay. No one asked twice." sfx "creeeak..." at [62, 80], sm, rot -4.
- b: shout at [4, 6], w 52, tail [26, 58]: "WAIT! HE'S STILL DOWN THERE!" speech at [50, 62], w 44, tail [76, 78]: "...He chose."
- c: impact true. whisper (teal) at [8, 8], w 56, tail [50, 60]: "...seven syllables... seven tides..." narration at [4, 78], w 60: "The chant came easily. It was my own voice."
- d: narration at [3, 6], w 50: "The crew lived. The ship did not." sfx "kraa..." at [74, 14], sm.

### Page 2
| id | rect [x, y, w, h] | image | notes |
|---|---|---|---|
| e | [20, 20, 1560, 860] | m-statue-a.webp (reuse from MANGA_MOMENTS.md) | the statue |

Items:
- e: narration at [3, 84], w 50: "In the hold, a stone figure with my face. It had always been there."

End card: "THE HERO'S SACRIFICE".

### Art for the Hero's Sacrifice (16:9, concept art attached, no text in the images)
Shared STYLE line: "Black-and-white Japanese manga panel, hand-inked G-pen linework, bold black shadows, dense screentone halftone dots, dynamic composition. No text, no speech bubbles, no sound effects, no panel borders. Main subject centered with margin."
- eh-a.webp: "Lifeboats being lowered from davits into calm dawn water, tired crew faces looking up toward a dark hatch on the deck, golden dawn light, wide dynamic shot."
- eh-b.webp: "Two-shot: a round cook weeping with a hand outstretched on the LEFT, a tall braided woman gunner saluting stiffly on the RIGHT, lifeboat rail behind them, dawn light."
- eh-c.webp: "A hooded sailor in a ship's hold with a hand pressed to a blazing teal crystal, glyphs lighting up, grey stone creeping up the forearm, strong teal rim light, wide."
- eh-d.webp: "Wide shot: lifeboats on calm dawn water, a galleon slipping beneath the waves in the distance, a single gull above."
- Page 2 reuses m-statue-a.webp. If you have not made it yet: "A grey stone statue of a hooded figure mid-chant at the bottom of a ship's hold, a sash carved in the stone, a locket in the clenched hand, face turned away, teal glow fading."

## Verify
- The ending plays once per trigger, with manual advance and skip, then the end card and the title screen with "Endings found: N".
- A missing image degrades to a black halftone panel with the text intact.
- `endingsSeen` includes 'hero' and survives a refresh; New Game clears it only if the player chooses a full reset.
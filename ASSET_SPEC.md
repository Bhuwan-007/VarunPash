# ASSET_SPEC: VarunPash Art & Sprite Specification

> **Target Visual Style**: Match [`reference/concept-art.png`](file:///c:/VarunPash/reference/concept-art.png) — Top-down high-angle oblique perspective, hand-inked crosshatch outlines, muted maritime palette ([FEEL.md](file:///c:/VarunPash/feel.md)), warm lantern glow, vertical ship deck alignment.
>
> **Grid Scale**: **64 pixels per tile** (`CONFIG.TILE_SIZE = 64`).

---

## 1. Architectural Strategy: Painted Deck vs. Modular Tiles

To match the continuous hand-crafted linework and organic hull curvature of the concept art, the primary environment uses a **single painted deck background** with separate Y-sorted interactable sprites:
- **Base Background**: `deck_painted_hull.png` (16 tiles wide x 12 tiles high = 1024px x 768px; cropped content 974px x 746px at 2.0x native aspect ratio). Contains the outer ocean edge, wooden hull borders, gunwales, forecastle/quarterdeck stairs, painted hatch, listening grate, mast base, cannon, winch, lifeboat, and plank texture.
- **Scale Factor**: Scaled 2.0x from the raw 669x373 art so the open cargo hold hatch is about 2 tiles wide (~128px outer frame, ~104px inner void).
- **Collision Grid**: 16x12 tile matrix (`64px` per cell). Solid rails, hull walls, crates, barrels, mast, and obstructions prevent player clipping, verifiable in real time via the **Dev Collision Grid Overlay (`C` key)**.

---

## 2. Layer Hierarchy (Renderer Order)

Rendering is structured into 9 strict render passes:

```
1. Sea                 (Abyssal water swell, oscillating ocean waves, dynamic wakes)
2. Hull                (Exterior hull geometry / painted hull background)
3. Deck Floor          (Vertical planking, forecastle and quarterdeck stair treads)
4. Ground Shadows      (Soft elliptical drop shadows, rope decals, open hatch void)
5. Y-Sorted Objects    (Props, NPCs, Player, Ghost sorted by footprint bottom: y + height)
6. Foreground Overlay  (Hanging rigging, shrouds, sail hem shadows; 1.05x parallax)
7. Lighting Effect     (Radial lantern illumination on painted lantern at [595, 387], Tide Glow)
8. Vignette            (Film grain, dark ocean vignette)
9. In-World UI         (Floating [E] interaction prompts, message banners, dev collision grid)
```

---

## 3. Asset Registry

### Tier 1: Core Look & Deck Environment (12 Files — Target ≤ 15)

| Filename | Path in `public/assets/` | Pixel Size (WxH) | Anchor Point (X, Y) | Footprint (Tiles) | Transparency | Scene | Notes |
|---|---|---|---|---|---|---|---|
| `deck_painted_hull.png` | `sprites/deck_painted_hull.png` | 1024 x 768 (974x746 cropped) | `(0.0, 0.0)` | 16 x 12 | Yes (PNG) | Deck | Complete compact painted deck with bow, stern, hatch (2 tiles wide), mast, and rails. |
| `sea_water_tile.png` | `sprites/sea_water_tile.png` | 256 x 256 | `(0.0, 0.0)` | 4 x 4 | No | Deck | Seamless repeating deep ocean texture in `#0b1320` and `#12303d`. |
| `sea_foam_wake.png` | `sprites/sea_foam_wake.png` | 128 x 512 | `(0.5, 0.0)` | 2 x 8 | Yes (PNG) | Deck | White foam wake along port and starboard hull edges. |
| `prop_mast_main.png` | `sprites/prop_mast_main.png` | 128 x 384 | `(0.5, 0.95)` | 2 x 1 | Yes (PNG) | Deck | Tall center mast with brass ring base and rope coils. Player can walk behind it. |
| `prop_hatch_deck.png` | `sprites/prop_hatch_deck.png` | 160 x 96 | `(0.5, 0.8)` | 2 x 1 | Yes (PNG) | Deck | Open square hold entrance with propped wooden lid and ladder rungs. |
| `prop_cargo_crates.png` | `sprites/prop_cargo_crates.png` | 128 x 160 | `(0.5, 0.9)` | 2 x 2 | Yes (PNG) | Deck | Stacked oak shipping crates with iron bands. Occludes player from behind. |
| `prop_rum_barrels.png` | `sprites/prop_rum_barrels.png` | 96 x 80 | `(0.5, 0.85)` | 1.5 x 1 | Yes (PNG) | Deck | Oak brine and water barrels on wooden chocks. |
| `prop_cannon_port.png` | `sprites/prop_cannon_port.png` | 96 x 64 | `(0.4, 0.8)` | 1.5 x 1 | Yes (PNG) | Deck | Black iron cannon pointing out port side gunwale. |
| `prop_starboard_lifeboat.png` | `sprites/prop_starboard_lifeboat.png` | 96 x 288 | `(0.5, 0.9)` | 1.5 x 4 | Yes (PNG) | Deck | Suspended wooden cutter along starboard rail. |
| `prop_starboard_winch.png` | `sprites/prop_starboard_winch.png` | 64 x 96 | `(0.5, 0.85)` | 1 x 1 | Yes (PNG) | Deck | Geared iron rope drum mechanism for lifeboat davit. |
| `prop_deck_lantern.png` | `sprites/prop_deck_lantern.png` | 48 x 64 | `(0.5, 0.9)` | 0.5 x 0.5 | Yes (PNG) | Deck | Warm brass storm lantern casting radial light beside the hatch. |
| `char_player.png` | `sprites/char_player.png` | 192 x 256 | `(0.5, 0.9)` | 1 x 1 | Yes (PNG) | Both | 4 directions (down, up, left, right) x 3 frames (idle, walk1, walk2) @ 64x64. |

---

### Tier 2: NPCs & Dialogue Portraits (10 Files)

| Filename | Path in `public/assets/` | Pixel Size (WxH) | Anchor Point (X, Y) | Footprint (Tiles) | Transparency | Scene | Notes |
|---|---|---|---|---|---|---|---|
| `char_nakhuda.png` | `sprites/char_nakhuda.png` | 192 x 256 | `(0.5, 0.9)` | 1 x 1 | Yes (PNG) | Deck | Nakhuda Thorne: turban, heavy angarakha, pistol (4 dir x 3 frames). |
| `char_kedar.png` | `sprites/char_kedar.png` | 192 x 256 | `(0.5, 0.9)` | 1 x 1 | Yes (PNG) | Deck | First Mate Kedar: slick hair, crimson sash, talwar (4 dir x 3 frames). |
| `char_bhima.png` | `sprites/char_bhima.png` | 192 x 256 | `(0.5, 0.9)` | 1 x 1 | Yes (PNG) | Deck | Bhima: round belly, cook's apron, cleaver (4 dir x 3 frames). |
| `char_isha.png` | `sprites/char_isha.png` | 192 x 256 | `(0.5, 0.9)` | 1 x 1 | Yes (PNG) | Deck | Gunner Isha: powder-burned forearms, braids (4 dir x 3 frames). |
| `char_hari.png` | `sprites/char_hari.png` | 192 x 256 | `(0.5, 0.9)` | 1 x 1 | Yes (PNG) | Deck | Bosun Hari: massive frame, shaved head, rope belt (4 dir x 3 frames). |
| `nakhuda_thorne.png` | `portraits/nakhuda_thorne.png` | 160 x 160 | `(0.0, 0.0)` | UI Overlay | No (Square) | UI | Pen-and-ink woodcut style portrait in turban. |
| `kedar_voss.png` | `portraits/kedar_voss.png` | 160 x 160 | `(0.0, 0.0)` | UI Overlay | No (Square) | UI | Pen-and-ink portrait with sharp gaze and earring. |
| `bhima.png` | `portraits/bhima.png` | 160 x 160 | `(0.0, 0.0)` | UI Overlay | No (Square) | UI | Pen-and-ink portrait with pierced ear and apron. |
| `isha.png` | `portraits/isha.png` | 160 x 160 | `(0.0, 0.0)` | UI Overlay | No (Square) | UI | Pen-and-ink portrait with braided hair. |
| `hari.png` | `portraits/hari.png` | 160 x 160 | `(0.0, 0.0)` | UI Overlay | No (Square) | UI | Pen-and-ink portrait with anchor neck tattoo. |

---

### Tier 3: Cargo Hold, Relic, Statue, and UI (6 Files)

| Filename | Path in `public/assets/` | Pixel Size (WxH) | Anchor Point (X, Y) | Footprint (Tiles) | Transparency | Scene | Notes |
|---|---|---|---|---|---|---|---|
| `hold_painted_interior.png` | `sprites/hold_painted_interior.png` | 1152 x 512 | `(0.0, 0.0)` | 18 x 8 | Yes (PNG) | Hold | Lower cargo hold with hull ribs, ceiling beams, and plank flooring. |
| `prop_kaal_mani.png` | `sprites/prop_kaal_mani.png` | 96 x 128 | `(0.5, 0.85)` | 1.5 x 1.5 | Yes (PNG) | Hold | Cursed teal crystal pulsing with Tide Glow light. |
| `prop_statue.png` | `sprites/prop_statue.png` | 96 x 160 | `(0.5, 0.9)` | 1.5 x 1 | Yes (PNG) | Hold | Petrified player effigy mid-chant clutching silver locket. |
| `prop_gold_chest.png` | `sprites/prop_gold_chest.png` | 64 x 64 | `(0.5, 0.8)` | 1 x 1 | Yes (PNG) | Hold | Heavy locked chest containing gold coins. |
| `ui_parchment_box.png` | `sprites/ui_parchment_box.png` | 800 x 180 | `(0.5, 1.0)` | UI Overlay | Yes (PNG) | UI | Parchment dialogue frame with torn ink-stained edges. |
| `overlay_rigging.png` | `sprites/overlay_rigging.png` | 1280 x 720 | `(0.0, 0.0)` | 20 x 11.25 | Yes (PNG) | Deck | Foreground shrouds and stays; scrolls with 1.05x camera parallax. |

---

## 4. Sprite Sheet Specifications

### Character Sprites (`char_player.png`, etc.)
- **Grid Layout**: 3 columns (frames) x 4 rows (directions)
- **Cell Size**: 64px width x 64px height (Total sheet: 192px x 256px)
- **Row Index Mapping**:
  - `Row 0` (Y: 0): **Facing Down** (South)
  - `Row 1` (Y: 64): **Facing Up** (North)
  - `Row 2` (Y: 128): **Facing Left** (West)
  - `Row 3` (Y: 192): **Facing Right** (East)
- **Column Index Mapping**:
  - `Col 0` (X: 0): **Idle** (neutral stance)
  - `Col 1` (X: 64): **Walk Frame 1** (left foot forward)
  - `Col 2` (X: 128): **Walk Frame 2** (right foot forward)

---

## 5. Depth & Y-Sorting Rules

1. Every object on the deck or hold defines its `footprintY`:
   $$\text{footprintY} = \text{tileY} \times 64 + \text{heightOffset}$$
2. The player's footprint is located at `player.y * 64 + 20` (near the soles of the feet).
3. Any object whose `footprintY` is greater than the player's `footprintY` is rendered **after** the player (appearing in front of the player).
4. Any object whose `footprintY` is less than the player's `footprintY` is rendered **before** the player (the player walks in front of it).
5. Tall props (e.g. `prop_mast_main` at height 384px) extend high above their base footprint. When the player stands north of the mast base (`player.y < mast.y`), the mast is drawn after the player, correctly occluding the player behind the timber.

---

## 6. Procedural Fallback Guarantee

The `AssetLoader` strictly adheres to the zero-breakage contract:
- If a PNG file is not yet dropped into `public/assets/`, `AssetLoader.drawAsset()` returns `false`.
- The renderer automatically executes high-fidelity procedural drawing in the exact palette and dimensions.
- Once an artist drops the corresponding PNG into `public/assets/...`, the game automatically swaps to the real texture on next load without code changes.

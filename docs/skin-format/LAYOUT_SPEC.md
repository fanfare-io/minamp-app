# Minamp Skin Layout Spec

The authoritative coordinate spec for every skin-rendered region across all
window modes. **This is the source of truth.** Both the Swift renderer
(the `SkinSystem` package inside the closed-source Minamp app repo) and
the Figma plugin's `componentDefs.ts` must match these numbers.

If you're updating the renderer or the plugin, update this doc *first*,
then propagate.

## Conventions

- All coordinates are **1× skin pixels** with **top-left origin**. To work
  in 2×, multiply everything by 2.
- "Component" = an editable sprite the designer touches. "Overlay" = how the
  app composites it onto the window at runtime.
- Where multiple components share a slot (e.g. `Mono Indicator` vs
  `Stereo Indicator`) only one is visible at runtime; the renderer picks
  which based on player state.
- Tile counts in playlist title/body/bottom depend on window width; the
  table below uses the default 275 px width.

---

## 1. Main Window — full mode (275 × 116)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Title Bar 0–14                                  [min ][shd ][close ] │ y=0–14
├──────────────────────────────────────────────────────────────────────┤
│ ▣  ┌─── Time Digits 36–99 ──┐  ┌── Visualizer 0–60 ──┐               │
│ pst│  - 0  0 : 0  0  : 0  0 │  │ wave / spectrum     │               │ y=18–60
│    └────────────────────────┘  └─────────────────────┘ ┌MO┐┌STER┐    │
│                                kbps khz                │NO││ EO │    │ y=41–53
│ ┌── Seek Bar 16–264 ─────────────────────────────────┐                │ y=72–82
│ │                            ▣ thumb                 │                │
│ └────────────────────────────────────────────────────┘                │
│ ┌vol track 107–175┐ ┌bal 177–215┐ ┌EQ┐┌PL┐                          │ y=57–69
│ │   ▣             │ │   ▣       │                                    │
│ └──────────────────┘ └──────────┘                                    │
│ ┌◀◀┐┌▶ ┐┌❚❚┐┌■ ┐┌▶▶┐┌⏏ ┐  ┌shuffle┐┌rep┐                            │ y=88–106
│ └──┘└──┘└──┘└──┘└──┘└──┘  └───────┘└───┘                            │
└──────────────────────────────────────────────────────────────────────┘
```

| Component | Position (x, y) | Size (w × h) | Notes |
|---|---|---|---|
| Main Background | 0, 0 | 275 × 116 | Base wallpaper sprite |
| Title Bar | 0, 0 | 275 × 14 | Active / Inactive variants |
| Minimize Button | 244, 3 | 9 × 9 | Normal / Pressed |
| Shade Button | 254, 3 | 9 × 9 | Normal / Pressed |
| Close Button | 264, 3 | 9 × 9 | Normal / Pressed |
| Play Status | 24, 28 | 9 × 9 | Playing / Paused / Stopped |
| Time Digits | 36, 26 | 99 × 13 | 11-cell sprite strip (`-`, `0`–`9`); renderer picks 5 cells per timestamp |
| **Mono Indicator** | **212, 41** | **27 × 12** | **Renders only when audio is mono** |
| **Stereo Indicator** | **239, 41** | **29 × 12** | **Renders only when audio is stereo. Side-by-side with Mono on the same row, but only one is visible at runtime.** |
| Volume Track | 107, 57 | 68 × 15 | BG / Fill — exporter interpolates 28 frames |
| Volume Thumb | 107, 57 | 14 × 11 | Renders on top of track at fill-level x |
| Balance Track | 177, 57 | 38 × 15 | BG / Fill — 28-frame interpolation. **Only 38 px wide, not 68.** |
| Balance Thumb | 189, 57 | 14 × 11 | Centered position when at neutral |
| EQ Toggle | 219, 58 | 23 × 12 | Off / On |
| PL Toggle | 242, 58 | 23 × 12 | Off / On |
| Seek Bar Track | 16, 72 | 248 × 10 | Single sprite, no interpolation |
| Seek Bar Thumb | 16, 72 | 29 × 10 | Normal / Pressed; positioned dynamically |
| Previous Button | 16, 88 | 23 × 18 | Normal / Pressed |
| Play Button | 39, 88 | 23 × 18 | Normal / Pressed |
| Pause Button | 62, 88 | 23 × 18 | Normal / Pressed |
| Stop Button | 85, 88 | 23 × 18 | Normal / Pressed |
| Next Button | 108, 88 | 22 × 18 | Normal / Pressed |
| Eject Button | 136, 89 | 22 × 16 | Normal / Pressed |
| Shuffle Toggle | 164, 89 | 47 × 15 | Off + Normal/Pressed × On + Normal/Pressed (4 variants) |
| Repeat Toggle | 210, 89 | 28 × 15 | Same 4-variant matrix |

**Dynamic / non-sprite layers** (renderer-owned, no skin component). All
positions verified against `MainWindowView.swift`, `VisualizerLayer.swift`,
`MarqueeLayer.swift`:

| Layer | Region | Notes |
|---|---|---|
| Visualizer | **24, 43, 76 × 16** | Spectrum analyzer / waveform; data-driven. Source: `VisualizerLayer.swift:10`. Much smaller than commonly assumed — it sits next to the time display, not across the full panel. |
| Marquee (track title) | **111, 27, 154 × 6** | Bitmap-font scrolling text. Source: `MarqueeLayer.swift:13`. Sits above the audio info displays in a thin 6-px-tall band. |
| Kbps display | 111, 43 — bitmap font | 3 chars, right-aligned |
| Khz display | 156, 43 — bitmap font | 2 chars, right-aligned |

> Designers cannot directly customize the dynamic layers. They use the
> **Bitmap Font** sprite sheet for their character glyphs and inherit the
> Main Background as the layer underneath. Reserve these regions visually
> in the Main Background — don't paint UI chrome that would compete.

---

## 2. Main Window — shade mode (275 × 14)

When the user clicks the shade button, the window collapses to title-bar
height. Everything below y=14 disappears and the bar gains a row of
embedded mini transport buttons + a mini visualizer + a mini seek bar.

```
┌────────────────────────────────────────────────────────────────────────┐
│ Title chrome    Mini-Time   Mini-Vis   ◀▶❚■▶⏏  Mini-Pos    [shd][close]│
└────────────────────────────────────────────────────────────────────────┘
```

| Component | Position (x, y) | Size (w × h) | Notes |
|---|---|---|---|
| Shade Background | 0, 0 | 275 × 14 | Focused / Unfocused variants |
| Shade Toggle | 254, 3 | 9 × 9 | Normal / Pressed |
| Close Button | 264, 3 | 9 × 9 | Reuses main close sprite |

**Hit-rect-only buttons** (no sprite — the click region overlays the
shade background, which the designer must paint to look "clickable" at
these positions):

| Button | Hit rect (x, y, w, h) |
|---|---|
| Previous | 169, 2, 7 × 10 |
| Play | 176, 2, 10 × 10 |
| Pause | 186, 2, 9 × 10 |
| Stop | 195, 2, 9 × 10 |
| Next | 204, 2, 10 × 10 |
| Eject | 215, 2, 10 × 10 |

**Dynamic layers** in shade mode:

| Layer | Region | Notes |
|---|---|---|
| Mini Time | 130, 4 — ~30 × 8 | 5-char bitmap font |
| Mini Visualizer | 79, 5 — 76 × 5 | Compressed spectrum |
| Mini Position BG | 226, 4 — 17 × 7 | Track sprite |
| Mini Position Thumb | 226+offset, 4 — 3 × 7 | Repositioned dynamically along the track |

> **Designer note:** the shade background is NOT a passive strip — it must
> be designed knowing the click regions exist. Paint suggestive button
> "wells" at the hit-rect positions or users won't know the controls
> exist.

---

## 3. EQ Window — full mode (275 × 116)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Title Bar 0–14                                  [shd][close]           │ y=0–14
├────────────────────────────────────────────────────────────────────────┤
│ ┌ON┐ ┌AUTO┐    ┌─── Graph 86–199 ────────────┐    ┌── PRESETS ────┐  │ y=18–30
│ └──┘ └────┘    └──────────────────────────────┘    └───────────────┘  │
│ ─── 8 px gap ─────────────────────────────────────────────────────── │
│  PRE   60  170 310 600  1k   3k   6k  12k  14k  16k                   │ y=38–101
│  ░      ░   ░   ░   ░   ░    ░    ░    ░    ░    ░   ← tracks 38–101 │
│  ▣      ▣   ▣   ▣   ▣   ▣    ▣    ▣    ▣    ▣    ▣   ← thumbs y=64   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

| Component | Position (x, y) | Size (w × h) | Notes |
|---|---|---|---|
| EQ Background | 0, 0 | 275 × 116 | Base panel |
| EQ Title Bar | 0, 0 | 275 × 14 | Active / Inactive |
| EQ Shade Button | 254, 3 | 9 × 9 | (single component, no Pressed variant) |
| EQ Close Button | 264, 3 | 9 × 9 | Normal / Pressed |
| EQ ON Toggle | 14, 18 | 26 × 12 | Off + Normal/Pressed × On + Normal/Pressed |
| EQ AUTO Toggle | 40, 18 | 32 × 12 | Same 4-variant matrix |
| EQ PRESETS Button | 217, 18 | 44 × 12 | Normal / Pressed |
| EQ Graph BG | 86, 17 | 113 × 19 | Recessed scope-screen surface |
| EQ Slider Track | (see below), **38** | 15 × **63** | Vertical channel authored as one ComponentSet with `Part=BG` (empty track) + `Part=Fill` (fully-lit track). The exporter interpolates 28 intermediate frames **linearly**: frame 0 = empty, frame 27 = full (same semantics as the horizontal Volume/Balance sliders). **Track top is y=38**, height 63 → spans y=38..101. Source of truth: `SkinVerticalSlider.swift` constants. |
| EQ Slider Thumb | (see below), **64** | 11 × 11 | Normal / Pressed; **y=64 is the resting (0 dB) position** — middle of the track. Full thumb top y range is **38..90** (52 px travel). At max +12 dB the thumb sits at y=38 (top of track); at min −12 dB it sits at y=90 (8 px above the bottom). |

**EQ slider X positions** — both track and thumb share the same x:

| Band | x | Band | x | Band | x |
|---|---|---|---|---|---|
| Preamp | **21** | 1 (60 Hz) | **78** | 6 (3 kHz) | **168** |
| 2 (170) | **96** | 3 (310) | **114** | 7 (6k) | **186** |
| 4 (600) | **132** | 5 (1k) | **150** | 8 (12k) | **204** |
| 9 (14k) | **222** | 10 (16k) | **240** |  |  |

> Pattern: preamp at x=21 then 10 bands starting at x=78 with 18 px
> spacing. **Thumb x = track x + 2** — the 11-wide thumb is centered
> inside the 15-wide track at runtime (see
> `SkinVerticalSlider.swift:69`). For tidy alignment in the Figma
> preview, thumbs are placed with that +2 offset explicitly.

**Dynamic layers**:

| Layer | Region | Notes |
|---|---|---|
| Graph response curve | inside Graph BG (86, 17) — 113 × 19 | Drawn dynamically using `EQ Graph Colors` strip |
| Preamp reference line | inside Graph BG | Drawn using `EQ Preamp Line` 1-px strip |

---

## 4. EQ Window — shade mode (275 × 14)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Title chrome  ┌── vol track ──┐   ┌── bal track ──┐   [shd][close]    │
│               │    ▣          │   │    ▣          │                   │
└────────────────────────────────────────────────────────────────────────┘
```

| Component | Position (x, y) | Size (w × h) | Notes |
|---|---|---|---|
| EQ Shade BG | 0, 0 | 275 × 14 | Active / Inactive |
| EQ Shade Toggle (in-shade) | 254, 3 | 9 × 9 | **Normal state is transparent — the button well must be painted into `EQ Shade BG` at (254, 3)**. Pressed sprite lives on `EQ_EX.PNG` at (1, 47) as the `EQ Shade Mode Shade Pressed` component. |
| EQ Shade Close | 264, 3 | 9 × 9 | Normal / Pressed |
| Volume Track region | 61, 4 | 97 × 6 | **Transparent** — no track sprite; the shade BG must show the channel |
| EQ Shade Vol Thumb | 61+offset, 4 | 18 × 14 | Single component; positioned dynamically |
| Balance Track region | 164, 4 | 43 × 6 | **Transparent** — same as volume |
| EQ Shade Bal Thumb | 164+offset, 4 | 18 × 14 | Single component; positioned dynamically |

> **Designer note:** Like the main shade, the EQ shade background must
> paint visible channels at the volume and balance regions or the
> thumbs will appear to float in nothing.

---

## 5. Playlist Window — variable size (default 275 × 232)

The playlist window resizes. Components fall into three groups:

- **Title bar** (top 20 px): `Left Corner` (fixed 25 px) + `Text` (centered 100 px) + `Fill Tile` (25 px, repeated to fill remaining width) + `Right Corner` (fixed 25 px). Active / Inactive variants for all four.
- **Body** (middle, height = `windowHeight − 20 − 38`): `Left Border` (12 px wide, 29 px tall, vertically tiled) + the track-list area + `Right Border` (20 px wide, 29 px tall, vertically tiled). The right border contains the recessed scroll channel; the **Scroll Handle** (8 × 18, Normal / Active) renders inside it at x = `windowWidth − 8`, y = dynamic.
- **Bottom bar** (bottom 38 px): `Bottom Left` (125 px) + `Bottom Fill` tiles (25 px, repeated) + `Bottom Right` (150 px).

Default 275 × 232 layout (174 px body height = 6 left/right border tiles):

```
┌────────────────────────────────────────────────────────────────┐
│LCorner (0–25)│ Title Text (centered) │ Fill Fill Fill │RCorner│ 0–20
├──────────────┼───────────────────────────────────────┼────────┤
│ Left         │                                       │ Right  │
│ Border       │     Track list area (clipped)         │ Border │ 20–194
│ ×6 tiles     │                                       │ +scroll│
│              │                                       │ handle │
├──────────────┴───────────────────────────────────────┴────────┤
│ Bottom Left (125 px)  │ Fill … │ Bottom Right (150 px)        │ 194–232
└────────────────────────────────────────────────────────────────┘
```

| Component | Position | Size (w × h) | Tile / Fixed | Variants |
|---|---|---|---|---|
| PL Title Left Corner | 0, 0 | 25 × 20 | fixed | Active / Inactive |
| PL Title Text | (w−100)/2, 0 | 100 × 20 | fixed (centered) | Active / Inactive |
| PL Title Fill | repeating | 25 × 20 | tile | Active / Inactive |
| PL Title Right Corner | w−25, 0 | 25 × 20 | fixed | Active / Inactive |
| PL Left Border | 0, 20+i·29 | 12 × 29 | vertical tile | Single |
| PL Right Border | w−20, 20+i·29 | 20 × 29 | vertical tile | Single |
| PL Scroll Handle | **w−14, 22+offset** | 8 × 18 | dynamic Y | Normal / Active. The handle sits inside the right-border area (20 px wide), 6 px from its left edge → x = w−20+6 = w−14. Default Y = titleBarHeight+2 = 22. |
| PL Bottom Left | 0, h−38 | 125 × 38 | fixed | Single |
| PL Bottom Fill | 125+i·25, h−38 | 25 × 38 | tile | Single |
| PL Bottom Right | w−150, h−38 | 150 × 38 | fixed | Single |
| PL Close Pressed | 264, 3 (over Right Corner) | 9 × 9 | overlay | Pressed-only sprite. The **unpressed** visual is painted as part of `PL Title Right Corner` — the plugin stamps a guide rectangle at corner-local x=14 / y=3 so the designer can see where the well goes. |
| PL Shade Pressed | 254, 3 (over Right Corner) | 9 × 9 | overlay | Pressed-only sprite. Unpressed visual lives in `PL Title Right Corner` at corner-local x=4 / y=3 (also guide-stamped). |

**Title bar fill count**: at width `w`, the fill tiles fill the gap between
`Left Corner + Text` (25 + 100) and `Right Corner` (25), so
`fillTileCount = ceil((w − 25 − 100 − 25) / 25)`. Default 275 → 5 tiles.

> **Designer note: title fill must be horizontally seamless.** Any
> gradient, shading, or texture in the fill tile that doesn't repeat
> cleanly will cause visible seams every 25 px. Either use a solid color,
> a vertical-only gradient (top-to-bottom), or a pattern whose left edge
> matches its right edge.

**Dynamic text overlays** in bottom-right corner (rendered via Bitmap Font):

| Display | Offset from Bottom Right corner top-left | Notes |
|---|---|---|
| Running time | +7, +10 | Current play position |
| Mini time | +66, +23 | Total playlist time |

### 5b. Playlist Window — shade mode (variable width × 14)

In shade mode the playlist collapses to a single 14-px-tall bar. Source:
`PlaylistWindowView.swift:351–406`. The shade chrome reuses three sprites:

| Component | Position | Size (w × h) | Notes |
|---|---|---|---|
| PL Shade Left | 0, 0 | 25 × 14 | Active / Inactive — fixed left corner |
| PL Shade Right | w−50, 0 | 50 × 14 | Active / Inactive — fixed right corner. Hosts Close + Shade buttons inside it. |
| PL Shade Fill (= PL Shade Left Inactive sprite) | 25..(w−50), repeating | 25 × 14 | Tile fill. **Reuses the inactive sprite as a flat tile** — there's no dedicated fill component, so the inactive variant of `PL Shade Left` must be designed as a horizontally-seamless 25-px tile. |

**Dynamic text overlays in shade mode:**

| Display | Position | Notes |
|---|---|---|
| Track title | 5, 4 | Bitmap font, max chars = `(w − 100) / 5` |
| Duration | w−80, 4 | Bitmap font, 6 chars, right-aligned |

> **Designer gotcha:** The `PL Shade Left Inactive` sprite serves double duty —
> it's both the inactive corner AND the fill tile across the bar. Design it so
> the right edge connects seamlessly to the left edge when tiled.

---

## Overlay guides

Backgrounds — `Main Background`, `Shade Background`, `EQ Background`,
`EQ Shade BG`, the title bars, and the playlist corners — are normally
blank rectangles in Figma. That leaves the designer to guess where the
renderer will composite transport buttons, indicators, text, and slider
tracks on top.

To prevent that, the Figma plugin stamps a locked **Overlay Guides**
group inside every background component when the component template is
generated. Each guide is a labeled, semi-transparent rectangle showing
one overlay region. The guide table is in
`figma-skin-plugin/src/shared/componentDefs.ts` under
`OVERLAY_GUIDES`.

Rules:

- Coordinates in `OVERLAY_GUIDES` are in 1× skin pixels, relative to the
  background's own top-left (so corner components use corner-local, not
  window-global, coordinates).
- The `Overlay Guides` group is locked; the exporter hides it before
  `exportAsync` so the guides never end up in the `.msz`.
- If you change a layout number here, update `OVERLAY_GUIDES` too, then
  re-run **Generate Component Template** so the stamps match reality.
- The validator warns when a background that should have guides is
  missing the group — that's the signal that the template needs
  regenerating.

## Slider frame semantics

Volume / Balance / EQ sliders are authored as a single ComponentSet per
slider with two variants:

- `Part=BG` — the empty track, as the user sees it at minimum value.
- `Part=Fill` — the fully lit track, as the user sees it at maximum value.

At export time the plugin generates 28 intermediate frames by compositing
`Part=Fill` over `Part=BG` with a progressive clip that grows with frame
index:

- Horizontal (Volume, Balance): left-to-right. Frame 0 = empty, frame 27 = full.
- Vertical (EQ): bottom-to-top. Frame 0 = empty, frame 27 = full.

This is a linear, non-inverted mapping for both orientations — the
earlier "vertical fill inverts because max boost should look energetic"
rule is gone. Designers can reason about the sliders uniformly.

## Debug dump

The Export panel has a "Dump debug PNGs" checkbox. When enabled, each
export also downloads `<skin>.debug.zip` alongside the `.msz`,
containing:

- `sheets/` — the assembled sprite sheets the app will actually read.
- `per_variant/` — each Figma component/variant as raw PNG bytes.
- `slider_frames/<slider>/frame_NN.png` — all 28 interpolated frames per slider.
- `manifest.json` — scale, counts, timestamp.

Use this when a sheet looks wrong in the app but the Figma preview looks
right: compare the raw variant PNG to the matching rect in the sheet to
see where the pixels are being dropped.

---

## Discrepancies between this spec and `componentDefs.ts`

All items in this section have been **resolved** as of the spec revision
that audited every coordinate against the actual `*View.swift` code.
Kept here as a changelog so you can see what was wrong before.

### Resolved coordinate errors

| # | Element | Old (wrong) | Corrected |
|---|---|---|---|
| 1 | EQ slider track X (preamp + 10 bands) | `[19, 76, 94, 112, 130, 148, 166, 184, 202, 220, 238]` | `[21, 78, 96, 114, 132, 150, 168, 186, 204, 222, 240]` |
| 2 | EQ slider track Y | y=18 | **y=38** |
| 3 | EQ slider track height | 65 | **63** |
| 4 | EQ slider thumb default Y | y=38 (then mistakenly y=41) | **y=64** (true 0 dB resting) |
| 5 | EQ slider thumb Y range | 15..67 (fabricated) | **38..90** |
| 6 | Balance track width | 68 | **38** (only 38 px is rendered) |
| 7 | Visualizer position | (0, 18, 275×42) | **(24, 43, 76×16)** |
| 8 | Marquee position | (20, 40, 210×14) | **(111, 27, 154×6)** |
| 9 | Playlist Scroll Handle X | `w−8` | **`w−14`** |
| 10 | Playlist Shade Mode | section absent | added (§5b) |

### Resolved design errors (also fixed in the Figma file directly)

- EQ Background's decorative slider panel was at the wrong y range; now sits behind the actual sliders.
- Title bars had 3 fake LED dots near the real Close/Min/Shade buttons; removed.
- EQ Background had duplicate POWER/AUTO/PRESETS labels next to the actual buttons; replaced with subtle backdrop wells under each button.
- Main Shade Background had no visible wells under the embedded transport hit-rects; now painted.
- EQ Shade Background had no visible volume/balance channels; now painted.
- Playlist Title Fill had a gradient that seamed when tiled; rebuilt as a vertical-only-gradient + full-width brush streaks.
- EQ Window Preview rendered slider tracks ON TOP of buttons due to declaration order in `componentDefs.ts`; reordered so buttons + graph render above tracks.

### Gotchas

- **Component placement order = render order in Figma**: `componentDefs.ts` `placements: []` arrays must be declared bottom-up (background first, overlays last).
- **A 1px discrepancy between component dimension and renderer rect is normal**: e.g. Volume sprite is 68×15 per the renderer's sprite extractor but the slider rect is 68×14 per the main-window view. The sprite size wins for component dimensions.

## Update checklist

When changing any rendered region:

- [ ] Update this spec doc first.
- [ ] Coordinate with the Minamp maintainer to update the corresponding
      `*View.swift` rendering code in the closed-source `SkinSystem`
      Swift package.
- [ ] Update `componentDefs.ts` in the Figma plugin (both component
      `width`/`height` and any preview `placements`).
- [ ] Re-run `Generate Components` in the plugin to regenerate
      the empty placeholders — expect to lose artwork in any component
      whose dimensions changed.

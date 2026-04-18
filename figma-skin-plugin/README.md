# Minamp Skin Designer — Figma Plugin

A Figma plugin for creating Minamp HD skins (`.msz` format).

## Features

- **Generate Template** — creates all 17 sprite sheet frames with labeled guide layers
- **Validate** — checks that all frames exist with correct names and dimensions
- **Export .msz** — exports all frames at 2x resolution, bundles with config files, downloads a ready-to-load `.msz` archive
- **Preview** — composites sprites into an assembled main window preview
- **Config editors** — visual editors for VISCOLOR.TXT (visualizer colors) and PLEDIT.TXT (playlist colors)

## Setup

### Install dependencies

```bash
cd figma-skin-plugin
npm install
```

### Build

```bash
npm run build     # one-shot build
npm run watch     # watch mode for development
```

### Load in Figma

1. Open Figma desktop app
2. Go to **Plugins → Development → Import plugin from manifest...**
3. Select `figma-skin-plugin/manifest.json`
4. The plugin appears under **Plugins → Development → Minamp Skin Designer**

## Workflow

### 1. Generate template

Run **Plugins → Minamp Skin Designer → Generate Template** on an empty page. This creates 17 frames — one per sprite sheet — each with:

- **Guides** (locked group) — labeled rectangles showing every sprite region
- **Artwork** (unlocked group) — where you paint your skin

### 2. Design your skin

Paint your skin artwork in the "Artwork" group of each frame. The guide layer shows you exactly where each button, slider, indicator, and display region needs to go.

Key sprite sheets to focus on:
- `MAIN` — the full window background (275×116)
- `TITLEBAR` — title bars and window buttons
- `CBUTTONS` — transport controls (play, pause, stop, etc.)
- `VOLUME` — 28 volume fill level frames + thumb
- `NUMBERS` — time display digits
- `TEXT` — bitmap font for the scrolling marquee

### 3. Validate

Run **Validate Skin** to check that all required frames are present with correct dimensions. Fix any errors before exporting.

### 4. Configure colors

Open the **Config** tab to set:
- **VISCOLOR** — 24 colors for the spectrum analyzer / oscilloscope
- **PLEDIT** — playlist text colors and font

### 5. Preview

Use the **Preview** tab to see how your main window will look when fully assembled with all sprites composited in their final positions.

### 6. Export

Click **Export .msz** to download your finished skin. The plugin:
1. Hides guide layers
2. Exports each frame as PNG at 2x resolution
3. Bundles with `skin.json`, `VISCOLOR.TXT`, and `PLEDIT.TXT`
4. Downloads as a `.msz` file ready to load in Minamp

## Frame Reference

All frames are at 1x pixel dimensions (the plugin exports at 2x):

| Frame | Size | Contents |
|-------|------|----------|
| MAIN | 275×116 | Main window background |
| TITLEBAR | 302×56 | Title bars, window buttons, shade mode |
| CBUTTONS | 136×36 | Transport buttons × 2 states |
| VOLUME | 68×433 | 28 volume frames + 2 thumbs |
| BALANCE | 68×433 | Balance slider (optional) |
| POSBAR | 307×10 | Seek bar + 2 thumbs |
| SHUFREP | 92×85 | Shuffle/repeat/EQ/PL toggles |
| PLAYPAUS | 42×9 | Play/pause/stop indicators |
| MONOSTER | 56×24 | Mono/stereo indicators |
| NUMBERS | 99×13 | Time digits 0-9 + minus |
| NUMS_EX | 99×13 | Extended digits (optional) |
| TEXT | 155×18 | Bitmap font (31×3 grid of 5×6 chars) |
| EQMAIN | 275×315 | EQ window: background, buttons, sliders, graph |
| EQ_EX | 275×56 | EQ shade mode (optional) |
| PLEDIT | 276×110 | Playlist: title bars, borders, scrollbar |
| GEN | 275×116 | Reserved (optional) |
| GENEX | 275×116 | Reserved (optional) |

See [`SKIN_FORMAT.md`](../docs/skin-format/SKIN_FORMAT.md) and [`LAYOUT_SPEC.md`](../docs/skin-format/LAYOUT_SPEC.md) for the complete region coordinate reference, and [`docs/figma-plugin/README.md`](../docs/figma-plugin/README.md) for the end-to-end plugin workflow.

# Minamp Skin Designer — Figma Plugin

A Figma plugin for creating Minamp HD skins (`.msz` format) without
hand-painting sprite sheets. You author each UI element as a labeled
Figma component; the plugin assembles the sprite atlases and ships you
a ready-to-load `.msz`.

## Install

The plugin will be published to the Figma Community. Until then, install
locally:

1. `npm install` and `npm run build` from this directory.
2. Open the Figma desktop app.
3. **Plugins → Development → Import plugin from manifest…** → select
   `manifest.json` in this directory.
4. The plugin appears under **Plugins → Development → Minamp Skin
   Designer**.

## Workflow

The plugin runs in **component mode**: each skin element is a Figma
ComponentSet (e.g. `Play Button` has `State=Normal` and `State=Pressed`
variants). Authoring components instead of pre-baked sprite sheets means
you never have to think about pixel-perfect atlas placement — the plugin
packs the atlases for you at export time.

**Create** runs first — it sets up the page. After that, **Assets** and
**Config** are standalone and can be used at any time; **Export** needs
the components from Create to already exist. The numbered steps below
describe a typical authoring flow.

### 1. Generate components

Open the plugin and click **Generate Components** on the **Create** tab.
This stamps the full set of empty ComponentSets onto the current page,
each at its real authored size with locked **Overlay Guides** showing
where overlays land at runtime.

### 2. Design

Paint inside each component variant. The guide rectangles in background
components (Main Background, EQ Background, etc.) show you exactly where
transport buttons, sliders, indicators, and dynamic text will be
composited on top of your background art — so you can avoid painting
chrome in slots that will get overlaid anyway.

The **Assets** tab is useful here for dropping photographic textures or
reference images directly into Figma.

### 3. Validate & export

The **Export** tab runs validation (every required component present,
correct dimensions, no missing variants) and then writes the `.msz`.
Internally the exporter:

1. Renders every component variant to PNG at the configured asset scale
   (2× by default).
2. Interpolates 28 slider frames between the `Part=BG` and `Part=Fill`
   variants for Volume, Balance, and EQ Slider Track.
3. Composites every variant into the right position in its sprite atlas.
4. Bundles atlases + `skin.json` + `VISCOLOR.TXT` + `PLEDIT.TXT` into
   the `.msz` archive.

The result is a single `.msz` file that drops straight into Minamp.

### 4. Configure colors and playlist styling

Open the **Config** tab to set:

- **VISCOLOR** — 24 colors driving the spectrum analyzer / oscilloscope.
- **PLEDIT** — playlist text colors and font.

These ship inside the `.msz` archive alongside the sprite atlases.

## Frame Reference

Atlas dimensions are at 1× pixel coordinates (the plugin exports at 2×
or 3× depending on your asset scale):

| Atlas | Size | Contents |
|-------|------|----------|
| MAIN.PNG | 275×116 | Main window background |
| TITLEBAR.PNG | 302×56 | Title bars, window buttons, shade mode |
| CBUTTONS.PNG | 136×36 | Transport buttons × 2 states |
| VOLUME.PNG | 68×433 | 28 volume frames + 2 thumbs |
| BALANCE.PNG | 68×433 | 28 balance frames (read from x=9, w=38) + 2 thumbs |
| POSBAR.PNG | 307×10 | Seek bar + 2 thumbs |
| SHUFREP.PNG | 92×85 | Shuffle/repeat/EQ/PL toggles, all 4 states |
| PLAYPAUS.PNG | 42×9 | Play/pause/stop indicators |
| MONOSTER.PNG | 56×24 | Mono/stereo indicators |
| NUMBERS.PNG | 99×13 | Time digits 0–9 + two 5×1 minus dashes |
| NUMS_EX.PNG | 99×13 | Reserved HD digit atlas (currently unread) |
| TEXT.PNG | 155×18 | Bitmap font (31×3 grid of 5×6 chars) |
| EQMAIN.PNG | 275×315 | EQ window: background, buttons, sliders, graph |
| EQ_EX.PNG | 275×56 | EQ shade mode sprites |
| PLEDIT.PNG | 276×110 | Playlist: title bars, borders, scrollbar |
| GEN.PNG | 275×116 | Reserved (currently unread) |
| GENEX.PNG | 275×116 | Reserved HD variant (currently unread) |

The pixel-exact regions inside each atlas are documented in the
[Layout Spec](https://github.com/fanfare-io/minamp-app/blob/main/docs/skin-format/LAYOUT_SPEC.md).
The end-to-end plugin walk-through with screenshots is in the
[Figma plugin guide](https://github.com/fanfare-io/minamp-app/blob/main/docs/figma-plugin/README.md).

## Development

```bash
npm install        # one-time
npm run typecheck  # TypeScript checks
npm run build      # one-shot build to dist/
npm run watch      # rebuild on save
```

The plugin has two threads:

- **Sandbox** (`src/plugin/`) — runs in Figma's QuickJS sandbox, has
  access to the `figma.*` API but no DOM. Bundled to `dist/plugin.js`.
- **UI** (`src/ui/`) — React iframe with DOM access, used for the
  `.msz` packaging (JSZip), config editors, and validation UI. Bundled
  inline into `dist/ui.html`.

Reload the plugin in Figma after each rebuild (the watch mode keeps the
output up to date, but Figma caches the script).

## Bugs and feature requests

Open an issue at
[github.com/fanfare-io/minamp-app](https://github.com/fanfare-io/minamp-app/issues).
Use the **Skin / plugin bug** template for plugin-specific issues; attach
the `.msz` file and a screen recording where possible.

## License

MIT — see [LICENSE](https://github.com/fanfare-io/minamp-app/blob/main/LICENSE).

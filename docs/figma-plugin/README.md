# Minamp Skin Designer — Figma plugin

Figma plugin that turns a structured Figma file into a Minamp `.msz` skin
archive. Source lives at [`figma-skin-plugin/`](../../figma-skin-plugin/);
this doc explains what the plugin is for and how to drive it end-to-end.

---

## Intent

Designing a Winamp-compatible skin by hand means painting onto fixed
sprite sheets (`MAIN.PNG`, `TITLEBAR.PNG`, `EQMAIN.PNG`, …) at exact
pixel offsets. Every 9 × 9 close button, every 15 × 63 EQ slider track,
every 28-frame volume progression has to land in the right cell or the
renderer won't find it. That's fiddly, error-prone, and doesn't use
anything Figma is actually good at.

This plugin inverts the workflow:

- Each skin element is a **named Figma component** (e.g. `Close Button`,
  `EQ Slider Track`, `Main Background`) with the right dimensions and
  the right **variants** (`State=Normal/Pressed`, `Active=Off/On`,
  `Part=BG/Fill`, …) already in place.
- The designer paints inside those components using normal Figma tools
  (vectors, gradients, images, fonts — anything Figma can rasterize).
- On export the plugin reads each component, composites them into the
  exact sprite sheets the renderer expects, and packages everything as
  a `.msz`.

The source of truth for every coordinate is
[`LAYOUT_SPEC.md`](../skin-format/LAYOUT_SPEC.md); the plugin's
[`componentDefs.ts`](../../figma-skin-plugin/src/shared/componentDefs.ts)
is the machine-readable mirror of that spec.

---

## What's in the package

A Minamp skin archive (`.msz`) is a ZIP containing:

- The sprite-sheet PNGs (`MAIN.PNG`, `TITLEBAR.PNG`, `EQMAIN.PNG`,
  `EQ_EX.PNG`, `CBUTTONS.PNG`, `SHUFREP.PNG`, `POSBAR.PNG`, `VOLUME.PNG`,
  `BALANCE.PNG`, `PLAYPAUS.PNG`, `MONOSTER.PNG`, `NUMBERS.PNG`, `TEXT.PNG`,
  `PLEDIT.PNG`).
- `VISCOLOR.TXT` — the 24 visualizer palette colors.
- `PLEDIT.TXT` — the playlist theme colors.
- `skin.json` — manifest with `formatVersion` and `assetScale`
  (2× or 3× for HD skins; classic 1× `.wsz` are loaded via a separate
  parser).

See [`SKIN_FORMAT.md`](../skin-format/SKIN_FORMAT.md) for the full sheet layout
and [`LAYOUT_SPEC.md`](../skin-format/LAYOUT_SPEC.md) for every element coordinate.

---

## How the plugin is organised

```
figma-skin-plugin/
├── manifest.json                    # Figma plugin manifest
├── package.json                     # build scripts (typecheck, build)
├── esbuild.config.mjs               # bundler
└── src/
    ├── shared/                      # plain TS, shared by sandbox + UI
    │   ├── componentDefs.ts         # all ~60 components + OVERLAY_GUIDES + PREVIEW_FRAMES
    │   ├── messages.ts              # postMessage payload types
    │   ├── spriteSheetDefs.ts       # (legacy sprite-sheet mode) sheet regions
    │   └── constants.ts             # DEFAULT_ASSET_SCALE, group names
    │
    ├── plugin/                      # Figma sandbox thread (no DOM / no fetch)
    │   ├── main.ts                  # message dispatcher
    │   ├── templateGenerator.ts     # creates components + previews + guides
    │   ├── componentExporter.ts     # walks COMPONENT_DEFS, exports each variant
    │   └── validator.ts             # dimension + variant + guide presence checks
    │
    └── ui/                          # React iframe (has Canvas API)
        ├── App.tsx                  # accumulates sandbox messages, drives assembly
        ├── panels/
        │   ├── CreatePanel.tsx      # Generate Components, Import Skin
        │   ├── ExportPanel.tsx      # Validate, Export, Debug Dump checkbox
        │   ├── ConfigPanel.tsx      # VISCOLOR / PLEDIT editors
        │   └── AssetsPanel.tsx      # imported image library
        ├── export/
        │   ├── sheetAssembler.ts    # canvas-composites variants into sheet PNGs
        │   ├── sliderGenerator.ts   # BG + Fill → 28 interpolated frames
        │   ├── archiver.ts          # zips sheets + configs → .msz
        │   ├── debugDump.ts         # optional sibling .debug.zip
        │   └── configFiles.ts       # VISCOLOR.TXT / PLEDIT.TXT generators
        └── import/
            └── importer.ts          # unpacks a .wsz / .msz into frames
```

Two-process model: everything that touches the Figma document runs in
the sandbox; everything that needs Canvas / Blob / download runs in the
UI iframe. They communicate via `postMessage` with the typed payloads
in `shared/messages.ts`.

---

## Installation

1. `cd figma-skin-plugin && npm install`.
2. `npm run build` — produces `dist/plugin.js`, `dist/ui.js`,
   `dist/ui.html`.
3. In the Figma desktop app: **Plugins → Development → Import plugin
   from manifest** → choose
   `figma-skin-plugin/manifest.json`.
4. Open a new or existing Figma file, then **Plugins → Development →
   Minamp Skin Designer**.

For an edit / reload loop: `npm run watch` rebuilds on save; in Figma
use **Plugins → Development → Hot Reload Plugin** (or re-run the
plugin).

---

## Major operations

Each tab in the plugin corresponds to one phase of the workflow.

### 1. Generate the component template (**Create** tab)

Bootstraps a blank Figma file into something paintable.

1. Open a fresh page (or one you're OK wiping).
2. Select the asset scale:
   - **2×** — the default for HD skins, 550 px × 232 px main window.
   - **3×** — for 4K displays.
   - (1× is classic-`.wsz` territory and uses a different template.)
3. Click **Generate Components**.

The plugin builds three things on the page:

- **~60 Figma ComponentSets and Components** organised into section
  frames (`Main Window`, `Shade Mode`, `EQ Window`, `EQ Shade`,
  `Playlist`). Each has the right dimensions and variant axes.
  Background components (`Main Background`, `EQ Background`,
  `Title Bar`, `EQ Shade BG`, `PL Title Right Corner`, …) carry a
  locked `Overlay Guides` group of labeled, semi-transparent rectangles
  showing *where the renderer will composite other sprites on top*.
- **Live preview frames** — `Main Window Preview`, `EQ Window Preview`,
  `Playlist Preview`. Each is an assemblage of instances of the above
  components at the exact runtime positions. As you paint the
  components, the previews update live so you always see what the skin
  will look like.
- **Sheet coordinates** stored as plugin data on the page so the
  validator and exporter know which scale to use.

> ⚠️ **Destructive.** Re-running "Generate Components" deletes every
> existing component / section frame / preview frame by name and
> rebuilds empty placeholders. Use it once at the start of a project,
> or after pulling updates to `componentDefs.ts` — not as part of your
> normal edit loop.

### 2. Paint the components

Open any component, paint inside its bounds. A few rules:

- **Don't resize the component.** Dimensions are contractual.
- **Use every variant.** If a ComponentSet has `State=Normal` and
  `State=Pressed`, paint both. The validator (and the exporter) will
  reject a set with missing variants.
- **Follow the Overlay Guides.** The locked guide rectangles on
  background components show where transport buttons, indicators, text,
  and sliders will land at runtime. Designer intent matters: *under* a
  button guide the art will be covered at runtime, so save detail for
  the un-guided areas. The colon slot in the time display (x=69..78 on
  Main Background) has no guide specifically because the designer is
  expected to paint the colon there.
- **Sliders are authored as ComponentSets with `Part=BG` + `Part=Fill`.**
  BG is the empty track at minimum value; Fill is the fully-lit track at
  maximum value. The exporter interpolates 28 intermediate frames
  linearly (frame 0 = empty, frame 27 = full) for both horizontal and
  vertical sliders.
- **Pressed-only sprites are just pressed.** `PL Close Pressed`,
  `PL Shade Pressed`, `EQ Full Shade Pressed`, `EQ Shade Mode Shade
  Pressed` each have `variants: []` — there is no normal state. The
  normal visual is painted into the adjacent background component
  (`PL Title Right Corner`, `EQ Shade BG`, etc.). This mirrors classic
  Winamp skin semantics.

### 3. Validate (**Export** tab → Validate)

Runs a set of cheap static checks:

- Each required component / ComponentSet exists on the page.
- Variant axes match `componentDefs.ts` (missing variants fail, extras
  are ignored).
- Dimensions match the expected scaled size.
- Every background listed in `OVERLAY_GUIDES` still has its `Overlay
  Guides` group (if not, the template is out of date).

Pass / Warn / Fail is colour-coded. By default only problems are shown;
click "Show all" to see the full list. **Fix failures before
exporting** — the exporter will stop on a missing required component.

### 4. Export (**Export** tab → Export .msz)

1. Name the skin.
2. Optionally tick **Dump debug PNGs** (see below).
3. Click **Export .msz**.

What happens under the hood:

1. Sandbox iterates every entry in `COMPONENT_DEFS`:
   - **Regular components** (buttons, indicators, toggles, …): each
     variant is exported via `exportAsync({ format: "PNG", constraint:
     { type: "SCALE", value: 1 } })`. Any `Overlay Guides` group
     descendant is temporarily hidden before export and restored after.
   - **Slider components** (`sliderMode: "auto"`): `Part=BG` and
     `Part=Fill` are exported separately.
2. Per-variant PNG bytes are posted to the UI iframe.
3. Once every variant has arrived, the UI:
   1. Generates 28-frame slider sprites from each `BG/Fill` pair via
      `sliderGenerator.ts` (Canvas 2D clip compositing).
   2. Composites every variant + slider frame onto its target sheet
      canvas at the `placement.x * scale`, `placement.y * scale`
      coordinates in `componentDefs.ts`.
   3. Zips all assembled sheets + `VISCOLOR.TXT` + `PLEDIT.TXT` +
      `skin.json` into `<skinName>.msz` and triggers a browser download.

The progress bar walks through
"Exporting X / Y" → "Generating slider frames" → "Compositing sprite
sheets" → "Building .msz".

### 5. Debug dump (optional, **Export** tab)

Tick **Dump debug PNGs** before clicking Export to also download a
sibling `<skinName>.debug.zip` with:

- `sheets/…` — every assembled sprite sheet (same bytes as the ones
  packed into the `.msz`).
- `per_variant/ComponentName__State=Value.png` — the raw per-variant
  PNG before any compositing.
- `slider_frames/<slider>/frame_NN.png` — all 28 interpolated frames
  per slider.
- `manifest.json` — scale, counts, timestamp.

Use this whenever the exported skin looks wrong in Minamp but the Figma
preview looks right: compare the raw variant PNG to the matching rect
on the assembled sheet to figure out where pixels are being dropped.
It's also handy for regression triage without having to re-run the
whole export pipeline in Minamp.

### 6. Edit the configs (**Config** tab)

`VISCOLOR.TXT` (24 RGB colors used by the visualizer palette) and
`PLEDIT.TXT` (playlist background / highlight / text colors) are edited
with colour pickers and go straight into the `.msz`. The defaults
mirror classic Winamp's palette.

### 7. Asset library (**Assets** tab)

Named image imports for reuse across components (e.g. a photo
background or a shared texture). Each entry is tracked in the page's
`assetManifest` plugin data plus an `asset:<name>` key so scripts and
the Figma MCP can fetch a single image hash by name.

### 8. Importing an existing skin (**Create** tab → Import Skin)

Pick a `.wsz` or `.msz` file. The plugin unpacks it, generates an empty
template at the target scale, and places each sprite sheet PNG as an
image fill in the matching frame's `Artwork` group. Useful as a
starting point ("show me what Artemis looks like; I'll tweak the
buttons").

---

## Scale model

Everything in `componentDefs.ts`, `LAYOUT_SPEC.md`, and the sheet
placement math is expressed in **1× skin pixels** (the classic Winamp
coordinate space). The asset scale multiplies both component sizes
and placement offsets:

- A `9 × 9` button at `x=18` in the spec becomes an `18 × 18` component
  placed at `x=36` on the assembled 2× sheet.
- The exporter pulls PNGs at `SCALE: 1` (i.e. whatever size the Figma
  component actually is), then `drawImage`s them at `placement.x *
  scale`. Because the component was sized at `def.width * scale` when
  the template was generated, everything lines up without further
  rescaling.
- Minamp's `MSZParser` reads `skin.json.assetScale` and tells the
  `SpriteExtractor` which multiplier to use when cropping sprites at
  runtime.

Changing scale means regenerating the template — a 2× file can't be
used to export a 3× skin.

---

## How to make a change that affects layout

A change to any pixel coordinate ripples through three places. In
order:

1. **[`LAYOUT_SPEC.md`](../skin-format/LAYOUT_SPEC.md)** — the prose
   source of truth. Update the table for the affected window, note why.
2. **[`componentDefs.ts`](../../figma-skin-plugin/src/shared/componentDefs.ts)** —
   update the component's `width` / `height`, `target.placements`, any
   `OVERLAY_GUIDES` entry, and any `PREVIEW_FRAMES` placement that
   references it.
3. **Swift renderer** (in the closed-source Minamp app repo) — the
   maintainer updates the matching `CGRect` / sprite map entry in the
   `SkinSystem` package so the renderer reads the new coordinates. Flag
   coordinate changes in your PR description so the renderer can land
   in lockstep.

Then re-run `Generate Components` in the plugin (you'll lose any art
you had drawn in a component whose dimensions changed — that's the
trade) and validate.

---

## Development

```
cd figma-skin-plugin
npm run typecheck          # tsc --noEmit
npm run build              # esbuild, outputs dist/*
npm run watch              # rebuild on save
```

The sandbox is a legacy ES5-ish JavaScript runtime with no modern
browser APIs. Keep `src/plugin/` lean (the TypeScript compiles to an ES
target that Figma accepts), and put anything that needs `Canvas`,
`Blob`, `URL.createObjectURL`, `document`, etc. in `src/ui/`.

The renderer itself (Swift / AppKit) lives in the closed-source Minamp
app repo. Changes there are made by the Minamp maintainers; layout
coordinate changes should travel together with the matching PR in this
repo.

---

## Known gotchas

- **"Generate Components" is destructive.** It wipes everything by
  name. Before clicking, commit / duplicate / export anything you care
  about. This is deliberate — it's a one-shot bootstrap, not a merge.
- **Regenerating changes the default guide labels.** If you're seeing
  old un-updated guide text, regenerate.
- **Classic WSZ skins** use a different template + exporter path
  (legacy sprite-sheet mode). Component mode produces `.msz` only.
- **`OVERLAY_GUIDES` coordinates are local to the background
  component**, not window-global. For title-bar-corner guides on
  playlist components this matters: the shade/close wells on `PL Title
  Right Corner` are at local `(4, 3)` / `(14, 3)`, not `(254, 3)` /
  `(264, 3)`.
- **The plugin never mutates artwork.** Guide rectangles go in a
  locked `Overlay Guides` group; the exporter hides that group during
  `exportAsync` and restores it after. If you ever see a guide rect in
  an exported PNG, that's a bug.

---

## Further reading

- [`LAYOUT_SPEC.md`](../skin-format/LAYOUT_SPEC.md) — authoritative element
  coordinates for every window and every mode.
- [`SKIN_FORMAT.md`](../skin-format/SKIN_FORMAT.md) — sprite-sheet structure and
  which pixels the renderer reads.
- [`componentDefs.ts`](../../figma-skin-plugin/src/shared/componentDefs.ts)
  — the machine form of everything above.

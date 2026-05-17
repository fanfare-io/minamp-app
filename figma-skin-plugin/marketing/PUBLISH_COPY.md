# Figma Community Publish Copy

Drop these values into the Figma publish form (Plugins → Development →
Manage plugins in development → ⋯ → Publish new release).

## Tagline (≤70 chars)

> Author HD skins for Minamp as Figma components.

(60 chars. Alt: "Design Minamp HD skins in Figma — export ready-to-load .msz" — 60 chars.)

## Description

> Minamp Skin Designer is the official Figma plugin for authoring
> high-resolution skins for **Minamp**, a Winamp-classic player for
> macOS.
>
> Every UI element — title bars, transport buttons, sliders, the
> equalizer, the playlist window — is laid out as a labeled Figma
> ComponentSet. You paint inside the component variants; the plugin
> packs the sprite atlases, interpolates 28 slider frames between your
> `BG` and `Fill` variants, bundles in the colour palette and config
> files, and outputs a single `.msz` archive that drops straight into
> Minamp.
>
> **What's in the box:**
>
> - **Generate Components** — stamps the full set of empty
>   ComponentSets onto the current page, each at its real authored
>   size with locked overlay guides showing where transport buttons,
>   sliders, indicators, and dynamic text land at runtime.
> - **Live validation** — every required component present, correct
>   dimensions, no missing variants. Catches problems before export.
> - **One-click `.msz` export** at 2× or 3× asset scale.
> - **Visualizer & playlist colour editors** for the `VISCOLOR.TXT`
>   and `PLEDIT.TXT` config files that ship inside every skin.
> - **Asset import** for dropping reference imagery or photographic
>   textures directly into Figma.
>
> Open source, MIT licensed. Source, the HD skin-format spec, the
> reference template, and the pixel-exact layout reference all live
> at github.com/fanfare-io/minamp-app.

## Tags

Pick the most relevant 5–8 from this list at submission time:

`skins` · `audio` · `music-player` · `winamp` · `retro` ·
`design-tools` · `components` · `theming` · `mac` · `customization`

(Figma's tag picker tends to suggest tags as you type — go with the
ones it offers when they match.)

## Support contact

> michael@waitify.io

Or point at https://github.com/fanfare-io/minamp-app/issues if you'd
rather route bug reports through GitHub Issues directly (recommended
— that's the public-facing surface and shows other reports for
context).

## Cover image

[`cover.png`](cover.png) — 1920 × 960, dark theme with the Minamp
app icon, plugin name, and a horizontal showcase strip of four
skins (Complexion, the HD ornate template, SpyAmp Y2K, and the ASCII
telnet skin) along the bottom. Upload it directly in the publish
flow.

## Icon

The 128×128 `icon.png` already lives at the plugin's root and is
declared in `manifest.json` (`"icon": "icon.png"`). Figma picks it
up automatically.

## Screenshots (optional but recommended)

Figma allows 1–5 additional screenshots that appear on the plugin's
Community page. Strongest options:

1. The plugin UI open on the **Create** tab with the Main Background
   component selected, overlay guides visible.
2. The **Export** tab showing validation passing for a complete
   skin, with the "Export .msz" button highlighted.
3. A finished skin loaded in Minamp itself (cropped screenshot of
   the desktop), to close the loop on "what does the output do."
4. The **Config** tab with the VISCOLOR grid populated.

Capture these in Figma desktop at 2× retina, then crop to 1600×960
or similar. Save them to this `marketing/` directory so they stay
under version control.

## Pre-submit checklist

- [ ] Plugin runs cleanly in Figma desktop from a fresh
      `npm install && npm run build` (production minified output
      committed to `dist/`).
- [ ] `manifest.json` `icon` field present and pointing at the
      committed `icon.png`.
- [ ] First-time publish: in the Figma desktop publish flow, the
      plugin gets assigned a numeric `id`. Copy that back into
      `manifest.json` before merging the publish PR.
- [ ] Cover image and any screenshots ready locally.
- [ ] Description proofread for any trademark misuse — the plugin
      is for **Minamp** (our brand). Reference "Winamp" only as the
      stylistic ancestor; never as an official affiliation.
- [ ] `networkAccess.allowedDomains: ["*"]` — be ready to explain
      to reviewers that this exists for the Assets tab, which fetches
      user-supplied URLs the plugin can't know in advance.

# minamp-app

Open tooling and skin-format spec for [Minamp](https://github.com/fanfare-io/minamp-app), a Winamp-classic macOS player.

The Minamp app itself is closed-source and distributed via the Mac App Store. This repository holds the pieces that the community benefits from:

- **`figma-skin-plugin/`** — a Figma plugin for designing Minamp HD skins (`.msz`) without hand-painting sprite sheets.
- **`docs/skin-format/`** — the authoritative spec for the HD skin format, plus reference template assets.
- **`docs/figma-plugin/`** — end-to-end guide for driving the plugin.

## Getting Minamp

Minamp is coming to the Mac App Store. _App Store link — TBD._

## Designing a skin

1. Read [`docs/skin-format/SKIN_FORMAT.md`](docs/skin-format/SKIN_FORMAT.md) for the high-level archive layout.
2. Read [`docs/skin-format/LAYOUT_SPEC.md`](docs/skin-format/LAYOUT_SPEC.md) for the pixel-exact sprite regions the renderer expects.
3. Install the Figma plugin from [`figma-skin-plugin/`](figma-skin-plugin/) and follow the workflow in [`docs/figma-plugin/README.md`](docs/figma-plugin/README.md).

Reference template assets (known-good `Template.msz`, sprite-sheet PNGs, source SVGs) live at [`docs/skin-format/template/`](docs/skin-format/template/).

## Reporting bugs

- **App bugs** — [open an issue](https://github.com/fanfare-io/minamp-app/issues/new?template=bug_report.md) with a screen recording, macOS version, Minamp version, and whether you're on Apple Silicon or Intel.
- **Skin-format / plugin bugs** — [open an issue](https://github.com/fanfare-io/minamp-app/issues/new?template=skin_bug.md). Attach the misrendering skin and a debug export zip if you have one.
- **Feature ideas** — either [file a request](https://github.com/fanfare-io/minamp-app/issues/new?template=feature_request.md) or start a thread in [Discussions](https://github.com/fanfare-io/minamp-app/discussions).

## Contributing

PRs welcome. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the setup, coding conventions, and review expectations.

## License

MIT — see [`LICENSE`](LICENSE).

## Maintainers

- [@mdodsworth](https://github.com/mdodsworth) / Fanfare

# Contributing to minamp-app

Thanks for your interest in contributing. This repo holds the Figma skin plugin and the HD skin-format spec for Minamp; contributions in both areas are welcome.

The Minamp app itself (Swift/AppKit) is closed-source and lives in a separate private repository, so app-level code changes can't be made here — but bug reports, skin authoring tools, and format work all happen in this repo.

## Ways to contribute

- **Bug reports** — open an issue using the appropriate template ([app](.github/ISSUE_TEMPLATE/bug_report.md), [skin/plugin](.github/ISSUE_TEMPLATE/skin_bug.md)).
- **Feature requests** — use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).
- **Discussion** — open-ended questions go in [Discussions](https://github.com/fanfare-io/minamp-app/discussions).
- **Code contributions** — see below.

## Setting up for plugin work

```bash
cd figma-skin-plugin
npm install
npm run typecheck   # must pass
npm run build       # produces figma-skin-plugin/dist/
```

Load the built plugin in Figma desktop via **Plugins → Development → Import plugin from manifest…** and point it at `figma-skin-plugin/manifest.json`. See [`figma-skin-plugin/README.md`](figma-skin-plugin/README.md) for the full getting-started flow.

## Coding conventions

- **TypeScript** — double quotes, no casts to `any` outside tests. `tsconfig.json` is authoritative; `npm run typecheck` must pass.
- **Commits** — conventional-commits style: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `ci:`, `style:`, `perf:`.
- **Skin-format changes** — if you touch sprite rectangles, update both [`docs/skin-format/LAYOUT_SPEC.md`](docs/skin-format/LAYOUT_SPEC.md) and [`figma-skin-plugin/src/shared/componentDefs.ts`](figma-skin-plugin/src/shared/componentDefs.ts) in the same PR. The spec is the source of truth. Matching changes land in the private Minamp app separately — flag format-breaking changes in the PR description so the renderer can be updated in lockstep.

## PR flow

1. Fork, branch from `main`.
2. Make your change. Keep PRs focused — one feature or fix per PR.
3. Run `npm run typecheck && npm run build` from `figma-skin-plugin/` before pushing.
4. Open a PR against `main` using the [PR template](.github/PULL_REQUEST_TEMPLATE.md). Include a test plan and (for UI changes) screenshots or screen recordings.
5. CI must pass.
6. Reviews are single-maintainer; expect quick iteration on small PRs. Squash-merge is the default.

## Reporting security issues

Don't file security issues in public. See [`SECURITY.md`](SECURITY.md).

## Code of conduct

By participating, you agree to abide by the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

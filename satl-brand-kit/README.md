# satl-brand-kit — purpose & use case

## Why this skill exists

Every project needs a visual identity, and the pieces always sprawl: an app icon, a favicon that's actually legible at 16px, light and dark variants, a monochrome version for terminals, a wordmark, a horizontal lockup, an OpenGraph social card (light and dark), and design tokens so the app can theme itself. Done by hand per repo, these never quite match each other — the favicon doesn't look like the OG card, the dark variant is missing, the tokens never get written, and the next project starts from zero.

`satl-brand-kit` makes the whole identity **deterministic and re-runnable** from one config. The geometry of the mark lives in a single generator script, so changing the brand color reflows every asset at once.

## What it produces

A `brand/` directory containing:

- **Icons** — color (primary), dark-tile, light-tile, glyph-only, and monochrome (`currentColor`)
- **Favicon** — a simplified mark that survives 16px, plus a multi-res `.ico`
- **Wordmark + lockups** — the name in the display font, and icon+wordmark horizontal (light/dark)
- **OG covers** — 1200×630 (and a 1280×640 social-preview export) in light and dark
- **Design tokens** — `palette.json`, `tokens.json`, `tokens.css` (with a `[data-theme="dark"]` flip)
- **Generator + Taskfile** — `gen-brand.mjs` (single source of truth) and `task gen | raster | all | clean`

## When to use it

- **"Make a logo / icon / brand kit"** for a repo.
- You need a **favicon + OG image** for a project's README or site.
- You want **design tokens** (palette + fonts + radius) to theme an app consistently.
- A new repo needs its visual identity from scratch.

## How it works

1. **Concept** — because logos are taste, the skill proposes 2-3 glyph directions and 8-12 color palettes as real SVGs you can compare, recommends one, and writes the winner into `brand.json`.
2. **Generate** — `templates/gen-brand.mjs` reads the manifest, draws the chosen glyph once, and reuses it (scaled) across every asset. `templates/Taskfile.yml` rasterizes to PNG/ICO.

The only per-project art is the `GLYPH()` function in the generator; everything else (tiles, variants, favicon, wordmark, lockups, OG, tokens) is generic and flows from the manifest.

## Design opinions baked in

- 512×512 master, ~22% corner radius, flat (no shadows/bevels).
- Favicon drops fine detail rather than shrinking the full icon.
- Open-source fonts by default (Space Grotesk / Inter / JetBrains Mono).
- Light/dark variants swap the tile + foreground, never the geometry, so the family stays recognizably one mark.

## Provenance

Distilled from the lore and filemark brand work — same file layout (`icon.svg`, `<name>-glyph.svg`, `og-cover.svg`, `png/`) and the same `rsvg-convert` raster pipeline.

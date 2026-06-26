---
name: satl-brand-kit
description: >-
  Generate a complete, consistent visual identity for a project from one
  manifest: a logo glyph, a color system, every icon variant (color/dark/light/
  mono), favicon set, wordmark, horizontal lockups, light+dark OpenGraph social
  covers, and design tokens (palette.json / tokens.json / tokens.css), plus a
  single-source generator script and a Taskfile to regenerate + rasterize.
  Triggers when the user says: "make a logo", "design an icon for this repo",
  "generate brand assets / a brand kit", "favicon + og image", "design tokens /
  color palette", "brand this project", or wants the visual identity for a CLI/
  app/extension. Mirrors the filemark/lore brand layout. NOT for in-app UI
  design or one-off marketing graphics.
argument-hint: "[concept|generate] — concept proposes glyph+palette options; generate emits the full asset set from brand.json"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
---

# satl-brand-kit

Turn a name + a color into a full, internally-consistent brand kit — the same file layout and quality bar for every repo. Built from the lore/filemark brand work; the geometry lives in ONE generator so a color change re-flows the entire identity.

**Why this exists:** every repo needs an icon, favicon, OG card, wordmark, and tokens. Hand-drawing each per project is slow and inconsistent — the favicon doesn't match the OG, the dark variant is an afterthought, the tokens never get written. This skill makes the whole set deterministic and re-runnable from `brand.json`.

## Inputs (from brand.json)

```jsonc
"brand": { "concept": "strata+orbit", "color": "emerald",
           "tile": ["#10B981", "#047857"], "fg": "#FFFFFF",
           "accent": "#A3E635", "radius": 112 },
"fonts": { "display": "Space Grotesk", "sans": "Inter", "mono": "JetBrains Mono" }
```

If `brand.tile`/`accent` are missing, propose them (see **concept** mode) and write the chosen values back to `brand.json`.

## Two modes

### `concept` — propose, let the user pick

Logos are high-taste; never silently pick one. Produce **2-3 distinct glyph directions** as real SVGs + a small `preview.html`, tie each to something true about the product (what it does, the metaphor), and recommend one. Then, for the chosen direction, offer **multiple color palettes** (8-12) from one generator so the user picks a hue — many of our apps shouldn't all be the same color. Write the winner into `brand.json` and delete the rejected SVGs/previews. Only then run `generate`.

### `generate` — emit the full kit

Copy `templates/gen-brand.mjs` into `<repo>/brand/`, fill its `M` (manifest) block from `brand.json`, run it, then rasterize. Output layout (mirrors filemark/lore):

```
brand/
  gen-brand.mjs            # single source of truth — edit this, not the outputs
  Taskfile.yml             # task gen | raster | all | clean
  icon.svg / lore-icon.svg # primary color tile (512 master)
  <name>-icon-dark.svg     # dark-tile variant (on bright surfaces)
  <name>-icon-light.svg    # light-tile variant (on dark surfaces)
  <name>-glyph.svg         # glyph only, no tile (on white)
  <name>-mono.svg          # single color via currentColor (terminals/print)
  favicon.svg              # orbit/detail removed for 16px legibility
  <name>-wordmark.svg      # the name, display font
  <name>-lockup.svg / -dark.svg   # icon + wordmark, horizontal
  og-cover.svg / -light.svg       # 1200×630 social card (dark + light)
  palette.json             # full color scale + semantic light/dark maps
  tokens.json              # colors + fonts + radius + icon sizes
  tokens.css               # CSS vars, [data-theme="dark"] flip
  README.md                # brand usage guide (colors, type, don'ts, regen)
  png/                     # rasterized favicons, apple-touch, 512/1024, OG
  favicon.ico              # multi-res 16/32/48
```

## Geometry rules (so the family stays consistent)

- **512×512 master**, tile `rect rx=<radius>` (default 112 ≈ 22%). The glyph lives in 0..512 space and is reused — scaled — in the wordmark lockups and OG, so everything is literally the same mark.
- **Favicon drops fine detail** (thin orbits, small strokes) so it survives 16px. Generate it with an `orbit:false`-style flag, never just shrink the full icon.
- **Light/dark variants swap the tile + foreground**, not the geometry. Dark surfaces → light tile; bright surfaces → dark tile.
- **Mono uses `currentColor`** for every shape so it inherits text color.
- **Contrast check:** white glyph on the color tile must read at 16px; if the tile is light (amber/mint), switch the glyph to ink.

## Raster pipeline

Use `rsvg-convert` (preferred) or `magick`/`inkscape`/`cairosvg`. The Taskfile's `raster` task emits: favicon 16/32/48, `apple-touch-icon` 180, icon 512/1024, `og-cover(.png)` + light, and a multi-res `favicon.ico`. **Verify visually** — Read the generated `png/<name>-icon-512.png` and `png/og-cover.png` to confirm the glyph and (font-fallback) text rendered. Note in the brand README that the wordmark/OG declare the display font with a system fallback, so installs without the webfont render in the fallback.

## Fonts

Default to open-source (OFL) so they're free to self-host: **display = Space Grotesk**, **sans = Inter**, **mono = JetBrains Mono**. Document the stacks in `tokens.json` → `font.stack`. Override per `brand.json` `fonts`.

## Don'ts (also write these into the brand README)

- Don't recolor outside the palette — add a tile variant instead.
- Don't stretch/rotate the mark; the orbit/detail angle is intentional.
- Don't add shadows/bevels — the mark is flat.
- Don't ship the full-detail icon below ~24px — use `favicon.svg`.
- Keep clearspace ≥ 25% of the icon width.

## Output contract

Leave the repo with a `brand/` dir that regenerates fully via `task -t brand/Taskfile.yml all`. The generator + manifest are the source of truth; the SVG/PNG outputs are derived and safe to delete + rebuild.

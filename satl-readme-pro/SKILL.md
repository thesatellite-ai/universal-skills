---
name: satl-readme-pro
description: >-
  Turn a repo README into a polished, SEO-ready, conversion-oriented landing
  page: centered logo header + shields badges, a keyword-rich intro, a "Why
  this?" pitch with a comparison table, a FAQ tuned for Google/AI Overviews, a
  table of contents, and a keyword footer — while preserving every existing
  section. Triggers when the user says: "update the README", "make the README
  SEO-ready", "add the logo/badges to the README", "write the pitch / why-use-
  this section", "add a FAQ / comparison table", or "make the repo README look
  professional". Delegates deep positioning copy to satl-homepage-positioning /
  satl-frontend-pitch. NOT for API docs or wiki content.
argument-hint: "[augment] — adds header/badges/pitch/FAQ to an existing README without dropping content"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# satl-readme-pro

Make a repo's README do three jobs at once: **look professional** (logo + badges), **rank and get cited** (SEO + FAQ), and **convert** (a real pitch, not a feature dump) — without throwing away the content that's already there.

**Why this exists:** a strong README is the highest-leverage marketing a small OSS project has — it's the landing page, the SEO surface, and the thing AI assistants quote. But we kept writing them ad hoc: some had badges, some didn't; few had a pitch or FAQ; none were consistent. This skill encodes the structure once.

## Hard rule: preserve existing content (lossy-diff)

Before writing, **enumerate the existing README's top-level sections**. Your output must contain every one of them (Install, Usage, Concepts, Command reference, Contributing, …) unless the user explicitly says to drop it. You are *augmenting*: adding a header, pitch, FAQ, TOC, and footer, and lightly tightening the intro. Re-running must be idempotent (don't double-add a header). This is the #1 way this skill fails — verify section parity at the end.

## Inputs (from brand.json)

`name`, `tagline`, `description`, `repo`, brand color (for badge color + header image), and `positioning` (`category`, `audience`, `wedge`, `alternatives`, `differentiators`). If `positioning` is thin, **invoke `satl-homepage-positioning`** to produce the pitch copy, then assemble it here. Never invent competitor claims.

## The structure (top to bottom)

1. **Logo header** — centered, via HTML that GitHub allows:
   ```html
   <p align="center"><img src="brand/png/<name>-icon-512.png" alt="<name> logo — <glyph description>" width="120" height="120"></p>
   <h1 align="center"><name></h1>
   <p align="center"><strong><tagline></strong></p>
   <p align="center"><one keyword-rich sentence></p>
   ```
   Prefer the rasterized PNG over the SVG for the header image — GitHub renders PNG reliably and SVG webfonts won't load. Use `<picture>` with light/dark lockups only if you've verified both render.

2. **Badge row** — shields.io, brand-colored: release, license, platforms, language, a "100% local"/USP badge, and stars. Link release/license/stars to their pages. Use the brand hex (no `#`) for `color=`.

3. **Horizontal rule + SEO intro** — one paragraph that names the **category** and every **target keyword/integration** naturally (for a coding tool: the agents/editors it works with, "open-source", "local-first", etc.). This is what Google and AI Overviews index. Keep the existing intro's substance; just make it keyword-aware.

4. **Table of contents** — anchor links to every section (old + new).

5. **## Why <name>?** — the pitch. Lead with the **core insight / wedge** (one sharp paragraph), then 5-7 differentiator bullets. Then a **comparison table**:
   | | **<name>** | Alt category A | Alt category B | Alt category C |
   Use **category columns** (e.g. "Cloud SaaS", "Vector RAG libs", "DIY") rather than naming specific competitors unless every cell is verifiable — ✅ / ⚠️ / ❌, and ⚠️ for "varies". Close with a one-line "if you want X, others exist; if you want Y, that's <name>."

6. *(existing sections unchanged: Install, Quick start, Concepts, Command reference, …)*

7. **## FAQ** — 6-8 Q&As phrased as the **exact questions people/AI ask** ("does it send my data to the cloud?", "does it need an API key?", "how is this different from doing X by hand?", "will it bloat my context/bundle?"). FAQ markup is what wins featured snippets and AI-answer citations. Bold the question, answer in 1-3 sentences.

8. **Keyword footer** — a small `<sub>` line restating the category + integrations + "no cloud / open source", for the last bit of indexable keyword coverage.

## SEO checklist (verify before done)

- H1 = the name; one keyword-dense sentence directly under it.
- Every image has descriptive `alt` text.
- Category + integration names appear in prose (not just badges).
- FAQ present, question-shaped.
- Comparison table present.
- Internal/external links resolve (`repo`, releases, license).
- Lossy-diff: all prior sections retained.

## Markdown style

This README is GitHub-rendered → **plain markdown**, not filemark. Do not hard-wrap prose (one paragraph = one line). Tables one row per line. Keep code fences intact.

**Never use `---` thematic breaks / horizontal rules.** They can be misread as YAML frontmatter delimiters and break renderers like **macOS Quick Look** (and they're visually redundant once you have headings). Separate sections with a heading or blank lines — never a `---` line. The only legitimate `---` is a SKILL.md's own frontmatter fence, which is not a README concern.

## Hand-off

Deep positioning / hero rewrite → `satl-homepage-positioning`. Interactive pitch deck → `satl-frontend-pitch`. This skill assembles their output into the README structure above.

# satl-favicon-audit — purpose & use case

## Why this skill exists

"Google shows the wrong icon for my site" is a confusing, recurring report — and it has two very different causes that look identical from the outside:

1. The live favicon is **already correct**, and Google is just showing a **stale cached** icon from an earlier crawl (Google refreshes Search favicons slowly — days to weeks).
2. There's a **real bug**: a web manifest whose icon paths 404, no Google-compliant icon size, or a leftover scaffold/default `/favicon.ico`.

The trap is "fixing" case 1 (rewriting an icon that's already fine) or missing the subtle bugs in case 2. This skill encodes how to tell them apart and fix the real ones.

## What it does

- **Triages live-vs-cached first** — renders the live favicon and compares it to what Google shows, so you don't rewrite a correct icon.
- **Audits the whole chain** — declared `<link rel="icon">` tags, the root `/favicon.ico`, and the web manifest, checking every URL actually resolves (no 404s).
- **Checks Google's requirements** — a square icon that's a multiple of 48px (192/512), since 16/32 + a 180 apple-touch can leave Google with nothing compliant.
- **Fixes the common bugs** — wrong manifest icon paths, empty `name`/`short_name`, missing 192px icon link, scaffold leftovers.
- **Gives the right re-crawl nudge** — Request Indexing in Search Console, then wait (there's no "Validate fix" for favicons).

## When to use it

- **"Google shows the React/old/default icon for my site."**
- **"The favicon isn't updating in search results."**
- **"site.webmanifest icons are 404."**
- **"My branded favicon isn't showing in the browser tab / search."**

## What it deliberately does NOT do

- Design the icon — that's `satl-brand-kit`. This skill assumes you have a branded favicon set and makes sure it's wired up and discoverable.

## Provenance

Distilled from a real fix on khanakia.com: the live favicon was already branded, but the web manifest's icon paths 404'd (root-relative vs the `/favicon/` folder), there was no 48px-multiple icon link, and Google was showing a stale React/Vite default from a pre-fix crawl. The fix was a corrected manifest + a 192px icon link + a re-index request.

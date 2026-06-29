---
name: satl-favicon-audit
description: >-
  Diagnose and fix why a website shows the wrong, default, or scaffold favicon
  in Google Search results or the browser tab — broken web-manifest icon paths,
  missing Google-compliant icon sizes, leftover React/Vite/Next/TanStack default
  icons, or a stale Google cache. Triggers when the user says: "Google shows the
  React/old/wrong icon", "favicon not updating in search", "fix the favicon",
  "wrong favicon in Google", "site.webmanifest icons 404", "favicon shows the
  default", "branded icon isn't showing", or "search result has the wrong logo".
  Verifies the live site first (live-correct-but-Google-stale is the most common
  case), then fixes real bugs and tells the user how to nudge a re-crawl. NOT for
  designing the icon itself (use satl-brand-kit).
argument-hint: "[audit|fix] — audit reports every issue; fix applies the corrections"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# satl-favicon-audit

Make a site's branded favicon actually show up — in the browser tab AND in Google Search results — instead of a default globe, a scaffold leftover (React/Vite/Next/TanStack), or a stale cached icon.

**Why this exists:** "Google shows the wrong/React icon for my site" is a recurring, confusing report. Usually the live favicon is *already correct* and Google is just showing a stale cache — but mixed in are real, easy-to-miss bugs (a web manifest whose icon paths 404, no Google-compliant icon size, a leftover scaffold `/favicon.ico`). This skill separates "actually broken" from "just cached," fixes the real issues, and gives the right re-crawl nudge.

## Rule 0 — triage live-vs-cached BEFORE assuming it's broken

The #1 mistake is rewriting a favicon that's already correct. First, **look at what the live site actually serves** and compare to what Google shows:

```sh
# Render the live favicon and SEE it (is it branded, or a default/React/scaffold icon?)
curl -s https://<site>/favicon.ico -o /tmp/fav.ico
magick /tmp/fav.ico[0] -resize 96x96 /tmp/fav.png   # then open/Read /tmp/fav.png
curl -s https://<site>/ | grep -oiE '<link[^>]*icon[^>]*>'   # what's declared
```

- **Live icon is correct, Google shows old** → it's a **stale cache**. Google refreshes favicons in Search on its own slow schedule (days–weeks). Fix nothing in the image; jump to [Nudge a re-crawl](#nudge-a-re-crawl). (You may still find the bugs below worth fixing so Google picks it up reliably.)
- **Live icon is wrong/default** → there's a real bug; continue.

## Audit checklist (run all)

1. **Declared icons** — list every `<link rel="icon|apple-touch-icon|manifest">` in the homepage `<head>`. There should be a `favicon.ico`, small PNGs, an apple-touch-icon, a manifest, and ideally a high-res square (see #4).

2. **Every icon resolves (no 404)** — curl each declared href AND the root `/favicon.ico`. Browsers and Google fetch root `/favicon.ico` by convention even when not declared.

3. **Web manifest paths** — the classic bug: a manifest served at `/favicon/site.webmanifest` whose `icons[].src` are root-relative (`/android-chrome-192x192.png`) → they resolve to `https://site/android-chrome-...` and **404**, because the files actually live under `/favicon/`. Paths in a manifest are resolved relative to the SITE ROOT, not the manifest's folder — so they must be the full correct path (`/favicon/android-chrome-192x192.png`). Also check `name` / `short_name` aren't empty.

4. **Google's favicon requirements** — Google wants a favicon that is:
   - **square** (1:1 aspect ratio), and
   - a **multiple of 48px** (48, 96, 144, 192, 512…), and
   - reachable, stable URL, same host.
   16×16 / 32×32 and a 180×180 apple-touch (180 is NOT a 48-multiple) can leave Google with nothing compliant, so it falls back. **Ensure at least one `<link rel="icon" type="image/png" sizes="192x192" href="…">`** (192 is 48×4). The 512 from a standard favicon set works too.

5. **Scaffold leftovers** — grep `public/` (and the served root) for `vite.svg`, default `react`/Next/TanStack favicons, or a root `/favicon.ico` that's still the framework default while the branded set sits in a subfolder. The root `/favicon.ico` must be the BRANDED one.

6. **Caching sanity** — the favicon/manifest shouldn't be served `immutable` with a year-long max-age (it changes); `max-age=0, must-revalidate` or a short TTL is fine. (Note: an over-eager CDN/gateway that hard-caches `.ico`/`.svg`/`.webmanifest` will also freeze a fixed icon — see the gateway-cache pattern.)

## The standard fix

- **Fix manifest `icons[].src`** to the correct absolute paths and set `name` / `short_name`.
- **Add a 192×192 (or 512) icon link** to the head:
  ```html
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon/android-chrome-192x192.png">
  ```
- **Ensure root `/favicon.ico` is the branded mark** (copy the branded `.ico` to the web root if the framework expects it there).
- Verify locally/dev: every icon link 200, manifest icons 200, `name` set, the 192 link present in the rendered `<head>`.

## Nudge a re-crawl

After deploying the fix (the live site must show the corrected icons — verify with `curl`, watching `x-vercel-cache: age` reset / a fresh `last-modified`):

1. Google Search Console → **URL Inspection** on the homepage → **Request Indexing** (prompts a re-crawl + favicon refresh).
2. Then **wait** — there is **no "Validate fix" button for favicons**; Google refreshes the Search favicon on its own schedule (days to weeks). Nothing else forces it.

## Gotchas captured from real fixes

- The live favicon was already the branded mark; Google was showing the React/Vite default from a pre-fix crawl. Always verify live first.
- A web manifest at `/favicon/site.webmanifest` with root-relative `/android-chrome-*.png` icon `src` → 404. Use full `/favicon/...` paths.
- Empty `name`/`short_name` in the manifest.
- Only 16/32/180 icons declared and no 48-multiple square → Google has nothing compliant to show.
- A separate root `/favicon.ico` vs a branded set under `/favicon/` — make sure BOTH are branded and identical.
- Deploy verification: if the CDN still serves the old file with a growing `x-vercel-cache: HIT age`, the new deployment hasn't replaced it yet — the build is still running, failed, or needs promotion. Confirm the live bytes changed before telling Google to re-crawl.

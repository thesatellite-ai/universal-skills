# satl-frontend-pitch — purpose & use case

## Why this skill exists

A markdown scope doc or plan doesn't *land* with a client, board, or partner — it reads like a draft. Slides and PDFs are static and generic. What actually wins the room is a premium, interactive, scrolled **plan-and-roadmap deck built as a real React app**: keyboard-navigable sections, module deep-dive routes, an auto-play scenarios walkthrough, and a tone calibrated to whoever is reading it. Building that from scratch each time is slow and easy to get wrong.

`satl-frontend-pitch` encodes everything learned shipping a full production plan-and-roadmap (~36 surfaces, 12 sections, 19 module pages, 4 scenarios) — what works, what breaks, what to never do — plus a reference implementation to copy from.

## What it does

Builds a **TanStack Start + Vite + React 19 + Tailwind v4 + motion** app:

- **12 scrolled sections** on `/` (cover → close), keyboard-navigable.
- **`/modules`** index grouped by phase, **`/module/$slug`** dynamic deep-dive pages.
- **`/scenarios`** — a dark auto-play split-screen walkthrough.
- Custom design tokens matching the client's brand (or sensible defaults), deployed to a `{project-slug}.vercel.app` URL.

It runs a **discovery Q&A upfront** so the deck reflects the real engagement, not template defaults, and ships a reference implementation in `./EXAMPLES/` — default to copying those patterns, not writing from scratch.

## When to use it

- "Build a pitch / pitch deck / plan-and-roadmap site / interactive deck."
- "We need to wow [client]" / "convert this plan into a website" / "turn this proposal into a React app."
- You have a markdown plan or scope doc you want visualized.

## NOT for

- Slides (Keynote/Pitch/Slides), Figma mockups, static PDFs, or a marketing landing page (that's a conversion funnel — different mental model; see `satl-homepage-positioning`).

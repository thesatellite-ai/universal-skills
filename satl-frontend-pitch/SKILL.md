---
name: satl-frontend-pitch
description: >-
  Build a premium, interactive, scrolled "plan and roadmap" deck as a real
  React app (TanStack Start + Tailwind + motion) — for client pitches,
  internal program reviews, board updates, partnership proposals. Triggers
  when the user says: "build a pitch", "make a pitch deck", "build a plan
  and roadmap site", "interactive deck", "we need to wow [client]", "convert
  this plan into a website", "make a development plan page", "build a sales
  page for our plan", "turn this proposal into a React app", or has a
  markdown plan / scope doc they want visualized. NOT for Figma mockups,
  static PDFs, or generic landing pages — this is a 12-section scrolled
  React app with module deep-dive routes and an interactive scenarios
  walkthrough. Asks the user a Q&A flow upfront so the deck reflects the
  real engagement, not template defaults.
---

# satl-frontend-pitch

You are about to build a **plan-and-roadmap deck as a real React app**. Not slides. Not a static PDF. A scrolled, keyboard-navigable React site with module deep-dive routes, an auto-play scenarios walkthrough, and a tone calibrated to whichever client is reading it.

This skill encodes everything we learned shipping the IFPG Hub plan-and-roadmap (~36 surfaces, 12 sections, 19 module pages, 4 scenarios) — what works, what breaks, what to never do.

**Read this whole doc before writing a line of code.** Then run the discovery Q&A. Then build.

> **Reference implementation lives in `./EXAMPLES/`.** Every architectural pattern below has a working, production-tested file there. When this doc says "see Section primitive", the actual code is at `EXAMPLES/components/pitch/section.tsx`. Read `EXAMPLES/README.md` for the full file map. Default to copying from EXAMPLES, not writing from scratch.

---

## When to invoke

Invoke when ANY of these:

- User asks for a pitch, plan, roadmap, proposal, or development plan **as a website or React app**
- User has a markdown scope doc / brainstorm folder and asks to "visualize" or "make it impressive"
- User says they need to "convince" or "impress" a client / board / partner with a development plan
- User explicitly says "make a satl pitch" / "build a satl deck"

Do NOT invoke when:

- User wants slides (Keynote, Pitch, Slides) — different format
- User wants a Figma mockup — wrong tool
- User wants a marketing landing page — different mental model (this is a long-form scrollable doc, not a conversion funnel)
- User wants a static PDF — print is a fallback at most

---

## Output format (what you ship)

A **TanStack Start + Vite + React 19 + Tailwind v4 + motion** app with:

- **12 scrolled sections** on `/` (cover → close), keyboard-navigable
- **`/modules`** index page grouping by phase
- **`/module/$slug`** dynamic deep-dive pages (one per feature/module)
- **`/scenarios`** dark auto-play split-screen walkthrough
- **Custom design tokens** matching the client's brand (or sensible defaults)
- **Vercel deploy** under a `{project-slug}.vercel.app` URL

Everything reads like a finished product, not a draft. Premium, technical voice. No marketing jargon.

---

## Phase 1 — Discovery (always run first)

Before writing code, run this Q&A via `AskUserQuestion`. Bundle into 2-3 calls max. Skip questions where the answer is already in the user's prompt.

### Round 1 — Identity

```
1. Client / audience? (the IFPG, the board, partner X)
2. Product / project name? (the IFPG Hub, Project Phoenix, etc.)
3. Subtitle / artifact framing?
   - "Development plan and roadmap" (default, what Erman picked)
   - "v1 plan"
   - "Proposal"
   - Custom
4. From / who's signing? (e.g. "Solverhood team", "Aman + Erman")
5. Target ship date or window? (Sept 30 2026, Q4, "TBD")
```

### Round 2 — Content shape

```
6. Number of v1 modules / features? (typical: 8-12)
7. Phases? Default v1/v1.5/v2 — confirm or customize labels
8. Existing markdown content to lift from? (point me at the dir)
9. Voice: technical + product (default), or different?
10. Audience sensitivity — anything to AVOID mentioning?
    (e.g. "don't say we're using different code stacks", "no specific
     dollar amounts", "don't reference [competitor]")
```

### Round 3 — Brand + deploy

```
11. Brand palette — use defaults (navy + royal + orange CTA + gold) or
    customize? If custom, get hex codes.
12. Logo / wordmark — file path? Or use a text wordmark?
13. Deploy target — Vercel (default) / Cloudflare / self-hosted / not yet
14. Vercel team scope if relevant
15. GitHub repo — create new under which org? Public or private?
    (DEFAULT TO PRIVATE for client work)
```

**Important:** if the user already has a markdown plan folder, read it FIRST before asking questions — most answers will be in there. Save them the typing.

---

## Phase 2 — Repo setup

### Stack (non-negotiable)

- **TanStack Start** (Vite 8, React 19, SSR + file routes)
- **Tailwind v4** (Vite plugin)
- **motion** (formerly framer-motion, package is `motion`)
- **lucide-react** for icons
- **sonner** for toasts
- **Poppins** font via Google Fonts CDN

### Boilerplate path

If the user has the khanakia TanStack boilerplate (`@analyzify/sync_tanstack` style), use it. Otherwise scaffold with `pnpm create @tanstack/start@latest`.

After install:
```bash
pnpm add motion lucide-react sonner
```

### File layout

```
src/
  routes/
    __root.tsx                    # title, Poppins font, Toaster
    index.tsx                     # 12-section deck orchestrator
    modules.tsx                   # module catalog index
    module.$slug.tsx              # dynamic module deep-dive
    scenarios.tsx                 # auto-play scenarios route
  lib/
    pitch-data.ts                 # ALL deck content + meta + sections array
    module-data.ts                # 19+ module objects + helpers
    utils.ts                      # cn() helper
  components/
    pitch/
      deck-shell.tsx              # topbar, side-dot nav, keyboard handler
      section.tsx                 # Section + Eyebrow + Headline + Lede + BigStat
      module-page.tsx             # shared template for /module/$slug
      module-mocks.tsx            # 7 CSS-only browser-chromed mockups
      sections/
        01-cover.tsx
        02-problem.tsx OR skip
        03-solution.tsx
        03b-ecosystem.tsx
        04-architecture.tsx
        05-reuse.tsx OR skip
        06-scope.tsx
        07-features.tsx
        08-timeline.tsx
        09-team.tsx
        10-risks.tsx
        11-fomo.tsx (rename to "timing-rationale" preferably)
        12-ask.tsx (or "next-steps")
        13-close.tsx
  styles.css                      # Tailwind import + IFPG-style tokens
```

---

## Phase 3 — Design tokens

Put these in `styles.css` after the Tailwind import. **Navy-tinted shadows are the signature move.**

```css
@theme {
  --color-brand-navy-900: #1a365d;
  --color-brand-navy-700: #2c5282;
  --color-brand-royal-500: #3182ce;
  --color-brand-royal-400: #4299e1;
  --color-brand-royal-100: #ebf8ff;
  --color-brand-cta: #ed8936;
  --color-brand-cta-hover: #dd6b20;
  --color-brand-gold: #d69e2e;
  --color-brand-gold-light: #ecc94b;
  --color-brand-success: #38a169;
  --color-brand-warning: #d69e2e;
  --color-brand-error: #e53e3e;

  --color-ink: #2d3748;
  --color-ink-muted: #4a5568;
  --color-ink-subtle: #718096;
  --color-page: #f7f9fc;

  /* Signature: navy-tinted alpha, not pure black */
  --shadow-card: 0 1px 3px rgba(26, 54, 93, 0.04), 0 4px 12px rgba(26, 54, 93, 0.06);
  --shadow-hover: 0 4px 12px rgba(26, 54, 93, 0.10), 0 8px 24px rgba(26, 54, 93, 0.08);
  --shadow-pop: 0 12px 40px rgba(26, 54, 93, 0.12);
}

body {
  font-family: "Poppins", system-ui, sans-serif;
  background: var(--color-page);
  color: var(--color-ink);
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up { animation: fade-in-up 400ms cubic-bezier(0.2, 0.7, 0.2, 1) both; }

@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }

/* Gradients used everywhere */
.navy-gradient { background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%); }
.cta-gradient  { background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%); }
.gold-gradient { background: linear-gradient(135deg, #d69e2e 0%, #ecc94b 100%); }

/* Scroll snap on html/body — NOT on a fixed container (whileInView breaks otherwise) */
html, body { scroll-snap-type: y mandatory; scroll-behavior: smooth; }
```

### When the client's brand differs

Swap the brand-* tokens only. Keep the structural tokens (shadows, ink, page, animations). The "premium" feel comes from the *shadow alpha tint* + *navy gradient* pattern, not from the specific hue.

---

## Phase 4 — Section primitive + DeckShell + Cover

### Section primitive

A `Section` component with 4 tone variants is the bedrock. Every section uses it.

```tsx
type Tone = "light" | "navy" | "cream" | "ink"

export function Section({ id, children, tone = "light", className }) {
  const toneClass = {
    light: "bg-[#f7f9fc] text-[#1a365d]",
    navy:  "navy-gradient text-white",
    cream: "bg-[#fffaf0] text-[#1a365d]",
    ink:   "bg-[#0d1b2f] text-white",
  }[tone]
  return (
    <section
      id={id}
      data-section={id}
      className={cn(
        "min-h-screen w-full snap-start flex items-center justify-center px-6 md:px-16 py-20 relative overflow-hidden",
        toneClass, className,
      )}
    >
      <div className="max-w-6xl w-full">{children}</div>
    </section>
  )
}

export function Eyebrow({ children, tone = "blue" }) { /* uppercase, small, tracked */ }
export function Headline({ children }) { /* clamp(2rem, 5vw, 3.5rem), bold, leading 1.05 */ }
export function Lede({ children }) { /* 1rem-1.25rem, muted text, max-w-2xl */ }
export function BigStat({ value, label, tone = "navy" }) { /* clamp(2.5, 5vw, 4.5rem) bold */ }
```

### DeckShell

Owns: topbar (logo + section counter + nav links + kbd hints) + sticky side-dot nav + keyboard handler.

Keyboard map: `ArrowDown`/`PageDown`/`Space`/`j` → next, `ArrowUp`/`PageUp`/`k` → prev, `Home`/`End` → first/last. Bind on `window`, skip when target is `INPUT`/`TEXTAREA`.

IntersectionObserver tracks active section as the user scrolls (threshold `[0.5, 0.7, 0.9]`).

### Cover

Tone `ink`. Grid pattern background at 6% opacity, two colored glow blobs (royal top-right, orange bottom-left). Hero pattern:
- Status pill: "● Plan and roadmap · [Month Year]"
- Massive product name (clamp 3.5-7.5rem, font-bold, tracking-tight)
- Subtitle with orange-underlined accent word (the "command center" / "growth engine" word — make it underlined gradient)
- FROM / target metadata grid (3 small columns)
- Quick-jump chips to `/modules` and `/scenarios`
- "Scroll or press ↓ to begin" prompt at bottom

---

## Phase 5 — The 12 sections (recipes)

### 1. Cover — see Phase 4

### 2. Problem (often skip — see voice rules)

If you include it: 3 silo cards showing fragmented current state, red pain-point row at bottom. **Skip entirely** if the client doesn't want adversarial framing (e.g. Erman cut this from the IFPG deck — felt too negative).

### 3. The product / surfaces

Eyebrow + headline naming the count of v1 modules. Grid of 8-12 clickable tiles, each linking to `/module/$slug`. Below: link to `/modules` index. Show v1 phase badge per tile.

**Tile shape**: 4-col grid, white card, royal gradient icon, name + caption, hover reveals "Open →" arrow, phase badge at bottom-left.

### 3b. Ecosystem (Hub + Atlas / two-product story)

Three-column diagram: left product card (orange gradient) + center shared foundation block (navy gradient) + right product card (royal gradient). Below: third-party vendor pills.

Then a 3-scenario tab selector — clicking a tab swaps the detail card showing **WHEN** (product A action) → **THEN** (product B effect) split-screen with a "Data exchanged:" footnote.

This is where you tell the cross-product integration story without selling.

### 4. Architecture

The hero card: navy gradient block titled "[Foundation name] — [status]" with 4-6 capability bullets (icons + labels). Above it: two smaller product cards showing each product's status.

Below the navy block: two-column white cards showing "Shared between A and B" (with green checkmark icons) and "Added for [new product]" (with orange icons). Include a third-party-services sub-section in the second column.

Key voice move: never frame as "different stacks" or "purpose-built." Frame as "shared foundation, added capabilities."

### 5. Reuse claim (often skip — see voice rules)

If the client cares about code reuse %, include a donut + per-layer breakdown. If they DON'T want you to surface code/stack differences (very common — Erman cut this), **skip this section entirely.**

### 6. Scope phasing

Interactive 3-toggle (v1 / v1.5 / v2). Active phase shows a feature checklist card + cumulative stacked bar at the bottom showing relative sizes.

Feature list per phase: short strings, not full sentences. Frame v2 as **strategic themes** not specific vendors (e.g. "Unified hub for all elements" not "GoHighLevel integration"). Strategic vision survives changing tech landscape; specific vendors don't.

### 7. Clarifications (was: "Features you asked")

Accordion of Q&A items. Each has a phase badge (v1/v1.5/v2) + question + expandable answer.

**Wording**: "Clarifications we asked" (we asked them) NOT "questions you asked." This frames Solverhood as proactive, not reactive. Subtle but matters.

### 8. Timeline

Gantt chart from inline SVG / CSS bars. Date axis at top (Jun 1 / Jul 1 / etc), sprint bars positioned with `left: ${start/total}%` and `width: ${weeks/total}%`. GA flag icon at the end.

Legend grid below with all sprints + their deliverable strings. Include "soft launch buffer" before GA.

### 9. Team

Squad grid (3-7 cards). Each card: role icon + count or FTE% + role name + source description ("Assigned from [agency], [product]-focused").

**Wording**: "Assigned from [agency]" NOT "hired" / "new hire." The client doesn't care about your hiring; they care about who's assigned.

Right column: Total FTE callout (navy gradient) + Promise card (green border) saying "0 [existing team] engineers pulled off" + description of how the team coordinates with existing engagements.

### 10. Risks

3×3 likelihood × impact heatmap. R1-R10 chips colored by risk score (likelihood × impact). Hover a chip → detail card on the right shows the full title + mitigation.

**Hard rule**: every risk needs a written mitigation in the doc. No risk listed without one.

### 11. Timing rationale (was: "FOMO")

3 cards explaining why this window makes sense. Each card: icon + title + body.

**Hard rule**: no fabricated stats. No "3.2× increase" or "41% better conversion" unless the data exists. Frame timing as "natural window, not a deadline." End with an explicit "if calendar prefers later, we adjust" callout.

The original IFPG deck had a fabricated Q4 seasonality bar chart — Erman caught it and demanded sources. Don't repeat the mistake.

### 12. Next steps (was: "The ask")

2 items max. Each as a card with icon + step number + title + detail. Avoid urgency framing. "Whenever it works" beats "this week."

Below the cards: an optional info callout explaining anything NOT being asked for upfront (e.g. "X-Cart admin intro? Not needed up front. Phase 1.5.").

### 13. Close

Tone `ink`. Centered. Big "Thanks for going through this." headline. Soft "we're happy to walk through any section live" line. FROM signature card. Product name footer.

No deadline. No "reply by Friday." Soft sign-off.

---

## Phase 6 — Module deep-dive pages

Every v1 module gets a full page at `/module/$slug`. v1.5 and v2 modules can have lighter pages.

### Module data shape

```typescript
type Module = {
  slug: string
  name: string
  tagline: string         // one-line product framing
  description: string     // 1 paragraph
  icon: IconKey           // see iconMap
  accent: "navy" | "royal" | "orange" | "green" | "gold" | "purple"
  phase: "v1" | "v1.5" | "v2"
  when: string            // "Sept 30, 2026"
  hero: string            // the "why this matters" line
  flows: { title, body }[]              // 3-4 user flows
  dataShape: { name, fields[] }[]       // DB tables this module owns
  integrations: { name, role }[]        // vendors / internal modules
  crossProduct: { trigger, effect }[]   // when/then with the other product
  ifpgBenefit: string                   // why the client cares
  mockType: "dash"|"list"|"calendar"|"wallet"|"table"|"form"|"feed"
  base44Page?: string                   // optional: original prototype reference
}
```

### Module page template

Top bar (sticky): back link + "All modules" link.

Hero: full-bleed gradient matching the module's accent color. Grid pattern at 6% opacity. Icon in white-15 backdrop tile. Phase badge + "[Product] · Module" eyebrow. Module name (clamp 2.5-4.5rem). Tagline + description.

Below hero (2-column on lg):
- LEFT: "Why this matters" callout with orange left-border
- RIGHT: "Concept mockup · not connected to live data" + browser-chromed `<ModuleMock>` + optional "Concept lineage" blue callout linking to original prototype

Key flows: numbered cards (1-4), each with accent-colored circle + title + body.

Data shape + Integration points: 2-column. Data shape is monospace SQL field list. Integrations are colored-dot list items with role descriptions.

Cross-product: gradient "WHEN → THEN" cards in a soft blue background.

"Why [client] cares": navy gradient callout with the IFPG-benefit string.

Prev/Next navigation at bottom.

### The 7 ModuleMock variants (CSS-only, no images)

Each renders inside a fake browser chrome (3 dots + URL). Each themed by the module's accent color.

- **dash**: greeting + 4 KPI tiles + "Today's actions" list with pulse on urgent
- **list**: section header + 4 list items with icons + tag badges
- **calendar**: consultant header + 5-day picker + 10-slot grid with available/booked/unavailable states
- **wallet**: navy hero balance card with decorative circles + ledger table preview
- **table**: 4-column kanban with items
- **form**: 4 form fields with some locked / requires-approval
- **feed**: chat-style avatar + name + message rows

Build these in `module-mocks.tsx`. Reuse across module pages.

---

## Phase 7 — Modules index

`/modules` route. Grouped by phase (v1, v1.5, v2). Each phase shows a colored chip header + count. 3-column card grid below.

Each card: gradient icon + name + tagline + phase date + hover "Open →" arrow.

Use it as the second-tier navigation. Link from cover's quick-jump chip + section 3's "See all" link.

---

## Phase 8 — Scenarios auto-play route

`/scenarios` is the wow surface. Dark `ink` background. Auto-advance every 9 seconds with a thin progress bar. Pause toggle in top bar.

### Layout

- Top bar: back link + play/pause + "01 / 04" counter
- Big scenario number + product-relationship eyebrow ("SCENARIO 01 · A + B")
- Headline (the scenario title)
- Subtitle (the one-liner result)
- Three-column body: LEFT (product A side, orange tint), CENTER (event log with mono labels + arrows showing direction), RIGHT (product B side, blue tint)
- "WIRE" footer callout explaining the data exchange
- Scenario tab strip at bottom (auto-advance pauses on click)
- Prev/Next + keyboard hints

### Scenario data shape

```typescript
type Scenario = {
  id: string
  number: string         // "01", "02"
  icon: typeof UserPlus
  title: string
  subtitle: string
  flowAnimation: { from, to, label }[]   // event log entries
  productASteps: Step[]
  productBSteps: Step[]
  dataExchanged: string
}
```

Default to 3-4 scenarios. Pick scenarios that span: a creation event, a sync event, and a completion event.

---

## Phase 9 — Vercel deploy

After the deck is verified locally on `pnpm exec vite dev`:

```bash
# Set the Nitro preset for Vercel
# in vite.config.ts: nitro: { preset: process.env.VERCEL ? "vercel" : undefined }

# vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "VERCEL=1 pnpm build",
  "installCommand": "pnpm install --frozen-lockfile=false",
  "framework": null,
  "env": { "SKIP_ENV_VALIDATION": "1" }
}

# Skip Sentry copy in build
# package.json build: "vite build && (cp instrument.server.mjs .output/server 2>/dev/null || true)"

# Verify build locally
VERCEL=1 pnpm build

# Link + deploy
vercel link --scope <team> --project <slug> --yes
vercel --prod --yes --scope <team>
```

### Common deploy issues

- **SSO protection blocks public URLs**: disable per-project via API
  ```bash
  curl -X PATCH "https://api.vercel.com/v9/projects/$PID?teamId=$TEAM" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"ssoProtection":null}'
  ```
- **Auto-aliased to old name after rename**: `vercel alias rm old.vercel.app --yes` then `vercel alias set new-deploy.vercel.app new-name.vercel.app`
- **Project rename**: no CLI command, use API `PATCH /v9/projects/{id}` with `{"name":"new-name"}`. Update `.vercel/project.json` locally afterward.

### Repo settings

- **Always private** for client work. `gh repo create [org]/[slug] --private`.
- Deploy URL stays public (that's the artifact). Don't conflate the two.
- Disconnect any auto-deploy GitHub link if the repo origin is the wrong source.

---

## Tech gotchas (read these before debugging)

### 1. `motion` `whileInView` doesn't fire reliably with scroll-snap + SSR

Use `initial={false}` + `animate={{...}}` instead. The whileInView pattern triggers an IntersectionObserver that doesn't resolve cleanly with html-level scroll-snap. Result: opacity sticks at 0 forever after SSR hydration.

**Wrong**:
```tsx
<motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} />
```

**Right**:
```tsx
<motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} />
```

If you need scroll-triggered animation specifically, use a custom IntersectionObserver pointed at the section root.

### 2. recharts is broken on React 19 + Vite 8

Error: `require_isUnsafeProperty is not a function`. Don't waste time debugging. Use inline SVG charts. The two recharts charts we needed (donut + bar) are simpler as hand-rolled SVG anyway and look more crafted.

### 3. scroll-snap goes on html/body, not a fixed inner container

If you put `overflow-y-auto` + `scroll-snap-type` on a fixed-height `<div>`, motion's whileInView observer (which defaults to window) never sees anything as "in view." Symptoms: blank sections, active dot updates but content invisible.

Fix: put scroll-snap on `html, body` (via a `<style>` tag if needed) and let the page scroll naturally.

### 4. TanStack Start dynamic routes

`module.$slug.tsx` is the file convention. Access slug via `Route.useParams()`. Throw `notFound()` from `@tanstack/react-router` if the slug doesn't exist in your data.

```tsx
export const Route = createFileRoute("/module/$slug")({ component })
function component() {
  const { slug } = Route.useParams()
  const module = getModule(slug)
  if (!module) throw notFound()
  return <ModulePage module={module} />
}
```

### 5. TanStack Router auto-regenerates `routeTree.gen.ts`

Don't edit it. Just save a new route file and Vite picks it up. If something's off, restart vite.

---

## Voice rules (the lessons we paid for)

These came from a CEO review of the original deck. Follow them.

### Tone

- **Technical and product language, NOT marketing/sales jargon.** "Built on the central database" beats "powered by the IFPG growth engine."
- **No em-dashes** (`—`). Use periods, commas, hyphens, or just break sentences. Em-dashes read as marketing voice.
- **No FOMO oversell.** No "must do this week", "the window closes soon", "we'll redirect capacity." Soft-pedal urgency.
- **"Safe and low-risk development path"** beats "purpose-built, zero risk."
- **No exclamation marks**. None.

### Framing

- This is a **"plan and roadmap"**, NEVER a "pitch." Even in file names, URLs, headers. The word "pitch" implies persuasion; "plan and roadmap" implies professionalism.
- **Don't surface code-stack differences as a story.** Even if two products use different stacks, don't position that as a tradeoff or evolution. Frame it as "we had this plan from the beginning."
- **"Assigned from [agency]"** not "hired for." Hiring is the agency's problem; assignment is what the client sees.
- **"Clarifications we asked"** not "questions you asked." Frames you as proactive.
- **Client's existing engagement is sacred.** Always reconcile: "the X engineers you already approved continue."

### Data integrity

- **Never fabricate stats.** If you can't cite the source, omit the number. The CEO will catch invented numbers and your credibility takes a permanent hit.
- **Anchor numbers to dates or sources.** "since October 2025" beats "for 18 months" because the date is verifiable.
- **Estimates are explicitly estimates.** "Roughly 70% reuse" or "judgment call" — never "we measured 70%."

### Format

- Sections that ONLY say what's bad (Problem section) often hurt the deck. Erman cut it from IFPG. Default to skipping unless the client benefits from seeing pain framed.
- The "Reuse claim" section that compares old-stack-vs-new-stack — often skip. It surfaces code differences the client doesn't want to think about.

### Repo + deploy

- Default new repos to **PRIVATE** for client work. The deploy URL is the share artifact.
- Don't put "pitch" in any user-facing string. URL, page title, back-link labels — all "plan."

---

## Discovery question prompts (copy-paste ready)

When you run AskUserQuestion calls, here are the questions in the right shape:

### Q1 — Identity bundle

```
1. Who's this plan for? (client name, audience)
   Options: Client X · Internal board · Partner Y · Other

2. Product / project name and short tagline?
   (free-text — capture exactly)

3. Subtitle framing?
   Options:
   - "Development plan and roadmap" (Recommended)
   - "v1 plan"
   - "Proposal"
   - "Strategy review"

4. Signature — who's the team?
   (free-text — e.g. "Solverhood team", "Aman + Erman, Solverhood")
```

### Q2 — Scope bundle

```
1. How many v1 modules / surfaces?
   Options: 6 · 8 · 10 · 12 · custom

2. Phases?
   Options:
   - v1 / v1.5 / v2 (Recommended — gives strategic phasing)
   - Phase 1 / Phase 2 / Phase 3
   - MVP / Beta / GA
   - Custom labels

3. Existing markdown content?
   Options:
   - Yes, in this dir: [path]
   - No, build from scratch via Q&A
   - Partial — I'll paste excerpts

4. Sensitivities to AVOID surfacing?
   (free-text — examples: "don't surface stack differences", "no dollar amounts",
    "don't reference [competitor]")
```

### Q3 — Brand + deploy bundle

```
1. Brand palette?
   Options:
   - Default: navy + royal + orange CTA + gold (Recommended)
   - Custom (I'll provide hex codes)

2. Deploy target?
   Options:
   - Vercel under [team] (Recommended)
   - Cloudflare Pages
   - Self-hosted
   - Skip deploy, local only

3. Repo?
   Options:
   - Create new private repo under [org] (Recommended)
   - Use existing repo at [path]
   - No repo, just files
```

---

## Anti-patterns (do NOT do these)

- Don't write any actual numbers (durations, percentages, counts) unless they're from a verified source or a user-confirmed estimate. Cite or omit.
- Don't include a Problem section that lists everything broken about the client today. Optional, often cut.
- Don't position "code reuse" as a story unless the client explicitly cares.
- Don't write "pitch" in any user-visible string. The artifact is a "plan and roadmap."
- Don't auto-pick a Vercel URL without confirming with the user. Project name = URL.
- Don't make the GitHub repo public on first create. Default private.
- Don't use marketing copy ("revolutionary", "game-changing", "synergy", "unlock"). The audience reads it as cheap.
- Don't ship without disabling Vercel SSO protection if the project's parent team has it on. Test with curl from outside.
- Don't use em-dashes in copy. Use periods.
- Don't include a "The Ask" section with 3+ items. Two max, both soft.
- Don't add a deadline to the close section.
- Don't put "Live · running" on a product that's still in feedback rounds. Use accurate status badges ("Final adjustments · 2-3 weeks remaining" vs "Next phase · ships [date]").

---

## What "good" looks like

The deck is good when:

- The client's senior people can scroll through it in 5 minutes and walk away with the v1 scope memorized.
- Every claim is sourced or labeled as a judgment.
- The deck reads the same as a finished consulting deliverable — no "we're proposing", just "here's what we'll do."
- The visual feels premium without being flashy. No parallax, no scroll-jacking, no auto-playing video.
- Module deep-dives let a curious reader drill down without losing the main thread.
- The scenarios route lets non-technical stakeholders see the cross-product story in 30 seconds.

---

## Outputs the agent produces at the end

When you've finished:

1. The live URL (`{slug}.vercel.app`)
2. The private GitHub repo URL
3. A list of every change made vs the user's initial brief
4. Memory entries for any new lessons learned

Confirm all four before declaring done.

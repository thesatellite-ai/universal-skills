# EXAMPLES — working reference implementation

These files are lifted **verbatim** from the IFPG Hub plan-and-roadmap site that shipped to https://ifpg-hub-plan.vercel.app. They are not pseudocode or illustration. Every file here is production-tested code that works end-to-end.

When you build a new plan-and-roadmap site, use this directory as the **reference implementation to clone**. Copy the file, rename what's client-specific, swap the content data. Don't rewrite from scratch.

## What's where

```
EXAMPLES/
├── README.md (this file)
├── DEPS.md                          # exact deps to install + commands
├── lib/
│   ├── pitch-data.ts                # ALL deck content as data
│   ├── module-data.ts               # module objects + helpers
│   └── utils.ts                     # cn() helper
├── styles.css                       # Tailwind import + brand tokens + animations
├── components/pitch/
│   ├── deck-shell.tsx               # topbar + side-dot nav + keyboard handler
│   ├── section.tsx                  # Section primitive + Eyebrow/Headline/Lede/BigStat
│   ├── module-page.tsx              # /module/$slug shared template
│   ├── module-mocks.tsx             # 7 CSS-only browser-chromed mockups
│   └── sections/
│       ├── 01-cover.tsx             # dark hero, grid + glow, signature chips
│       ├── 02-problem.tsx           # OPTIONAL — often cut
│       ├── 03-solution.tsx          # clickable v1 module tiles
│       ├── 03b-ecosystem.tsx        # two-product split-screen + 3 scenarios tabs
│       ├── 04-architecture.tsx      # central DB foundation + product cards
│       ├── 05-reuse.tsx             # OPTIONAL — often cut (donut + bars)
│       ├── 06-scope.tsx             # interactive v1/v1.5/v2 toggle + bars
│       ├── 07-features.tsx          # accordion of clarification Q&As
│       ├── 08-timeline.tsx          # inline-SVG gantt with date axis + GA flag
│       ├── 09-team.tsx              # squad grid + total FTE + promise card
│       ├── 10-risks.tsx             # 3×3 heatmap + hover-to-detail
│       ├── 11-fomo.tsx              # 3 timing-rationale cards (no fabricated stats)
│       ├── 12-ask.tsx               # 2-step next-steps cards + info callout
│       └── 13-close.tsx             # soft thank-you + Solverhood signature
├── routes/
│   ├── __root.tsx                   # page title, Poppins font, Toaster
│   ├── index.tsx                    # orchestrator — imports all sections
│   ├── modules.tsx                  # module catalog grouped by phase
│   ├── module.$slug.tsx             # dynamic deep-dive route
│   └── scenarios.tsx                # auto-play split-screen walkthrough
└── config/
    ├── vite.config.ts               # nitro preset wired for Vercel
    └── vercel.json                  # buildCommand + framework: null
```

## How to use these

### If you're scaffolding a fresh project

1. Run `pnpm create @tanstack/start@latest` to scaffold a base TanStack Start project (or clone the khanakia boilerplate from `analyzify/sync_tanstack` style)
2. Install dependencies from `DEPS.md`
3. Copy `styles.css` to `src/styles.css`
4. Copy `lib/` → `src/lib/`
5. Copy `components/pitch/` → `src/components/pitch/`
6. Copy `routes/*` → `src/routes/`
7. Replace `config/vite.config.ts` → `vite.config.ts` (preserve any project-specific plugins)
8. Replace `vercel.json`
9. Edit `lib/pitch-data.ts` and `lib/module-data.ts` to match the actual client's content
10. Update brand tokens in `styles.css` if the palette differs from default navy/orange
11. Run `pnpm exec vite dev --port 3939` to verify locally
12. Follow the deploy steps in SKILL.md Phase 9

### If you're adapting to an existing project

Same idea, but be careful with naming conflicts. The skill assumes file paths in `src/lib/pitch-data.ts`, `src/components/pitch/sections/`, etc. If the target project has different conventions, adapt the imports.

## Client content swap checklist

When porting these files to a new client, every file needs at least one of these client-specific things replaced. Use this list as a checklist:

### `lib/pitch-data.ts`
- [ ] `sections` array — adjust section list (skip Problem / Reuse if desired)
- [ ] `meta.productName` — your product name
- [ ] `meta.tagline` — "Development plan and roadmap" or custom
- [ ] `meta.byline` — "Solverhood team" or your agency
- [ ] `meta.deadline` — soft framing, no hard ultimatums
- [ ] `currentSystems`, `problemStats` — only if including Problem section
- [ ] `platformLayers`, `reuseSplit`, `huBuildingBlocks` — only if including Reuse / specific architecture story
- [ ] `scopePhases.v1.features` — list of v1 features
- [ ] `scopePhases.v1.5.features` — list of v1.5 features
- [ ] `scopePhases.v2.features` — STRATEGIC THEMES, not vendor names
- [ ] `featureAnswers` — Q&As you asked the client to clarify
- [ ] `sprints` — gantt chart sprints with deliverables
- [ ] `timelineDates` — gantt date axis
- [ ] `squad` — team members + FTEs + sources ("Assigned from [agency]")
- [ ] `risks` — risk register with mitigation per item
- [ ] `timingPoints` — timing rationale, no fabricated numbers
- [ ] `asks` — soft next-steps, max 2
- [ ] `closeContact` — signature + soft sign-off
- [ ] `headlineNumbers` — keep accurate to the plan

### `lib/module-data.ts`
- [ ] Replace all modules with the actual client's module surfaces
- [ ] Each v1 module needs: name, tagline, description, hero, 3-4 flows, dataShape, integrations, crossProduct, ifpgBenefit (rename to "clientBenefit")
- [ ] v1.5 / v2 modules can be lighter (just hero + description)
- [ ] `base44Page` is optional — only if there's a prototype to compare to
- [ ] Drop the `IFPG` references in comments

### `styles.css`
- [ ] Brand colors if customizing palette (keep shadow alpha tint)
- [ ] `.sidebar-gradient` if using one
- [ ] Status badge classes stay generic

### `routes/__root.tsx`
- [ ] `<title>` — "{Product} · Development plan and roadmap"
- [ ] `<meta description>` — concise

### Section copy
- [ ] Every section has hard-coded copy you need to rewrite for the new client
- [ ] Pay special attention to section 03 (surfaces grid), 04 (architecture),
      09 (team), 13 (close)
- [ ] Replace IFPG references throughout

## What NOT to change

- The Section primitive's tone variants — `light` / `navy` / `cream` / `ink` are the bedrock
- The DeckShell keyboard map + IntersectionObserver pattern
- The mockup component shapes in `module-mocks.tsx`
- The motion `initial={false}` + `animate=` pattern (NEVER switch to whileInView)
- The inline SVG charts (donut, bar, gantt) — recharts breaks on React 19
- The scroll-snap on html/body declaration
- The navy-tinted shadow alphas (the signature premium move)

## File-by-file notes

### `lib/pitch-data.ts` (highest churn — most editing on each new project)

Single source of truth for every section's content. Sections array drives the DeckShell side-nav. The `meta` object drives the cover slide. Edit this file heavily for each client.

### `lib/module-data.ts` (high churn)

Modules drive `/module/$slug` deep-dives AND the `/modules` index. Each module has 7 fields that are content-heavy. v1 modules deserve full treatment; v1.5/v2 can be lighter. Strategic themes for v2 (no specific vendor names).

### `styles.css` (low churn — tokens + utility classes)

Edit only the brand color block if the client's palette differs. Everything else (shadows, animations, gradients) is the framework.

### `components/pitch/section.tsx` (zero churn — primitive)

Don't edit unless adding a new tone or typography level.

### `components/pitch/deck-shell.tsx` (zero churn — shell)

Don't edit unless adding new nav items (e.g. extra route in the topbar).

### `components/pitch/module-page.tsx` (zero churn — template)

The whole module page renders from data. Don't touch the layout; edit module-data.ts to change content.

### `components/pitch/module-mocks.tsx` (zero churn — visual library)

7 mockup variants cover most needs. If you need a new mockType (e.g. "chart" or "map"), add a new function here + extend the `mockType` union in module-data.ts.

### `components/pitch/sections/*.tsx` (medium churn — section logic)

Some sections (01 cover, 03 solution, 09 team, 13 close) have hard-coded copy inside the JSX that needs updating per client. Other sections are pure data-driven (06 scope, 07 features, 08 timeline, 09 team data) — those only need pitch-data.ts edits.

Where copy is hard-coded, look for english strings inside `<Headline>`, `<Lede>`, and `<Eyebrow>` and update.

### `routes/__root.tsx` (low churn)

Only `<title>` and `<meta description>` change per client.

### `routes/index.tsx` (low churn — orchestrator)

If you skip sections (Problem, Reuse), remove their imports and JSX references. Match against the `sections` array in pitch-data.ts.

### `routes/modules.tsx` (zero churn)

Data-driven from module-data.ts. Don't edit.

### `routes/module.$slug.tsx` (zero churn)

Wrapper around the ModulePage component. Don't edit.

### `routes/scenarios.tsx` (medium churn — scenario content)

Scenarios are defined INLINE in this file (not in pitch-data.ts). When porting, edit the `scenarios` const at the top. 3-4 scenarios is the sweet spot. Pick scenarios that span creation, sync, and completion events across both products.

### `config/vite.config.ts` (one-line edit)

The `nitro.preset` line is the magic. Set it to `"vercel"` for Vercel deploys, otherwise `undefined` for local dev. Already wired here.

### `config/vercel.json` (zero churn)

Works for any TanStack Start project deploying to Vercel.

## Sanity check after porting

After you've copied + edited, verify:

```bash
pnpm install
pnpm exec vite dev --port 3939
# Open http://127.0.0.1:3939/
# Press ↓ → cycle through all sections
# Click any module tile → /module/$slug renders cleanly
# Navigate to /modules and /scenarios
# Press Cmd+P → don't bother, print is not supported
```

If any section renders blank, you have a `motion` `whileInView` somewhere. Replace with `initial={false}` + `animate={...}`. Every time.

If a route returns 200 but content is blank, check the browser console. Recharts errors mean you imported it back accidentally. Use inline SVG.

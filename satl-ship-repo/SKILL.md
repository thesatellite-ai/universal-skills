---
name: satl-ship-repo
description: >-
  Orchestrator for launching/polishing an open-source repo to a consistent
  "ready to show the world" bar. Reads one brand.json manifest and runs the
  satl launch skills in order: brand assets, README (logo + SEO + pitch), OSS
  hygiene files (LICENSE/CONTRIBUTING/CHANGELOG/etc.), GitHub repo metadata,
  and (for thesatellite-ai projects) the khanakia.com/apps card. Triggers when
  the user says: "ship this repo", "launch this project", "polish this repo",
  "make this repo presentable / release-ready / open-source-ready", "do the
  whole branding + readme + license pass", "set up brand.json", or names a new
  repo to bring up to standard. Use this when the user wants the FULL pass; for
  one piece, invoke the specific satl-* skill directly.
argument-hint: "[init|run|status] — init writes brand.json; run executes all phases; status shows what's done"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - AskUserQuestion
---

# satl-ship-repo

The one command that takes a bare repo to a consistent, professional, open-source-ready state — the same bar every time, with no re-deciding the basics per project. It is a **thin orchestrator**: it owns the manifest and the order of operations, and delegates the actual work to the focused `satl-*` launch skills.

**Why this exists:** we kept hand-doing the identical launch checklist for every new repo (lore, agentop, filemark, …) — logo, palette, asset export, README header, pitch, SEO, LICENSE, CONTRIBUTING, CHANGELOG, GitHub About/topics, and the khanakia.com/apps card. Done by hand each time, the steps drift and something always gets forgotten. This skill makes the checklist a single, repeatable, manifest-driven pass.

## The model

```
brand.json   ← the single source of truth (decided ONCE, at the repo root)
   │
   ├─ satl-brand-kit         → visual identity + assets + tokens
   ├─ satl-readme-pro        → README: logo header, SEO, pitch, FAQ
   ├─ satl-oss-scaffold      → LICENSE, CONTRIBUTING, CHANGELOG, CoC, SECURITY, .github
   ├─ satl-repo-meta         → GitHub About, topics, homepage, social-preview prep
   └─ satl-ship-to-khanakia  → add the app card to khanakia.com/apps
                               (project-local: lives in the khanakia_com_tanstack repo
                                at .claude/skills/, NOT in this universal collection)
```

Each sub-skill reads the same `brand.json`, so name / tagline / color / fonts / license / topics are answered once and reused everywhere. No sub-skill re-asks what the manifest already states.

## Modes

### `init` — write the manifest

If `brand.json` is missing, create it. Read the repo first (README, `go.mod`/`package.json`/`Cargo.toml`, any `assets/`), pre-fill what you can infer, then ask the user ONLY for what you can't (use `AskUserQuestion` for: brand color/concept, primary audience, named alternatives). Validate against `brand.schema.json` (next to this file). Never invent positioning — pull it from the user.

Minimum viable manifest:

```jsonc
{
  "name": "lore",
  "tagline": "Give your AI coding agent a memory.",
  "description": "Local-first memory & context CLI for AI coding agents …",
  "repo": "thesatellite-ai/lore",
  "language": "go",
  "kind": "cli",
  "license": "Apache-2.0",
  "brand": { "concept": "strata+orbit", "color": "emerald",
             "tile": ["#10B981", "#047857"], "fg": "#FFFFFF", "accent": "#A3E635" },
  "fonts": { "display": "Space Grotesk", "sans": "Inter", "mono": "JetBrains Mono" }
}
```

### `run` — execute all phases

Run the sub-skills **in this order** (later phases depend on earlier outputs). After each phase, summarize what changed; do not commit unless the user asked.

1. **satl-brand-kit** — needs `brand.*`, `fonts`. Produces `brand/` (icons, favicon, wordmark, lockups, OG, tokens). Other phases reference these paths.
2. **satl-readme-pro** — needs the brand assets (for the header) + `positioning`. Produces the polished README. Delegates the pitch copy to `satl-frontend-pitch` / `satl-homepage-positioning` when deeper positioning work is needed.
3. **satl-oss-scaffold** — needs `license`, `author`, `repo`. Produces LICENSE + community files.
4. **satl-repo-meta** — needs `repo`, `description`, `topics`, `homepage`. Sets GitHub About/topics via `gh`; preps the 1280×640 social-preview image from the brand kit.
5. **satl-ship-to-khanakia** — only if `khanakia.addToApps` and the repo is a thesatellite-ai project. Adds the `/apps` card in the khanakia_com_tanstack repo. This is a **project-local skill** that lives in that repo at `.claude/skills/satl-ship-to-khanakia/` (not in the universal collection); invoke it when working there.

> Phases are idempotent: re-running updates in place. Skip a phase if its outputs already exist and the manifest is unchanged, unless the user says "redo".

### `status` — what's done

Report a checklist: manifest present? `brand/` populated? README has logo header + FAQ? LICENSE/CONTRIBUTING/CHANGELOG present? GitHub About/topics set (`gh repo view`)? `/apps` card present? Show ✅/❌ per item so the user sees the gap.

## Rules

- **Manifest first.** If `brand.json` is absent, run `init` before anything else. Every other skill assumes it exists.
- **Never commit without being asked.** Produce the files; let the user review. (House rule across these repos.)
- **Don't silently skip.** If a phase can't run (no `gh` auth, no raster tool, missing positioning), say so and continue with the rest.
- **One render per phase.** Don't interleave; finish a phase, summarize, move on.
- **Respect existing content.** README/CHANGELOG edits preserve what's already there (see each sub-skill's lossy-diff rule).

## See also

Each phase is a standalone skill you can invoke directly when you only need one piece: `satl-brand-kit`, `satl-readme-pro`, `satl-oss-scaffold`, `satl-repo-meta` (all in this universal collection), and `satl-ship-to-khanakia` (project-local, in the `khanakia_com_tanstack` repo). This skill just runs them as a set.

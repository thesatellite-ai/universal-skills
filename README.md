# universal-skills

**An open-source library of portable agent skills for AI coding assistants.**

Drop-in `SKILL.md` capabilities for Claude Code, Cursor, Codex, Copilot, Windsurf, Gemini, and Cline — research closing, prompt engineering, context handoff, README/SEO, brand kits, repo launch, and more.

[![18 agent skills](https://img.shields.io/badge/skills-18-2563eb)](https://github.com/thesatellite-ai/universal-skills) [![Install via skills.sh](https://img.shields.io/badge/install-skills.sh-2563eb)](https://www.skills.sh/) ![Works with Claude Code, Cursor, Codex, Copilot, Gemini](https://img.shields.io/badge/works%20with-Claude%20Code%20·%20Cursor%20·%20Codex%20·%20Copilot%20·%20Gemini-2563eb) ![satl- namespace](https://img.shields.io/badge/namespace-satl---2563eb) [![GitHub stars](https://img.shields.io/github/stars/thesatellite-ai/universal-skills?style=social)](https://github.com/thesatellite-ai/universal-skills/stargazers)

**universal-skills** is a growing, open-source collection of **agent skills** — reusable, model-agnostic instruction modules that extend AI coding agents with new, dependable capabilities. Each skill is a self-contained `SKILL.md` (YAML frontmatter + instructions) that loads on demand, so you can teach **Claude Code**, **Cursor**, **Codex**, **GitHub Copilot**, **Windsurf**, **Gemini**, **Cline**, and other LLM agents to do real work — close research into decisions, engineer prompts, write a `CLAUDE.md`, generate a brand kit, or take a bare repo to open-source-ready — without re-explaining the workflow every session. Every skill is namespaced with the `satl-` prefix so the library scales to thousands without name collisions.

## Table of contents

- [Why universal-skills?](#why-universal-skills)
- [Install](#install)
- [Skills](#skills)
  - [satl-research-closer (featured)](#satl-research-closer)
  - [All skills](#all-skills)
  - [Repo launch family](#repo-launch-family)
- [FAQ](#faq)
- [Conventions](#conventions)

## Why universal-skills?

An **agent skill** is the highest-leverage way to make an AI coding assistant reliable: instead of re-prompting the same workflow every session, you encode it once as a `SKILL.md` and the agent invokes it by name. universal-skills is a curated, battle-tested set of those modules — written for real work, not demos — that works across every major agent because it's plain markdown, not a vendor plugin.

- **Portable across agents** — one skill format works with Claude Code, Cursor, Codex, Copilot, Windsurf, Gemini, and Cline.
- **Self-contained** — each skill is a directory with a `SKILL.md`; no cross-skill imports, no runtime, no lock-in.
- **One-command install** — add the whole collection (or browse and pick) via the open-source `skills` CLI from [skills.sh](https://www.skills.sh/).
- **Namespaced to scale** — the `satl-` prefix avoids collisions as the library grows to thousands of skills.
- **Opinionated and tested** — skills like `satl-research-closer` and `satl-code-standards` encode hard-won workflows, not generic advice.
- **AI-SEO aware** — README and repo skills (`satl-readme-pro`, `satl-repo-meta`) are built to rank in Google and get cited by AI Overviews / LLM answers.

| | **universal-skills** | Copy-paste prompts | Vendor-locked plugins | DIY per project |
|---|---|---|---|---|
| Works across multiple agents | ✅ | ⚠️ | ❌ | ⚠️ |
| Invoked by name, on demand | ✅ | ❌ | ✅ | ⚠️ |
| One-command install / update | ✅ | ❌ | ✅ | ❌ |
| No runtime / no lock-in | ✅ | ✅ | ❌ | ✅ |
| Versioned & shareable | ✅ | ⚠️ | ✅ | ❌ |

If you just want a one-off prompt, paste a prompt. If you want repeatable, named, cross-agent capabilities you install once and reuse everywhere — that's universal-skills.

## Install

Via [skills.sh](https://www.skills.sh/) (the open-source `skills` CLI):

```bash
# install the whole collection
npx skills add thesatellite-ai/universal-skills

# or browse first
npx skills
```

Then restart your agent (or reload skills) and invoke a skill by its frontmatter `name`.

## Skills

### `satl-research-closer`

**A research-closer, not a decision oracle.** Turns scattered research, AI-agent dumps, and markdown planning docs into one decision graph and forces closure.

- **Use it when:** you're drowning in research/planning files, re-prompting agents instead of deciding, have a folder of `*.md` that never converges, or ask "what did we decide / why / what's still open".
- **What it does:** ingests the dump → shapes it into an IBIS graph (questions / options / findings) → builds an ACH disconfirmation matrix (the surviving option is the *least-killed*, not the most-supported) → applies a forcing function (decide-now / genuinely-open / defer-to-user) → appends an immutable decision log.
- **What it won't do:** fabricate a decision where there is none (catalogs, memory, settled facts → filed as reference, not shaped), or decide taste/low-info/reversible calls for you (it tells you to just decide).
- **Hardened on five axes:** close · refuse · defer · partition · cross-source contradiction detection.

→ [`satl-research-closer/`](satl-research-closer/)

### All skills

Each skill links to its directory, which contains a `SKILL.md` plus a `README.md` explaining why it exists and what problem it solves.

| Skill&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | What it does |
|---|---|
| [`satl-research-closer`](satl-research-closer/) | Turn scattered research / AI-agent dumps / planning docs into one IBIS + ACH decision graph and force closure. (Featured above.) |
| [`satl-prompt-builder`](satl-prompt-builder/) | Prompt-engineering expert mode — build / refine / critique / diff prompts. Returns copy-paste-ready prompts with rationale, failure modes, variants. |
| [`satl-persist-context`](satl-persist-context/) | Before a session ends, persist context: update CLAUDE.md, memory, changelog; show diffs for confirmation. |
| [`satl-save-verbatim`](satl-save-verbatim/) | Save the previous assistant message to a file byte-for-byte — no edits, no wrapping. |
| [`satl-ai-context`](satl-ai-context/) | Generate a `CLAUDE.md` for a codebase so a fresh agent works without verbal explanation (incl. a what's-NOT-implemented section). |
| [`satl-features-registry`](satl-features-registry/) | In repos with a feature registry, patch the registry in the same turn you build/change a feature. |
| [`satl-session-os`](satl-session-os/) | Run session/decision/incident logging in the background — start, corrections, decisions, mistakes, end. |
| [`satl-filemark-docs`](satl-filemark-docs/) | Author internal docs (plans/ADRs/specs/.ai) with filemark component grammar via the `/filemark` skill. |
| [`satl-context-handoff`](satl-context-handoff/) | Produce a single self-contained handoff/runbook doc so a fresh agent can resume, reverse, or repeat a multi-step task with zero knowledge loss. |
| [`satl-frontend-pitch`](satl-frontend-pitch/) | Build a premium interactive "plan & roadmap" pitch deck as a real React app (TanStack Start + Tailwind + motion). Ships with full example sources. |
| [`satl-homepage-positioning`](satl-homepage-positioning/) | Diagnose + rewrite a product homepage / landing page for conversion using the Fletch PMM method (distilled from ~18 before/after teardowns) — diagnosis rubric, hero copy options, section-by-section spec, before→after annotations. |
| [`satl-replay-checklist`](satl-replay-checklist/) | Distill a session's recurring tasks, gotchas, and verification commands into a reusable project-type playbook a future session can replay — kills re-learning on sister projects. |
| [`satl-code-standards`](satl-code-standards/) | The standing engineering bar for every code change — four universal, stack-agnostic pillars: full type safety, zero hardcoded strings, context-dense comments, modular/importable structure. Points to project stack skills for concrete libraries. |

### Repo launch family

A set of skills that take a bare repo to a consistent, open-source-ready state, all reading one per-repo `brand.json` manifest. Run them together via [`satl-ship-repo`](satl-ship-repo/), or invoke any one directly. Each ships its own `README.md` explaining its purpose.

| Skill&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | What it does |
|---|---|
| [`satl-ship-repo`](satl-ship-repo/) | **Orchestrator.** Reads `brand.json` and runs the launch skills below in order (brand → readme → oss files → repo metadata → khanakia card). Use for the full pass; `init` writes the manifest, `status` audits what's done. |
| [`satl-brand-kit`](satl-brand-kit/) | Generates the full visual identity from the manifest: glyph concepts + palettes, every icon variant (color/dark/light/mono), favicon set, wordmark, lockups, light+dark OG covers, and design tokens — from one generator script. |
| [`satl-readme-pro`](satl-readme-pro/) | Turns a README into an SEO-ready landing page: logo header + badges, keyword-rich intro, "Why this?" pitch + comparison table, FAQ tuned for AI/Google, keyword footer — preserving every existing section. Delegates deep positioning to [`satl-homepage-positioning`](satl-homepage-positioning/). |
| [`satl-oss-scaffold`](satl-oss-scaffold/) | Scaffolds the OSS hygiene files filled from the manifest: LICENSE (Apache-2.0 default), CONTRIBUTING, CHANGELOG, CODE_OF_CONDUCT, SECURITY, `.github/` templates, FUNDING, `.editorconfig`, `.gitattributes`, `llms.txt`. |
| [`satl-repo-meta`](satl-repo-meta/) | Sets GitHub discoverability metadata via `gh`: About description, topics, homepage; and preps the 1280×640 social-preview image. |

> A sixth, project-specific step — adding the project to **khanakia.com/apps** — is not part of this universal collection. It lives in the `khanakia_com_tanstack` repo at `.claude/skills/satl-ship-to-khanakia/`, and `satl-ship-repo` runs it only when working in that repo.

## FAQ

**What is an "agent skill"?** A skill is a self-contained instruction module — a directory with a `SKILL.md` (YAML frontmatter giving it a `name` and `description`, plus markdown instructions) — that an AI coding agent loads on demand and invokes by name. It teaches the agent a repeatable workflow so you don't re-explain it every session.

**Which AI agents does universal-skills work with?** Any agent that reads the `SKILL.md` skill format — including Claude Code, Cursor, Codex, GitHub Copilot, Windsurf, Gemini, and Cline. The skills are plain markdown with no runtime, so they're portable rather than tied to one vendor.

**How do I install it?** Run `npx skills add thesatellite-ai/universal-skills` to add the whole collection, or `npx skills` to browse and pick — via the open-source `skills` CLI at [skills.sh](https://www.skills.sh/). Then reload your agent and call a skill by its frontmatter `name`.

**Do I need an API key or a paid plan?** No. The skills are markdown files in your repo or skills directory. You only need an AI agent that supports the skill format; there's no separate service, key, or subscription for the skills themselves.

**Can I install just one skill instead of all of them?** Yes — run `npx skills` to browse and select individual skills, or copy a single skill directory (each is self-contained with no cross-skill imports).

**How is this different from copy-pasting a prompt?** A prompt is one-shot and unversioned. A skill is named, reusable across projects and agents, installed once, and updated in one place — so the workflow stays consistent every time the agent runs it.

**What does the `satl-` prefix mean?** It's a namespace. Both the skill's directory and its frontmatter `name` use `satl-` so the library can grow to thousands of skills without name collisions across collections.

**How do I add or contribute a skill?** Create a directory named `satl-<your-skill>`, add a `SKILL.md` with `name` and `description` frontmatter plus instructions, and a `README.md` explaining why it exists. Keep it self-contained — no cross-skill imports. Then open a pull request.

## Conventions

- Skill directory + frontmatter `name` both use the `satl-` prefix.
- One `SKILL.md` per skill; supporting files (and a `README.md`) allowed alongside it.
- Skills are self-contained (no cross-skill imports).

<sub>universal-skills — open-source agent skills / AI coding-assistant skills for Claude Code, Cursor, Codex, GitHub Copilot, Windsurf, Gemini, and Cline. Portable `SKILL.md` modules for prompt engineering, research synthesis, CLAUDE.md / AI context generation, brand kits, README SEO, and open-source repo launch. No runtime, no lock-in, install via skills.sh.</sub>

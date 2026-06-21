# universal-skills

A growing library of agent skills. Every skill is namespaced with the `satl-`
prefix (e.g. `satl-research-closer`) so the collection scales to thousands
without name collisions.

Each skill lives in its own directory containing a `SKILL.md` with YAML
frontmatter (`name`, `description`) plus instructions. Works with Claude Code,
Cursor, Codex, Copilot, Windsurf, Gemini, Cline, and others.

## Install

Via [skills.sh](https://www.skills.sh/) (the open-source `skills` CLI):

```bash
# install the whole collection
npx skills add thesatellite-ai/universal-skills

# or browse first
npx skills
```

Then restart your agent (or reload skills) and invoke a skill by its
frontmatter `name`.

## Skills

### `satl-research-closer`

**A research-closer, not a decision oracle.** Turns scattered research,
AI-agent dumps, and markdown planning docs into one decision graph and forces
closure.

- **Use it when:** you're drowning in research/planning files, re-prompting
  agents instead of deciding, have a folder of `*.md` that never converges, or
  ask "what did we decide / why / what's still open".
- **What it does:** ingests the dump → shapes it into an IBIS graph
  (questions / options / findings) → builds an ACH disconfirmation matrix
  (the surviving option is the *least-killed*, not the most-supported) →
  applies a forcing function (decide-now / genuinely-open / defer-to-user) →
  appends an immutable decision log.
- **What it won't do:** fabricate a decision where there is none (catalogs,
  memory, settled facts → filed as reference, not shaped), or decide
  taste/low-info/reversible calls for you (it tells you to just decide).
- **Hardened on five axes:** close · refuse · defer · partition ·
  cross-source contradiction detection.

### Other skills

| Skill | What it does |
|---|---|
| `satl-prompt-builder` | Prompt-engineering expert mode — build / refine / critique / diff prompts. Returns copy-paste-ready prompts with rationale, failure modes, variants. |
| `satl-persist-context` | Before a session ends, persist context: update CLAUDE.md, memory, changelog; show diffs for confirmation. |
| `satl-save-verbatim` | Save the previous assistant message to a file byte-for-byte — no edits, no wrapping. |
| `satl-ai-context` | Generate a `CLAUDE.md` for a codebase so a fresh agent works without verbal explanation (incl. a what's-NOT-implemented section). |
| `satl-features-registry` | In repos with a feature registry, patch the registry in the same turn you build/change a feature. |
| `satl-session-os` | Run session/decision/incident logging in the background — start, corrections, decisions, mistakes, end. |
| `satl-filemark-docs` | Author internal docs (plans/ADRs/specs/.ai) with filemark component grammar via the `/filemark` skill. |
| `satl-context-handoff` | Produce a single self-contained handoff/runbook doc so a fresh agent can resume, reverse, or repeat a multi-step task with zero knowledge loss. |
| `satl-frontend-pitch` | Build a premium interactive "plan & roadmap" pitch deck as a real React app (TanStack Start + Tailwind + motion). Ships with full example sources. |
| `satl-homepage-positioning` | Diagnose + rewrite a product homepage / landing page for conversion using the Fletch PMM method (distilled from ~18 before/after teardowns) — diagnosis rubric, hero copy options, section-by-section spec, before→after annotations. |
| `satl-replay-checklist` | Distill a session's recurring tasks, gotchas, and verification commands into a reusable project-type playbook a future session can replay — kills re-learning on sister projects. |
| `satl-code-standards` | The standing engineering bar for every code change — four universal, stack-agnostic pillars: full type safety, zero hardcoded strings, context-dense comments, modular/importable structure. Points to project stack skills for concrete libraries. |

## Conventions

- Skill directory + frontmatter `name` both use the `satl-` prefix.
- One `SKILL.md` per skill; supporting files allowed alongside it.
- Skills are self-contained (no cross-skill imports).

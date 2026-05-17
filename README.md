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

## Conventions

- Skill directory + frontmatter `name` both use the `satl-` prefix.
- One `SKILL.md` per skill; supporting files allowed alongside it.
- Skills are self-contained (no cross-skill imports).

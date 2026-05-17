# universal-skills

A growing library of agent skills for Claude Code. Every skill is namespaced
with the `satl-` prefix (e.g. `satl-research-closer`) so the collection scales
to thousands without name collisions.

Each skill lives in its own directory containing a `SKILL.md` with YAML
frontmatter (`name`, `description`) plus instructions.

## Install

Use the bundled installer:

```bash
git clone https://github.com/thesatellite-ai/universal-skills.git
cd universal-skills

./skill.sh                      # list available skills
./skill.sh satl-research-closer # install one (symlink into ~/.claude/skills)
./skill.sh all                  # install every skill
./skill.sh satl-research-closer --copy   # copy instead of symlink
DEST=/path/to/.claude/skills ./skill.sh all   # custom skills dir
```

- **Symlink (default):** the installed skill stays live — `git pull` updates it.
- **`--copy`:** detaches a pinned copy (offline / version-locked use).
- **`DEST=`:** install into a project-local `.claude/skills` instead of the
  user-global `~/.claude/skills`.

After install, restart Claude Code (or reload skills) and invoke the skill by
its `name` from the frontmatter.

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

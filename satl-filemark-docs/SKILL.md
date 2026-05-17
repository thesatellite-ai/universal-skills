---
name: satl-filemark-docs
description: >-
  Author internal docs with filemark component grammar. Use when writing or
  editing a brainstorm, plan, roadmap, ADR, architecture note, task list,
  problem doc, or component spec in a repo whose internal docs are rendered by
  filemark (Chrome extension / playground). Triggers: editing PLAN.md /
  ROADMAP.md / TASKS.md / *_ADR.md / *_SPEC.md or anything under .ai/.
---

# satl-filemark-docs

In repos whose internal docs are read through **filemark**, any internal
brainstorm / plan / problem doc / roadmap / ADR / architecture note / task
list / component spec must use filemark's component grammar. Invoke the
`/filemark` skill first — do not freehand components from memory.

## Applies to (internal, filemark-rendered)

- `.ai/**/*.md` — plans, snapshots, memory, decisions, incidents, guides,
  workflows, prompts, PATTERNS, ARCHITECTURE, STACK
- Any `PLAN.md`, `ROADMAP.md`, `TASKS.md`, `*_ADR.md`, `*_SPEC.md`

## Does NOT apply

- Public, GitHub-rendered files: `README.md`, `CLAUDE.md`, `CHANGELOG.md`,
  `CONTRIBUTING.md`, public `docs/`, per-module READMEs → keep plain markdown.
- Terminal/chat output → plain markdown/fragments, never filemark components.

## Prefer

- Callouts: `<Callout type="info|warn|danger|tip">` for rules/gotchas.
- Structure: `<Tabs>`, `<Details>`, `<ADR>` for decisions.
- Data: `<Stats>`, `<Datagrid>`, `<Chart>`, `<Kanban>`.
- Tasks: `<TaskList>`, `<TaskStats>`, `<TaskTimeline>` + sigil bullets
  (`- [ ]`, `- [>]`, `- [x]`) and the filter DSL.

## Survival rules

Blank lines around block components. No raw `<` inside prose. (The `/filemark`
skill enforces both — defer to it.)

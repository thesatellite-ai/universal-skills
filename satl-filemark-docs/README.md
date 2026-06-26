# satl-filemark-docs — purpose & use case

## Why this skill exists

In repos whose internal docs are read through **filemark** (the Chrome extension / playground), a plain-markdown brainstorm or plan renders flat — no callouts, no tabs, no task boards, no decision records. The component grammar that makes those docs useful is easy to get wrong from memory: forget a blank line around a block component or drop a raw `<` into prose and the doc breaks.

`satl-filemark-docs` is the trigger that says: this file is filemark-rendered, so author it with filemark's component grammar — and do it via the `/filemark` skill rather than freehanding components.

## What it does

- Recognizes when you're editing an **internal, filemark-rendered** doc — anything under `.ai/**`, or any `PLAN.md` / `ROADMAP.md` / `TASKS.md` / `*_ADR.md` / `*_SPEC.md` — and routes you to the `/filemark` skill first.
- Steers toward the right components: `<Callout>` for rules/gotchas, `<Tabs>` / `<Details>` / `<ADR>` for structure, `<Stats>` / `<Datagrid>` / `<Chart>` / `<Kanban>` for data, `<TaskList>` / `<TaskStats>` / `<TaskTimeline>` + sigil bullets for tasks.
- Enforces the two HTML-in-markdown survival rules: blank lines around block components, no raw `<` inside prose.

## When NOT to apply it

- Public, GitHub-rendered files — `README.md`, `CLAUDE.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, public `docs/`, per-module READMEs → keep plain markdown.
- Terminal / chat output → plain markdown, never filemark components.

## When to use it

Editing or writing a brainstorm, plan, roadmap, ADR, architecture note, task list, problem doc, or component spec in a filemark repo.

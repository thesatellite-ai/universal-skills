---
name: satl-design-spec
description: >-
  Write a project's design as a small readable site instead of one long spec: an overview of every feature on one screen (generated from the guide), a one-page "why", diagrams at a few zoom levels, one example followed step by step, a guide where every feature is problem → fix → example, a cookbook of real tasks with every file in full and the exact output, and a decisions page. Ships the `design-spec` tool that scaffolds, builds and checks it. Triggers when the user says: "design spec", "spec first", "design doc", "write the spec", "I want to see the whole design at once", "I can't understand the spec", "how will it all work", "show me how the features fit together", "cookbook", "examples for the design", "make the spec readable", "turn this long spec into something I can read", "plan a new library/app/CLI before coding". Also use to convert an existing long spec into this form. NOT for tracking work (tasks live in lore), and NOT for public product docs of something already shipped.
argument-hint: "[new|convert|update|review] — new starts a design from an idea; convert turns an existing spec into the site; update edits and rebuilds; review walks unreviewed decisions with the user"
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# satl-design-spec

Your job: give the user a design they can **understand**, not just a design that is complete. A long spec answers every question and still leaves its owner saying "I don't understand how it all works", because it mixes the pitch, the mechanism, the rules and the history in one scroll. This skill splits the design **by the question each reader is asking**, keeps every piece short, and shows real snippets everywhere.

## The method, and why

Every team that designs well separates the layers. Amazon writes the press release first (why). Rust RFCs split a **guide-level** explanation (teach it with examples) from a **reference-level** one (exact rules). The C4 model draws the system at zoom levels. Specification by Example makes concrete input → output pairs the spec itself. This skill is those ideas, in one site:

| Page | Answers | Source file |
|---|---|---|
| **Overview** | "What is in it?" — every feature on one screen; select one for its problem, fix and example | generated from `guide.md` |
| **Why** | "What is this and who is it for?" — written as if already shipped | `why.md` |
| **Picture** | "How do the parts fit?" — the system at 2–3 zoom levels, then the roadmap | `picture.html` |
| **How it works** | "What actually happens?" — ONE example followed through every step | `how-it-works.html` |
| **Guide** | "How do I use feature X?" — every feature: problem, fix, example, a few notes | `guide.md` |
| **Cookbook** | "How do the features work together?" — real tasks, every file in full, the exact output | `cookbook.md` |
| **Rules** (optional) | "What exactly happens when…?" in plain words — every edge-case rule as problem → fix → one snippet, grouped by area | `rules.md` |
| **Decisions** | "Why is it like this?" — principles, big decisions, who decided, what was rejected | `decisions.md` |
| **Full spec** (optional) | "What exactly happens when…?" — the long reference, if one exists | linked via `site.json` `spec` |

The overview is **generated from the guide**, so the summary and the detail can never disagree. A long `SPEC.md`, if the project has one, stays as the reference; the site is the readable layer above it and links into it.

## The tool

`design-spec` ships beside this file (stdlib python3). Use the skill directory's copy, e.g. `~/.claude/skills/satl-design-spec/design-spec`.

```bash
design-spec init  docs/design --name "envcheck"   # scaffold docs/design/src + style.css
design-spec build docs/design                     # write docs/design/*.html
design-spec check docs/design                     # everything missing, as file:line; exit 1 if any
```

Add a Taskfile task on first use:

```yaml
vars:
  DESIGN_SPEC: '{{.HOME}}/.claude/skills/satl-design-spec/design-spec'
tasks:
  docs:
    desc: Rebuild the design site
    cmds: ['"{{.DESIGN_SPEC}}" build docs/design']
  docs:check:
    desc: Report anything missing from the design site
    cmds: ['"{{.DESIGN_SPEC}}" check docs/design']
```

`check` reports: guide sections with no group, no **The problem:** / **The fix:** line or no example; groups missing from `site.json`; cookbook recipes with fewer than two code blocks (files and output); any `TODO` left in. Pages load Tailwind and two Google fonts from a CDN; offline they still read, unstyled. Each project owns its copy of `style.css`.

## The format

`src/site.json` — name, tagline, groups (colours: `cobalt jade ochre oxblood slate violet teal`), the reading path shown on the overview, and an optional link to a long spec:

```json
{"name": "envcheck", "tagline": "…", "spec": "../SPEC.md", "start": ["why.html", "how-it-works.html", "cookbook.html"],
 "groups": [{"name": "The schema", "color": "cobalt"}, {"name": "Checking", "color": "jade"}]}
```

`src/guide.md` — one `##` per feature, each with a group comment above it. The first `::: pair` (or code block) is the example the overview shows:

````markdown
<!-- group: Checking -->
## Secrets never print

**The problem:** error messages that echo values leak passwords into logs.

**The fix:** mark a variable `secret`, and its value never appears in any output.

::: pair
```yaml title="env.schema.yaml"
API_KEY: {secret: true, required: true}
```

```text title="envcheck .env"
✗ API_KEY is too short (3 characters, needs 32)
```
:::

- One or two notes: limits, defaults, what happens when it is misused.
````

`<!-- group: none -->` keeps a section in the guide but off the overview. Markdown extras everywhere: `> [!tip] Title` callouts (`tip note warn danger`), `::: pair` side by side, `::: cards c2` / `::: cards c3` with `::: item` inside, code fences with `title="file"`. HTML pages (`picture.html`, `how-it-works.html`) are page bodies; use `.flow` / `.node` / `.arrow` for box diagrams (add `core` to the node that matters most), `.step` / `.num` for walkthroughs and `.phases` / `.phase` for a roadmap. Copy the patterns from `templates/src/` and `examples/envcheck/src/`.

## Modes

### new — from an idea

1. Ask at most three questions: what it is, who uses it, what they do with it today.
2. `design-spec init`, then write **Why** first. If it cannot be written plainly, the idea is not ready; say so.
3. List the features as guide sections, in groups. Write the **example pair first** for each; the problem and fix lines come easily after. A feature whose example you cannot write is not designed yet. Write it anyway with `The fix: not decided yet: <the question>`, so it shows up.
4. Write **How it works** around the single most important mechanism.
5. Write the **cookbook**. It is where the design gets tested (see below).
6. `build`, `check`, then take a screenshot of each page and look at it before telling the user it is done.

### convert — from an existing long spec

1. Read the whole spec. Every user-visible capability becomes a guide section; every rejected idea goes in Decisions.
2. Lift examples **verbatim** from the spec. Where you had to write one, say so in the page ("outputs are what the design says it produces").
3. Link, do not copy: sections point into the spec with `[spec](../SPEC.md#anchor)`; set `spec` in `site.json`.
4. Report the result as "N features, M recipes, and these gaps the conversion exposed".

### update

Edit `src/`, never the generated `.html`. When a decision changes, change the guide section, the decision row and the spec section in the same edit, then `build` and `check`.

### review — decisions the user has not made personally

Go through "Decided for the owner — not yet reviewed" **one per message**: the problem, the option chosen, the option not chosen, why. Wait for an answer before the next. Move each approved row to "Decided by the owner" with the date.

## The cookbook is where the design gets tested

A guide section proves one feature in isolation; a recipe proves they fit together. Write recipes as real tasks a user would name ("a blog home page", "stop a bad deploy in CI"), and in each:

- list the files, then show **every file in full**, then the **exact output**;
- end with **What this used:**, linking each feature into the guide;
- show the failure path when there is one (the output when the database is down, when the file is wrong).

Writing the files in full exposes what the spec never decided: where a path is resolved from, what the host passes in, what the error says. **Record every such gap as a `> [!warn]` callout in the recipe, and tell the user.** That is the most valuable output of the whole exercise. Do not paper over it with a plausible guess.

## Writing rules

- **Plain words, short sentences.** Name things by what the user does, not by how the system is built. Never hard-wrap markdown.
- **Problem before solution**, every time: problem → fix → example.
- **Real examples, exact outputs.** No `foo`/`bar` and no "…" inside an output. If an output is inferred rather than specified, the page says so once at the top.
- **One idea per section.** If an example needs more than ~20 lines, it is two features or a cookbook recipe.
- **Long files go full width.** Use `::: pair` only when both sides are short.
- **Mark who decided what.** Delegated decisions are the easiest to reverse and must stay identifiable.

## Design rules for the site

The look is deliberately quiet: neutral greys, thin borders, 15px text, colour only as small group dots. Do not restyle per project unless the user asks; consistency across projects is part of the value. Before telling the user it is done, build it, screenshot every page (a headless browser works: `"…/Google Chrome" --headless=new --screenshot=out.png --window-size=1400,1400 file:///…/index.html`), and fix overflow, clipped code and broken links.

## Output back to the user

Chat stays short: where the site is (`open DIR/index.html`), what each page is for in one line, the counts `check` printed, and **the gaps the cookbook exposed**. The pages carry the rest.

Worked example: `examples/envcheck/` (sources in `src/`, built pages beside them). Starting templates: `templates/src/`.

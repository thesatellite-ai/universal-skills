---
name: satl-replay-checklist
description: >-
  Distill this session's recurring tasks, gotchas, and verification commands
  into a single reusable markdown checklist that future-them (or another
  agent) can REPLAY when standing up a similar project months later. Use
  when the user says "make a checklist", "capture what we learned", "turn
  this into a playbook", "prevent redundant tasks next time", "replay this
  on the next project", "checklist this", or wraps up a project/session
  with patterns they'll hit again. The output is a project-type playbook,
  not a session log — it should kill re-learning.
---

# satl-replay-checklist

## What this skill is

A session-to-playbook compressor. The user just spent hours/days figuring out how to do something (deploy a TanStack site on Vercel, wire GTM, register sub-apps behind a Cloudflare Worker, set up sitemaps, …). The bulk of that time was discovery: hitting bugs, choosing between options, finding the right CLI flag, etc. None of that is in the code or git history in a form that prevents a future-them from re-doing the same discovery.

This skill captures the **non-obvious, replayable knowledge** from a session into a single markdown file the user (or another agent acting on their behalf) can open at the start of a sister project and tick through. Each item is concrete (real file paths, real commands, real env var names). Each gotcha names the symptom, root cause, and fix. Each section ends with verification commands.

> **Reference outputs live in `./EXAMPLES/`.** Read `EXAMPLES/README.md` for the file map. Default to copying the *shape* of the closest example (section count, gotcha format, verification block) rather than inventing a new structure. Project-specific content always comes from the current session, never from the examples.

## Use cases — when to invoke

- **End of a substantial project bring-up.** "We just shipped the new marketing site / new micro-app / new internal tool. Make me a checklist so the next one takes hours instead of days."
- **After a multi-hour debugging marathon.** A specific class of bug surfaced multiple times this session (env vars, deployment, caching, routing). Capture the playbook so it never bites again.
- **Before context window pressure.** Session is getting long; the user wants the load-bearing learnings persisted in a form a fresh session can pick up.
- **When the user says "I keep doing this redundant thing".** Any phrasing about repetition across projects → this is the antidote.

## NOT for

- One-off bug fixes with no reusable pattern. Just commit the fix.
- The user is mid-task, not wrapping up. Defer until they ship.
- The topic already has a dedicated, recently-updated checklist file and this session added nothing new. Tell the user that and offer to *update* the existing one instead.

## Flow

### Step 1 — Ask where to save (do NOT hardcode)

Always ask the user for the directory before writing. The path differs across machines, users, and repo conventions — never assume.

Use `AskUserQuestion` with a single question and ~3 sensible options:

> Where should the checklist file go?
>   • Paste an absolute directory path (Recommended)
>   • `~/Documents/checklists/` — generic default
>   • `./checklists/` (relative to the current repo)

If the user has already named a directory earlier in this session, reuse it without re-asking. If the user gives a path that doesn't exist, ask once whether to `mkdir -p` it.

### Step 2 — Ask for (or derive) the topic slug

Filename pattern: `<TOPIC>_RECURRING_TASKS.md` in SCREAMING_SNAKE_CASE. Derive `<TOPIC>` from the session if it's obvious (e.g. `WEB_PROJECT`, `CLOUDFLARE_WORKER`, `ELECTRON_APP`, `RAILS_API`). If two or more topics fit, ask the user with `AskUserQuestion`.

### Step 3 — Look for an existing file in that directory

`ls <chosen-dir>` and check whether a matching topic already has a file. If it does, **update** instead of creating a duplicate:

- Add new sections only if they're genuinely new categories.
- Append to existing sections inline.
- Add new gotchas with the next number in the existing series.
- Touch the dated intro line ("Last updated from …") with this session's date and topics.

If the new content is exactly what's already there, tell the user — don't write a near-duplicate.

### Step 4 — Pre-flight (avoid lossy capture)

Mentally enumerate every distinct topic touched this session — not just the last task. If the session had 8 topics and your draft outline has 4 sections, you're dropping coverage. Each of these should map to at least one item in the checklist:

- Setup / bootstrap steps
- Env var decisions (what's set, where, why)
- Bugs hit and how they were diagnosed
- Tools / packages installed and why those over alternatives
- Architectural decisions made (option A vs option B + tradeoff)
- Deployment / verification flow
- Hand-offs to other systems (CI, third-party APIs, sister repos)

### Step 5 — Write the file

Skim `./EXAMPLES/` (per `EXAMPLES/README.md`) before drafting. Match the shape — section count, gotcha format, verification block — of the closest example. Required structure:

1. **One-line intro.** Project + dated topic list, e.g. "Captured 2026-MM-DD from <project>: <topic 1>, <topic 2>, …". Real project name, real topics — but stick to the captured session, not a generic template.
2. **Numbered sections per task area.** Each section is a markdown checklist of *actionable* items (verbs, file paths, exact commands, concrete env var names). Group related items. Aim for 8–12 sections; subsections are fine.
3. **"Gotchas already hit" section near the end.** Numbered. Each gotcha: symptom (paste the actual error message if known), root cause, fix, diagnostic command.
4. **"Verification suite" section.** Copy-paste curl / shell commands that confirm every piece is alive after a deploy. The reader should be able to run the whole block as-is.
5. **"Fast path" section at the end.** 5–10 step ordered list for spinning up a sister project, referencing the prior sections by number.

### Step 6 — Hand-off audit

When the file is written, report to the user:

1. **The full file path.**
2. **A table of contents** — just the numbered section titles, nothing else.
3. **A coverage audit** — which session moments contributed to which sections, so the user can spot anything you missed. One line per contribution, e.g.:
   - "<short moment description> → §<n>, Gotcha #<n>"
   - "<another moment> → §<n>"

The audit step is the lossy-diff guard rail. Without it, a 4-hour session full of small discoveries silently turns into a checklist covering only the loudest two.

## Rules

- **Concrete over abstract.** Real package names, real file paths, real env var names, real shell commands. No placeholder words like "the framework" — name it.
- **Capture non-obvious decisions explicitly.** If A was picked over B, write down the tradeoff so the reader doesn't re-litigate.
- **Include verification commands inline.** Every checklist item that can be checked should say *how* to check it.
- **Call out user-side steps.** Dashboard config, account credentials, KV writes, secrets — flag them; the checklist isn't all code edits.
- **Plain markdown only.** No custom components, no emoji.
- **One continuous physical line per paragraph.** No hard wrapping at 80 cols — let the renderer wrap.
- **Don't list trivial things.** ("Install Node.") Focus on what this *specific* session learned the hard way.
- **Use `- [ ]` checkbox syntax,** not plain bullets, so the reader can tick items in a task-list-aware viewer.
- **Never auto-commit.** The user reviews and decides. Don't reference Claude / AI / Anthropic in any output.

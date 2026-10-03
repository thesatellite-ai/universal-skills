---
name: satl-project-kickoff
description: >-
  Kick off a new library, package or product with an exploration-and-brainstorm
  phase before any code: bootstrap the repo (git, repolink, lore, in-repo
  memory), run three parallel research agents (a cross-ecosystem landscape of
  every existing library with verified GitHub links, a ranked P0-P4 feature
  catalogue of what real apps need, a study of the owner's local reference
  code), then write CLAUDE.md, MISSION.md and an architecture brainstorm with
  options and a recommendation per question, and file the open decisions as
  lore tasks. Triggers when the user says: "our mission is to build X",
  "let's explore / brainstorm a new package", "research every library for X
  in node, php, etc.", "build a full feature set / batteries included",
  "write claude.md and mission.md first", "we are not building anything yet,
  just exploring", or starts a fresh repo for a reusable library. NOT for
  adding a feature to an existing project, and NOT for writing the design
  site (use satl-design-spec after the brainstorm is accepted).
---

# satl-project-kickoff

Turn "our mission is to make the one X library every app needs" into a researched, written, tracked starting point in one session, with zero code. The output is the same every time, so a new project starts where the last one did.

The phase is **exploration only**. Write no source code, scaffold no packages, run no generators. If the user later says "build", that is a new phase.

## What you produce

| Artifact | Where | Rendered as |
|---|---|---|
| `CLAUDE.md` | repo root (repolinked from the private repo when repolink is set up) | plain markdown |
| `MISSION.md` | repo root (repolinked likewise) | plain markdown |
| `docsi/research/LANDSCAPE.md` | internal docs dir | filemark |
| `docsi/research/FEATURES.md` | internal docs dir | filemark |
| `docsi/research/LOCAL_REFERENCES.md` | internal docs dir (only when the user names local reference code) | filemark |
| `docsi/plans/ARCHITECTURE_BRAINSTORM.md` | internal docs dir | filemark |
| `docsi/memory/INDEX.md` + dated notes | internal docs dir | plain markdown |
| lore mission, tasklist, tasks | `.lore/` | lore |

`docsi/` is the convention for a private, repolinked internal-docs dir. If the project already uses another home for internal docs (`.ai/`, `docs/internal/`), use that and keep the same file names.

## Phase 0 — Read the request and the environment

1. Extract from the user's message, and keep verbatim for the lore mission body:
   - **the mission** (one sentence: what library, for whom, why it is the only one they will need)
   - **the language/stack** of the library being built
   - **external references** (URLs of libraries or docs the user pasted)
   - **local references** (paths to the owner's earlier code or a sibling project to use as the architectural template)
   - **required dependencies** the user named (e.g. "we will use package Y")
2. Check the tools, never assume paths:
   ```bash
   command -v lore && lore version | head -1
   command -v repolink && repolink config 2>&1 | head -3   # shows the private-repo profile dir
   git -C . rev-parse 2>/dev/null && git remote -v | head -1
   ```
3. If the user names a sibling project as the template, read its `CLAUDE.md`, how it repolinks (`repolink status` inside it) and how it uses lore (`lore mission list` inside it), and copy those conventions.
4. Load the project's own rules: the global `CLAUDE.md`, and any stack skill the user's rules point at. They override this skill where they conflict.

## Phase 1 — Bootstrap the repo

Do these in order; each is reversible and local.

1. **git.** repolink identifies a consumer repo by its git remote, so an empty dir needs `git init -b main` and `git remote add origin <url>`. Match the remote form the sibling project uses (SSH vs HTTPS). This pushes nothing; say so in the final report, and say the remote repo may not exist yet.
2. **repolink** (only if installed and configured). Create the private-side folder next to the sibling project's (e.g. `<private-repo>/<same-parent>/<project>/`), with `docsi/{research,plans,decisions,memory}`, then link:
   ```bash
   repolink link <rel>/<project>/docsi docsi
   ```
   `CLAUDE.md` and `MISSION.md` are linked after they are written (Phase 3). repolink manages the `.gitignore` block itself.
3. **lore** (only if installed):
   ```bash
   lore init --non-interactive && lore setup
   lore mission add "<mission title>" --body="<the request, verbatim, plus the references>"
   lore tasklist add --title="Exploration and brainstorm" --body="Research and design before any code."
   ```
   Then add one task per Phase 2 and Phase 3 deliverable (`--commitment=accepted`, since the user asked for them) and `lore task start` each as it begins. A task body quotes the user's words for that deliverable.
4. **Memory.** Project memory lives in the repo (`docsi/memory/INDEX.md` plus one dated note per finding), not in the agent's global memory dir. If a global per-project memory dir exists, its `MEMORY.md` gets exactly one line pointing at the in-repo index.

If lore or repolink is missing, skip that step, say so in one line, and never write a task list into a markdown file as a substitute.

## Phase 2 — Research, in parallel

Launch the research as **named background subagents** in one message so they run concurrently and the user can watch them. Each agent writes its own doc directly (to save the coordinator's context) and returns a ~25-line summary. Prompts live in `templates/`; fill every `{{PLACEHOLDER}}`.

| Agent name | Template | Writes | Skip when |
|---|---|---|---|
| `<slug>-landscape` | `templates/agent-landscape.md` | `docsi/research/LANDSCAPE.md` | never |
| `<slug>-features` | `templates/agent-features.md` | `docsi/research/FEATURES.md` | never |
| `<slug>-local-refs` | `templates/agent-local-refs.md` | `docsi/research/LOCAL_REFERENCES.md` | the user named no local code |

Non-negotiables baked into the templates (keep them if you edit a prompt):

- **Verify, don't recall.** Every GitHub link, star count, archived status and last release is checked live (WebSearch/WebFetch or the GitHub API) and dated. Interface method names come from docs or source, not memory.
- **Every library carries its link.** The user asked for "every package with its GitHub link"; a row without one is a defect.
- **Cover every ecosystem**, not just the famous ones: at minimum the target language, PHP, Node/TS, Python, Ruby, JVM, Rust, .NET, Elixir, plus hosted services mapped by feature, plus the in-house layers big open-source products built for themselves (the strongest evidence of a gap).
- **The feature catalogue is ranked by how many real products ship each feature**, banded P0-P4, with a home per feature (core / adapter / plugin / out of scope, with a reason) and an app-archetype table. If the user has an earlier catalogue of this shape, the agent mirrors its structure.
- **filemark grammar, no hard wraps, no mention of AI tooling** in any doc.

While the agents run, write a first `CLAUDE.md` and `MISSION.md` (Phase 3) rather than idling. When each agent reports, close its lore task, then verify its doc before trusting it (see Phase 5).

## Phase 3 — CLAUDE.md and MISSION.md

Templates: `templates/CLAUDE.md.tmpl`, `templates/MISSION.md.tmpl`. Write them into the private-side folder and repolink them (`repolink link <rel>/<project>/CLAUDE.md CLAUDE.md`, same for `MISSION.md`), then `lore render` so lore adds its pointer block to `CLAUDE.md`.

- **CLAUDE.md** is for the next agent: what the project is, the status line ("exploration only, no code until a design is approved"), the working hypotheses carried from the template project (each marked open until an ADR records it), the "read next" list, and the repo-specific rules (repolink, filemark for internal docs, no hard wraps, the stack skill, the security bar).
- **MISSION.md** is for humans and does not change often: the mission sentence, the problem, who it is for, principles, scope in and out, what "done" looks like, and how work is tracked.
- After the research lands, **fold the evidence in**: in MISSION.md, the proof that the gap is real and the lessons the landscape teaches (dead predecessors and why they died); in CLAUDE.md, a dated "facts that change defaults" list (deprecated SDKs, archived dev servers, untagged dependencies) and the open questions.

## Phase 4 — The architecture brainstorm

Ask before starting it if the user has not already asked for it; it is the natural next step, not an automatic one. Template: `templates/ARCHITECTURE_BRAINSTORM.md.tmpl`. Invoke the filemark skill first.

- Read the research docs' key sections (the ideas-to-steal list, the gap, the anti-patterns, the P0 set, the proposed module split, the template-project pattern table) rather than re-deriving them.
- One section per design question: options in a table with for/against, then a **recommendation** with its reason. Up front, a recommendations table with a confidence column, with questions that need the owner marked "Owner decides".
- **Where the research docs disagree, say so explicitly** and put both positions side by side in one question. Do not quietly pick one.
- Name the **riskiest idea** and propose a spike to prove it before anything depends on it.
- Code appears only as short signature sketches to make an option concrete.
- End with risks to watch and links back to the evidence (section numbers in the research docs).

## Phase 5 — Verify, track, report

1. **Fact-check what you wrote.** Every claim in your own docs that came from memory rather than the research is either confirmed or softened to what is known. Cross-check every link in MISSION.md against LANDSCAPE.md.
2. **Formatting gate** over every markdown file you or an agent wrote: no hard-wrapped prose (outside fences, frontmatter and table rows), no raw `<` in filemark prose, every filemark component closed with blank lines inside, no mention of AI tooling.
3. **Open decisions go to lore**, not to the doc: one `--commitment=proposed` task per "Owner decides" question and one for the spike, each body naming the doc section and the recommendation. Cancel any earlier task a decision task supersedes, with a comment saying why.
4. **Memory**: one dated note per non-obvious finding (the bootstrap and why git was initialised, the design insight that surprised you, the decisions waiting), plus the `INDEX.md` line. Update `CLAUDE.md`'s "read next" for every new doc. `lore render`.
5. **Report** in the user's terms: what exists now and where, the three to five findings that matter, the facts that changed a default, what you corrected in your own work, and the decisions waiting on the user with your recommendation for each. Nothing is committed; ask before any commit.

## Gotchas from real runs

- `lore task add` needs both `--tasklist=<tlt_id>` and `--commitment=<accepted|proposed|someday>`; `lore mission add` has no `--json`, so read the id from `lore mission list`.
- In some agent shells a zsh `for … do … done` one-liner fails with `parse error near 'done'`; wrap loops in `bash -c '…'`.
- `lore render` rewrites `CLAUDE.md` to add its pointer block; through a repolink symlink that edits the private-repo copy, which is expected.
- Research agents send an idle notification that repeats their summary; it is not new work. Act once per agent.
- An agent's summary is a claim. Open its doc, check the sections you will cite, and grep that the links you reuse in MISSION.md exist in it.

## Rules

- Exploration only: no source code, no scaffolding, no generated packages.
- Ask before anything outward-facing: pushing, creating the GitHub repo, posting anywhere.
- Subagents are named and run in the background so the user sees them; never separate processes or sessions.
- One store for tasks and decisions (lore); docs hold design, not task lists.
- The template project's patterns are adopted with a verdict each (as-is / adapt / don't), never wholesale.
- Build primitives anyone could import: project-specific decisions (bucket names, tenant layout, framework choice) stay out of the core in every design option you recommend.

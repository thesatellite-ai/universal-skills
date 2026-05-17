---
name: satl-research-closer
description: >-
  Turn scattered research, AI-agent dumps, and markdown planning docs into ONE
  decision graph (IBIS questions/options/findings + ACH disconfirmation matrix),
  then force closure. Use when the user is drowning in research/planning files,
  re-prompting agents instead of deciding, has a folder of *.md (RESEARCH/MISSION/
  COMPARISON/PLAN/FEATURES/TASKS) that never converges, asks "what did we decide /
  why / what's still open", says "I can't decide", "compare these options",
  "synthesize this research", "I keep researching and never finish", or pastes a
  large research dump and wants a decision. NOT a decision oracle — a research-closer.
---

# satl-research-closer

Operationalizes the BRAINSTORM.md design. The disease: research that never
converges — infinite agent re-prompting, 813-line folders holding ~120 lines of
real decisions, the same list hand-copied across 4 files and drifting. The cure:
collapse everything into one graph, apply disconfirmation, force closure.

You are the **shaper** (the make-or-break component). Do this work yourself;
do not ask the user to structure anything.

## Scope boundary (hard — do not erode)

This is a **research-closer, not a decision oracle.** It closes decisions that
have evidence and options. For these four, do NOT run the pipeline — name the
class and tell the user to just decide:

- **Taste / gut** (naming, "which feels right") → pick by fiat.
- **Low-information** (no evidence exists to gather) → pick by fiat.
- **Cheap / reversible** (undo is free) → say so, decide now, stop researching.
- **Avoidance** (block is emotional, not informational) → name it; the graph
  can't fix it.

Pretending to help with these turns the tool into an unused process-monster.

## The 7 node types (the whole vocabulary)

Everything ever written collapses to these. Nothing else is content.

1. **question** — something undecided. `status: open | exploring | decided`.
   Has a root + sub-questions.
2. **option** — one possible answer to a question.
3. **rejected-option** — an explicitly-killed option / non-goal. First-class
   (do NOT drop "non-goals" — they were the gap in the original 5-type model).
4. **finding** — one piece of evidence (one library, one benchmark, one fact).
   Atomic. One per source row — never pre-summarized.
5. **decision** — a question closed: chosen option + rationale + what it killed
   + date. Append-only. The only durable output.
6. **task** — work that exists ONLY after the gating decision closes. Carries a
   DAG (`after:` deps). Never created for an open question.
7. **library item** — pure reference, no question. Parked, findable, never nags.

Views (matrix, scorecard, triage, phase-plan) are **derived, never stored.**

## Pipeline

### 0. Triage gate (run FIRST — before shaping anything)

Ask: **is an actor trying to reach a decision for a stated goal?**

If the input is a catalog / encyclopedia / glossary / runbook / accumulated
memory / settled-facts list with **no open deliberation** → classify the WHOLE
input as **Library** (plus any `feedback`/standing-rule nodes), emit a
reference index, and **STOP**. Do not run steps 1–5.

A table of options is **NOT** a decision unless someone is choosing among them
for a goal. "PostgreSQL | MySQL | CockroachDB" in an encyclopedia is reference;
the same table in a doc where someone must pick one for *their* system is a
decision. Settled facts ("the driver is named `sqlite` not `sqlite3`") are
reference, never open questions.

Fabricating deliberation the source never had is the **worst possible
failure** — worse than missing nuance — because it converts the tool into
noise and destroys trust. When unsure, refuse and file as Library; a missed
real decision is recoverable, a hallucinated one is corrosive.

**Partition before shaping.** If the input spans multiple *unrelated* topics
(a directory of independent projects, a doc covering several unconnected
decisions), partition into independent topic-graphs FIRST. Never force one
root across unrelated work. Triage each topic separately (close / refuse /
defer). An empty/zero-byte source is skipped with a one-line note — never an
error, never fabricated content.

### 0b. Cross-source relationship + contradiction detection

When more than one source is in scope, BEFORE shaping each in isolation:

- **Same-question detection.** Find sources addressing the same decision. A
  committed/opinionated doc that *rejects* options another doc *catalogs* is
  NOT a separate topic — it is one **decision** whose **rejected-option**
  nodes are the catalog's entries, kill-reasons taken from the opinionated
  doc. (e.g. an "every database option" catalog + a "never use MongoDB,
  Postgres does it all" manifesto = one stack decision + its rejected list.)
- **Contradiction surfacing.** If source A decides X and source B's
  evidence/stance conflicts with X, surface it explicitly: *"A decided X; B
  conflicts — resolve or flag."* Never silently merge, never silently ignore.
  This is the highest-value output the system produces — the "this new thing
  contradicts decision #N" promise.
- **Dedupe across sources.** Near-identical findings from re-prompted research
  collapse: cite once, link the rest as members. Overlap volume is itself a
  CLOSE signal (more research = the avoidance disease).

### 1. Ingest
Take whatever the user points at (md folder, agent dump, pasted text, URL).
Read it all. Zero structure asked of the user.

### 2. Shape → graph
- Extract the **root question**. Most folders = ONE root question in a costume.
- Decompose into **sub-questions**. Cluster findings; a cluster of evidence
  about the same choice = a sub-question. Detect "decisions pending" lists,
  ADRs (= already-made decisions), scope tables (= options + decisions).
- Every source row → one **finding**. **Shred, do not summarize.** A 40-row
  triage table = 40 (option, decision) pairs, not one pointer.
- Map non-goals → **rejected-option** nodes.

### 3. ACH disconfirmation matrix
Build **findings × options**. Rate each cell by how much the finding
**DISCONFIRMS** the option: `−−` strongly kills · `−` weakens · `0` neutral ·
`+` survives · `++` strongly survives. The answer is the **least-killed**
option, NOT the most-supported. State the killing evidence explicitly. This
is what reduces confirmation bias — never replace it with a "pros" tally.

### 4. Forcing-function verdict

**Already-closed-by-author check first.** If the source already contains a
committed decision arc + an explicit rejected list, the topic is CLOSED.
Ratify it, log the decision, surface only the GENUINELY-OPEN / DEFER items it
itself flags. Do NOT re-run ACH or re-litigate a decision the author already
made — re-deciding a closed call is its own form of the avoidance disease.

Otherwise, after the matrix, decide if it's closeable. Fire CLOSE when ANY hold:
- Evidence lopsided (one option survives, others each killed by their own gap).
- Diminishing returns (new findings are near-dups of existing — more research
  = the avoidance disease).
- The only open questions are low-info/reversible (→ decide by fiat).
- A premature artifact exists (a build plan / TASKS for a still-"draft"
  decision = closure-avoidance; call it out by name).

Output verdict as exactly ONE of three outcomes per question:
- **DECIDE NOW: <option>** — evidence sufficient; further research is avoidance.
- **GENUINELY OPEN: <the specific evidence that would change it>** — and only
  this unlocks "research more". Naming the missing evidence is mandatory.
- **DEFER-TO-USER: <the question>** — open, but NOT research-resolvable: it
  needs human authority/preference (license, org, timeline, who-contributes,
  public-vs-private). Never auto-close these; never pretend research closes
  them; route them to the user as an explicit short list.

### 5. Decision log
Append `decision` nodes: chosen + rationale + killed-options + date. This is
the artifact that survives. Everything else is disposable scaffolding.

## Storage (v0, no app yet)

One canonical graph file per topic: `<dir>/.research/<topic>.graph.md` —
the ONLY hand-trusted source of truth. Sections: Questions, Options,
Rejected-options, Findings, Decisions, Tasks, Library. Never scatter across
RESEARCH/MISSION/COMPARISON/etc.

Views regenerate into `<dir>/.research/views/` (matrix, scorecard, open-
decisions, slices). **Views are output — never hand-edit them.** Export a
public markdown table only on explicit request (README/GitHub); it is a cache
of a query, regenerated fresh, never the source.

## Fidelity rules (hard — these were the observed failure modes)

1. **Cluster → member drill-down.** Any collapsed cluster MUST keep its member
   findings retrievable. No lossy collapse.
2. **Never collapse without retrievable members.** 10 wire specs → "1 finding"
   is wrong; keep all 10 reachable under the cluster.
3. **rejected-option is first-class.** Non-goals/anti-options always modeled,
   never dropped.
4. **Shred, never summarize-to-pointer.** Every row of every table becomes its
   own node. "See MISSION §2" is a failure, not a result.
5. **Superseded exploration is a derivation, not live options.** When a doc
   explores Idea 1 → 2 → 3 → … where each supersedes the last and they collapse
   into a smaller final option set, the final set is the options; the explored
   ideas are **retained as retrievable derivation members under it** — never
   presented as N live options. Recognizing "this is a derivation that already
   converged" is itself a CLOSE signal.
6. **Orphaned sub-questions are closed-by-parent.** A sub-question whose parent
   option got killed is marked `closed-by-parent` — NOT carried forward as
   open, NOT re-presented as research to do. Dragging dead questions forward
   is the avoidance disease wearing a worklist.
7. **Large catalogs are shredded into the GRAPH, not the chat.** For a catalog
   with many rows (e.g. a ~150-feature FEATURES.md): every row MUST become a
   node in the graph file — section by section, incrementally if needed,
   never reduced to a count. The chat reply MAY cite the count ("~150
   options"), but "150 options, shredded" without the nodes existing in the
   graph file is the failure mode, not a result. Durable graph = all rows;
   chat = the decision. Keep these separate.

## Output to the user (chat)

Plain markdown, compressed, decision-first (eat our own dogfood — deliver the
decision, not a link pile):
1. Root question + the surviving option.
2. The ACH verdict in one line (what's killed, by what).
3. CLOSE or GENUINELY-OPEN, with the exact missing evidence if open.
4. Pointer to the graph file + any regenerated views.
5. The honest lossy-diff note (what got clustered, where to drill down).

## Self-check before saying done

- Did I manufacture a question the source was not actually deliberating? If
  yes, delete the graph and file as reference. (Fabricated decision = worst,
  actively-harmful failure — fails ahead of every other check.)
- Multi-source input: did I detect same-question sources and surface every
  contradiction, or silently treat related/conflicting docs as unrelated?
  (Missed contradiction = the make-or-break capability failing silently.)
- Did I force one root across unrelated topics instead of partitioning?
- Did I re-litigate a decision the author had already closed?
- Did I produce a decision, or relocate the prose? (Relocation = failure.)
- Is the verdict from disconfirmation, or did I tally pros? (Pros = failure.)
- Did any non-goal/cluster member get dropped? (Dropped = fidelity violation.)
- For a taste/low-info/reversible/avoidance call: did I refuse the pipeline
  and say "just decide"? (Running it anyway = scope erosion.)
- For an open-but-needs-human call: did I emit DEFER-TO-USER, not a fake
  close? (Auto-closing a license/org/timeline question = scope erosion.)
- Did I present a superseded exploration as live options instead of a
  converged derivation? (N dead ideas as live options = rule 5 violation.)
- Did I carry forward sub-questions whose parent option is dead? (Dead
  questions in the open list = rule 6 violation.)
- For any large catalog: are all its rows nodes in the graph file, or did I
  just write a count? (Count without nodes = fidelity rule 7 violation.)

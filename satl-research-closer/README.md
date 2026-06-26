# satl-research-closer — purpose & use case

## Why this skill exists

Research that never converges is a specific, recurring disease: infinite agent re-prompting, an 813-line folder holding ~120 lines of real decisions, the same option list hand-copied across four files and drifting out of sync. The user keeps gathering and never decides.

`satl-research-closer` is the cure: collapse everything into **one decision graph**, apply disconfirmation, and force closure. It is a research-*closer*, not a decision oracle.

## What it does

Acts as the **shaper** — it structures the work itself, never asking the user to. It:

- **Triages first.** For decisions that are taste/gut, low-information, cheap/reversible, or pure avoidance, it refuses to run the pipeline and tells the user to just decide — pretending to help there turns the tool into an unused process-monster.
- **Collapses everything** ever written into 7 node types: question, option, rejected-option (non-goals are first-class), finding (atomic — one per source), decision (append-only, the only durable output), task (exists only after its gating decision closes), and library item.
- Builds an **IBIS questions/options/findings** structure plus an **ACH disconfirmation matrix**, with views (matrix, scorecard, triage, phase-plan) derived, never stored.

## When to use it

- The user is drowning in research/planning `.md` files (RESEARCH / MISSION / COMPARISON / PLAN / FEATURES / TASKS) that never converge.
- Re-prompting agents instead of deciding.
- "What did we decide / why / what's still open" / "I can't decide" / "compare these options" / "synthesize this research" / "I keep researching and never finish."
- Pastes a large research dump and wants a decision.

## NOT for

- Decisions that just need to be made by fiat (taste, low-information, cheap/reversible, emotional avoidance) — it names the class and stops.

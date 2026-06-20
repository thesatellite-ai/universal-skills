# EXAMPLES — reference outputs

Concrete files produced by this skill on past sessions. Use these as the **target shape and quality bar** when writing a new checklist. Don't invent a different structure unless the project type genuinely demands it.

## Files

| File | Captured from | Why it's a good reference |
|---|---|---|
| `WEB_PROJECT_RECURRING_TASKS.md` | A TanStack Start + Vite + Vercel + Cloudflare Worker gateway project (anonymized) — covers env hygiene, cache adapter, GTM/GA4 wiring, sub-app routing via a CF Worker, sitemaps + robots.txt, footer/nav consistency, docs sweep | 12 sections, 9 gotchas, copy-paste verification suite, fast-path. Covers everything non-obvious from a multi-day session. Hits all the structural requirements from `../SKILL.md`. |

## What to copy

When you invoke this skill, copy the **shape** from the closest example:

- **Section count and granularity.** ~8–12 sections. Each is a coherent task area, not a one-liner.
- **`- [ ]` checklist syntax.** Every item is actionable (verb + concrete artifact).
- **Per-item verification hints.** "After deploy, `curl -s ... | grep ...`" instead of "verify it works".
- **Gotchas with symptom + root cause + fix + diagnostic command.** Not a vague "watch out for X".
- **Verification suite as a single copy-paste block.** Numbered comments, no commentary between commands.
- **Fast-path at the end** referencing prior section numbers (`Section 1 (Vercel bootstrap) — checklist top to bottom.`).

## What NOT to copy

- **Project-specific details.** Real env var names, GTM container IDs, sub-app slugs, hostnames, package names from the captured project. Replace them with whatever is current in the new project — never copy verbatim.
- **Dated language in the intro.** Each new file has its own "Last updated from <date>: <topics>" line.
- **Identical section titles when topics genuinely differ.** A Rails API project doesn't have an "Analytics" section the same way; rename to fit.

## When the example doesn't fit

If the session's topic is fundamentally different from anything here (e.g. desktop app, mobile build, ML pipeline), use the structural rules in `../SKILL.md` directly and don't force-fit this template. Then drop the new file into `EXAMPLES/` so the next invocation has it as a reference.

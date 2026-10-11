# satl-api-auth-audit — purpose & use case

## Why this skill exists

When auth is checked inside each handler, "open" is the default: every operation has to remember its own check, and the ones that forget look exactly like the ones that work. The incident behind this skill was a GraphQL API whose every read answered anonymous callers, plus leftover scaffold CRUD mutations with no check at all, live in production.

This skill makes the fix structural: one gate at the entry point, closed by default, a short allowlist with a reason for every entry, and a test that walks the whole schema and fails when anything new answers an anonymous caller.

## What it does

- **enumerate:** lists every GraphQL root field and HTTP route and how auth is enforced today, read-only.
- **probe:** calls every read operation against production with no credentials (never a write) and records what answers.
- **report:** four lists (readable by anyone, writable by anyone, gated only by "any logged-in user", blocked) before anything changes.
- **fix:** one entry-point gate (gqlgen `AroundRootFields` or router middleware), scaffold CRUD removed, existing per-handler checks kept as a second layer.
- **pin:** schema-walk, stale-allowlist and end-to-end tests through the real server builder, each proven by breaking the gate.
- **prove:** re-runs the anonymous probe after deploy and reports before/after counts.

## When to use it

- Someone reports or suspects an unauthenticated endpoint.
- Before the first public deploy of any backend with a GraphQL or REST surface, or after adding a new API surface.
- Reviewing a project grown from a template, which usually ships demo CRUD nobody gated.

## NOT for

- Authorization between users (who may see whose data); that is a separate pass.
- Rate limiting, CORS or secret scanning.

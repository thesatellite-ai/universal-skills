---
name: satl-api-auth-audit
description: >-
  Audit an API for operations that answer without a login, then close them by
  inverting the default: one gate at the entry point, a short allowlist, and a
  test that walks the whole schema. Use when the user says "none of the routes
  are protected", "the API is open", "anyone can call this without a token",
  "audit auth", "add an auth gate", "protect all routes", "check for
  unauthenticated endpoints", "security audit the API", or before the first
  public deploy of any backend with a GraphQL or REST surface.
---

# satl-api-auth-audit

Find every API operation an anonymous caller can run, report it, then make the API closed by default. Treat it as a security incident, not a refactor.

## Why this skill exists

When auth is checked inside each handler, "open" is the default: every field has to remember its own check, and the ones that forget look exactly like the ones that work. In the incident this skill came from (ideas_machine_go, 2026-10-06) the result was every read in a GraphQL API answering anonymous callers, plus scaffold CRUD mutations (`createUser`, `deleteUser`) with no check at all, live in production. The comments even said "reads are public", so each field looked deliberate on its own. The fix that holds is structural: one gate, closed by default, with a test that fails when anything new answers an anonymous caller.

## When to invoke

- The user reports or suspects an unauthenticated endpoint.
- Before the first public deploy of a backend, or after adding a new API surface.
- When reviewing a project grown from a template or boilerplate, which usually ships demo CRUD nobody gated.

## NOT for

- Authorization between users (who may see whose data). This skill answers "is a login required at all"; per-user and per-workspace rules are a separate pass.
- Rate limiting, CORS, or secret scanning.

## Phase 1 — Enumerate (read-only)

1. List every externally reachable operation: every GraphQL query and mutation, and every HTTP route. Read the schema and route files; introspection is often disabled in production, so do not rely on it.
2. Find how auth is enforced today: a global middleware, a directive, a per-resolver call. Note which operations have no check in code.
3. Check whether self-registration is open. If anyone can create an account, "requires a logged-in user" protects nothing. Look for a config flag; if there is none, assume it is open.

## Phase 2 — Probe production without credentials

1. Call every READ operation against the real production URL with no token and no cookie. Record which return data and which return an auth error.
2. A `null` result with no error counts as open: the resolver ran. Only an explicit auth error counts as blocked.
3. NEVER call an operation that writes. For mutations and write routes, establish the answer from the code and say that is how you know.
4. Probe operations that take arguments too, with harmless made-up values. The worst findings hide behind a required argument (`userByEmail(email:)`).
5. In zsh, put probe loops in a script file or a Python heredoc; an inline `for … done` can fail to parse.

## Phase 3 — Report before changing anything

Give the user four lists, in plain words: readable by anyone, writable by anyone, gated only by "any logged-in user" (and whether registration is open), and properly blocked. Say what was probed live and what was read from code. Propose the fix and wait for the go-ahead; which data stays public is the user's call.

## Phase 4 — Fix: closed by default

1. Add ONE gate at the API entry point that refuses every operation without an authenticated user, except an explicit allowlist.
   - gqlgen: a root-field middleware, `server.AroundRootFields(...)`. Take the root type from the operation kind (`graphql.GetOperationContext(ctx).Operation.Operation`). `RootFieldContext.Object` looks like the place for it but holds the FIELD name, so reading it refuses every public field.
   - REST: a router-level middleware applied to the group, with the allowlist checked inside it.
   - Fail closed when the framework context is missing.
2. Keep the allowlist short and justify every entry in a comment beside it. Typical entries: login, token refresh, logout, password reset, email verify, a health/ping probe, and a "who am I" that returns null when logged out.
3. Leave registration OFF the allowlist unless the product needs public sign-up, and say so in the comment.
4. Keep existing per-handler checks as a second layer; the gate is what makes a forgotten check harmless.
5. Remove or hard-disable leftover scaffold CRUD that nothing calls. If removing it from the schema needs a risky regeneration, make the handlers refuse outright and record that the schema entry is to be deleted.
6. Return the error text the frontend already reacts to, so token refresh and redirect-to-login keep working.

## Phase 5 — Pin it with tests

1. A schema-walk test: iterate every root field (or every route) and assert an anonymous caller is refused unless the field is on a reviewed list, and a logged-in caller is let through. Write the expected public list out a second time in the test, so widening the allowlist is a two-place, reviewed change.
2. A stale-entry test: every allowlisted name must exist in the schema.
3. An end-to-end test through the SAME server builder production uses (extract one if the server is built inline), with the exact queries that were open. Give the resolver root no dependencies, so a gated field that reached its resolver would crash instead of returning the auth error.
4. The inverse: a public field still answers anonymously, and one public field in a document does not open the gated field beside it.
5. Break it on purpose: back up the wiring file, remove the gate, confirm the tests fail, restore from the backup (never `git checkout`), confirm green.

## Phase 6 — Deploy and prove it from outside

1. Check the frontend's logged-out pages call only allowlisted operations.
2. Correct every comment and doc that says reads are public; grep for the phrase.
3. After deploying, re-run the Phase 2 probe against production and report before/after counts.
4. Write the rule into the project's `CLAUDE.md`: closed by default, the two-place edit to make something public, and the post-deploy anonymous `curl` check.

## Final report

Lead with whether production is closed. Then: what was verified live, what changed, and what could NOT be verified (usually the logged-in flow, when there is no login to test with). Name any route that still answers anonymously and what it returns.

## Rules

- Never run a write against production to "test" it.
- Never report "protected" from code reading alone when a live probe is possible.
- Ask before committing, pushing or deploying, unless the user already said to.
- No reference to Claude, AI or Anthropic in commits, PRs or docs.
- Plain markdown, one physical line per paragraph.

---
id: 2026-08-07-07
date: 2026-08-07
type: decision
title: Identity roles are free-text labels, stamped on messages at send time
tags: [satl-agent-messaging, agentmsg, roles, schema, backward-compat]
files: [satl-agent-messaging/agentmsg, satl-agent-messaging/SKILL.md, satl-agent-messaging/test.sh]
status: active
confidence: high
supersedes:
until:
---

**What** — `agentmsg join <room> <id> [role…]` attaches an optional free-text role ("CTO", "Head of Product") to an identity. `agents` lists `id — role`, and `send` copies the sender's role into each message as a `from-role:` frontmatter field. Roles are labels only — nothing validates or enforces them, and any identity may claim any role.

**Why** — The user wanted "joined as CTO": a room of opaque handles (`sync`, `adv`, `bob`) tells neither a human nor an agent what each participant is *for*. A role makes a room self-describing and lets an agent address others by function. It was deliberately kept as a label rather than a permission: this is a file mailbox with no authentication of any kind, so an access-control story built on roles would be security theatre. Stamping the role at **send** time rather than resolving it at read time keeps a message historically accurate — the note still reads "from bob (CTO)" after bob becomes CEO or leaves the room, and a read never has to touch the agent registry.

**How** — `validate_role` + `_agent_role` in `satl-agent-messaging/agentmsg`. The role lives in `<room>/agents/<id>.agent` as a third line, `role: <text>`; `AGENT_ROLE_MAX_LEN=64`, single-line, printable. Unlike ids, roles allow spaces and punctuation because they never enter a filename or path — `join lobby ann Head of Product` works unquoted since everything after the id is the role. Re-joining is the update path: it rewrites the file with the new role while preserving the original `joined:` timestamp.

**Evidence** — `bash satl-agent-messaging/test.sh` → 123 passed, 0 failed (20 role assertions), including: a message sent as CEO still reads `from-role: CEO` after the sender re-joins as Advisor; a hand-written pre-roles `.agent` file (only `id:`/`joined:`) lists bare, re-joins, and can later gain a role; role at exactly 64 chars passes and 65 fails.

**Don't** — Don't treat a role as a permission or an identity check; there is no authentication anywhere in this tool. Don't migrate old `.agent` files — the absence of a `role:` line *is* the no-role state, and every reader already handles it. Don't write the file with `{ printf …; [[ -n "$role" ]] && printf …; } > "$f"` — with an empty role the group's exit status becomes 1 and `set -e` aborts mid-command (same trap as [[2026-08-07-01]]); use an `if`.

# satl-agent-messaging — purpose & use case

## Why this skill exists

You often have two or three Claude Code sessions open at once — one per project — and you want them to coordinate: "tell the other session the schema changed," "ask it for the migration status." Today the only way is to copy-paste between windows by hand, which is slow and easy to get wrong. There's no shared, no-setup channel for a handful of agent sessions on the same machine to pass notes.

`satl-agent-messaging` is that channel.

## What it does

Gives each session an **identity** (e.g. `bob`, `sync`, `adv`) inside a shared **room**, backed by a dead-simple file mailbox under `~/agent-messages/` — no server, no database, no network. Sending drops one file into the recipient's queue; reading prints and deletes those files (read-once). A small bash CLI (`agentmsg`) handles routing, atomic delivery, ordering, and validation, and the skill teaches the agent to drive it from plain English ("tell adv …", "check my messages").

The highest-value property is **read-once with chronological, cross-sender ordering**: each session drains its own queue exactly once, in true send order, so nothing is double-processed and nothing is lost — even under simultaneous sends.

## When to use it

- **"Be bob" / "act as alice" / "take identity X"** — a session adopts an identity in a room.
- **"Tell the other agent …"** / "message adv" — send a note to another session.
- **"Check my messages"** / "anything from sync?" — read (and consume) waiting notes.
- Coordinating **two or three Claude Code windows** on the same machine.

## Rules it follows

- One message = one file; **read-once** (`read`/`drain` delete, `peek` doesn't).
- **No instant push** — a session only receives when it pulls (manually, via the `drain` hook on its next turn, or via the `/loop` skill). Nothing external injects into a running session.
- Same machine only; a few identities per room, not a broadcast bus (`send` once per recipient).
- Names are validated (`[A-Za-z0-9_-]`, no `__`) so routing is a pure glob and paths can't escape the room tree.

See `SKILL.md` for the full command reference and `playbooks/` for step-by-step tutorials.

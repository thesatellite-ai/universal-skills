# satl-agent-messaging — purpose & use case

## Why this skill exists

You often have two or three Claude Code sessions open at once — one per project — and you want them to coordinate: "tell the other session the schema changed," "ask it for the migration status." Today the only way is to copy-paste between windows by hand, which is slow and easy to get wrong. There's no shared, no-setup channel for a handful of agent sessions on the same machine to pass notes.

`satl-agent-messaging` is that channel.

## What it does

Gives each session an **identity** (e.g. `bob`, `sync`, `adv`) inside a shared **room**, backed by a dead-simple file mailbox under `~/agent-messages/` — no server, no database, no network. Sending drops one file into the recipient's queue; reading prints and deletes those files (read-once). A small bash CLI (`agentmsg`) handles routing, atomic delivery, ordering, and validation, and the skill teaches the agent to drive it from plain English ("tell adv …", "check my messages").

The highest-value property is **read-once with chronological, cross-sender ordering**: each session drains its own queue exactly once, in true send order, so nothing is double-processed and nothing is lost — even under simultaneous sends.

## The delivery problem, and `agentmsg watch`

A mailbox is only half the job. Nothing outside a running agent session can inject a turn into it, so mail has to be *pulled* — and asking a human to type "check my messages" in the other window defeats the point of having a channel at all.

`agentmsg watch <room> <id>` is the answer. It blocks, polling the queue every 60 seconds, costing nothing while the mailbox is empty. When mail lands it prints the bodies and **exits** — and in a harness that re-invokes the agent when a backgrounded command finishes (Claude Code's `run_in_background` does), that exit *is* the push. The agent wakes with the message already in hand, acts on it, and relaunches the watcher.

So the skill instructs the agent to start the watcher automatically the moment it adopts an identity. The user says "be bob" once; background delivery is simply on from then on, in every new session, without anyone explaining it again. Saying "stop watching" turns it off (`agentmsg unwatch`), and "is the watcher running?" answers itself (`agentmsg watchers`) — SKILL.md carries the phrase-to-command table so no session has to be taught the vocabulary.

A pidfile registry under `<room>/watchers/<id>.pid` is what makes stopping reliable: `unwatch` finds a watcher started by any other window or session, is idempotent, escalates `SIGTERM` to `SIGKILL` only if the process is wedged, and refuses to kill a recycled pid that no longer belongs to agentmsg. The same registry turns "one watcher per identity" from advice into an enforced rule — a second `watch` on a live mailbox refuses to start rather than silently splitting the queue.

The two older mechanisms are kept as fallbacks for harnesses that can't background a command: a `UserPromptSubmit` hook (delivers on the user's next typed turn) and the `/loop` skill (polls on a timer, but pays tokens on every empty tick).

## When to use it

- **A bare `/satl-agent-messaging`** — cold start: the skill resolves the CLI, shows existing rooms and live watchers, asks which identity and room, then sets everything up.
- **"Be bob" / "act as alice" / "take identity X"** — a session adopts an identity in a room.
- **"You are bob, the CTO"** — an identity can carry a free-text role, shown in `agents` and stamped on every message it sends.
- **"Tell the other agent …"** / "message adv" — send a note to another session.
- **"Check my messages"** / "anything from sync?" — read (and consume) waiting notes.
- **"Watch for new messages in the background"** / "check every minute" — start the blocking watcher.
- **"Stop watching"** / "is the watcher running?" — stop or inspect it.
- **"Tell everyone …"** / "tell the CTO …" — broadcast to the room or to a role.
- **"Don't lose these"** / "show me our history" — archive on read, replay later.
- **"I'm done being bob"** / "delete the room" — deregister an identity, or tear the room down.
- Coordinating **two or three Claude Code windows** on the same machine.

## Rules it follows

- One message = one file; **read-once** (`read`/`drain` remove it from the inbox, `peek` doesn't). `--archive` keeps the text without breaking exactly-once delivery.
- **Broadcast is fan-out, not a shared object.** `--all` and `--role` write one independent file per recipient, so ordering and read-once stay per-mailbox. The sender is never a recipient.
- **Destructive commands are guarded.** `leave` refuses while mail is queued; `rmroom` refuses without `--force` and first prints what it would destroy.
- **Delivery is always a pull** — nothing external injects into a running session. `watch` gets as close to push as the model allows by turning its own process exit into the wake-up signal; the hook and `/loop` pull on a keystroke and on a timer respectively.
- **One watcher per identity, enforced.** A second `watch` on a live mailbox exits 1 rather than starting; two watchers would split the queue, with each message reaching exactly one of them.
- Same machine only; a few identities per room, not a broadcast bus (`send` once per recipient).
- Names are validated (`[A-Za-z0-9_-]`, no `__`) so routing is a pure glob and paths can't escape the room tree.

See `SKILL.md` for the full command reference and `playbooks/` for step-by-step tutorials.

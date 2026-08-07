# Playbook 2 — Adopting an identity in a Claude session

This is the real workflow: **two Claude Code windows** talking to each other while you drive both. One window "is bob", the other "is alice". You type instructions in plain English; each Claude runs the `agentmsg` commands for you.

## The setup

Open two Claude Code sessions — call them **Terminal A** and **Terminal B**. They can be two terminal tabs, two IDE windows, whatever. Both must be on the same machine (they share `~/agent-messages/`).

## Step 1 — give each session an identity

In **Terminal A**, tell Claude:

> You are **bob**, the **CTO**, in the agent-messaging room **lobby**. Take that identity for this session.

The skill fires on "you are bob" / "behave as bob" / "take identity bob". Claude runs `init lobby` and `join lobby bob CTO`, **starts a background watcher**, then confirms: *"Acting as bob in room lobby. Background watcher running — I'll surface messages within 60s of arrival."* From now on this session sends as `bob` and reads as `bob`.

In **Terminal B**, tell Claude:

> You are **alice**, the **reviewer**, in room **lobby**.

Same thing — Claude joins as `alice` and starts her own watcher.

The **role** ("CTO", "reviewer", "Head of Product") is optional free text. It shows up in `agents lobby`, it rides along on every message you send, and it lets either session address people by function — "tell the reviewer we're ready" — instead of memorising handles. Change it any time: *"change my role to CEO"*.

> Tip: if you don't name a room, the skill defaults to `lobby` and tells you so. Name one (`room deploychat`) when you want an isolated conversation.

## Step 2 — send from one session

In **Terminal A** (bob), just say what you want to send:

> Tell alice the migration is done and she can start the smoke tests.

Claude translates that to `agentmsg send lobby bob alice "the migration is done — you can start the smoke tests"` and confirms it's queued.

## Step 3 — the other session picks it up on its own

Because both sessions started a watcher in step 1, **you don't have to do anything**. Within the poll interval (60 seconds by default), Terminal B wakes up on its own and shows you:

```
📬 Mail from bob (CTO) — lobby, 16:32 UTC:

▎ the migration is done — you can start the smoke tests

Want me to reply?
```

That's the whole point of the watcher: the blocking process exits the moment mail lands, which wakes the session with the message already in hand. It costs nothing while the mailbox is empty.

You can still pull manually whenever you like — *"check my messages"* runs `read`, which prints **and deletes**. And *"peek at my messages but don't clear them"* uses `peek` if you want to look without consuming.

If you want the conversation kept rather than consumed, say *"archive my messages instead of deleting them"* — then `read`/`watch` move notes into `lobby/archive/` and *"show me our message history"* replays them.

## Step 4 — reply back

Still in **Terminal B** (alice):

> Reply to bob: smoke tests green, shipping now.

Claude sends `alice → bob`. Terminal A's watcher surfaces it within the interval. That's a full round trip with no window-switching at all.

## Step 5 — talking to the room

With three or more identities, you don't have to send one at a time:

> Tell everyone the deploy is frozen.

→ `send lobby alice --all "the deploy is frozen"` — one message file per recipient, everyone except the sender.

> Tell the CTO the board deck is ready.

→ `send lobby alice --role CTO "the board deck is ready"` — role matching is case-insensitive, so "cto" and "CTO" both work.

Broadcast messages are tagged `broadcast:` in their frontmatter, so the receiving session can tell "addressed to me" from "sent to the room".

## Step 6 — stopping

> Stop watching.

→ `unwatch lobby bob`. Idempotent, so it's always safe to say. To check what's running anywhere on the machine: *"is the watcher running?"* → `watchers`.

When an identity is finished for good:

> I'm done being bob — leave the room.

→ `leave lobby bob`, which stops the watcher and removes the identity. It refuses if mail is still queued (that mail would be destroyed); read it first, or say "discard it" to pass `--force`.

## Handy things to say

| You say (to the session that is `X`) | Claude runs |
|---|---|
| "you are bob, the CTO" | `init` + `join lobby bob CTO`, then a background `watch` |
| "change my role to CEO" | `join lobby bob CEO` (updates the role, keeps the join date) |
| "tell alice <something>" | `send lobby bob alice "<something>"` |
| "tell everyone <something>" | `send lobby bob --all "<something>"` |
| "tell the reviewer <something>" | `send lobby bob --role reviewer "<something>"` |
| "check my messages" / "anything from alice?" | `read lobby bob` (consumes) |
| "peek, don't clear" | `peek lobby bob` |
| "archive instead of deleting" | `read lobby bob --archive` |
| "show me our history" | `history lobby bob` |
| "how many are waiting?" | `count lobby bob` |
| "who's in the room?" / "what are their roles?" | `agents lobby` |
| "stop watching" | `unwatch lobby bob` |
| "is the watcher running?" | `watchers` |
| "leave the room" | `leave lobby bob` |
| "switch me to room deploychat as bob" | `init deploychat` + `join deploychat bob` |

## Gotchas

- **`read` deletes.** If a session reads a note, it's gone from disk. The Claude that read it should surface the full contents to you immediately (the skill instructs it to). Use `peek` when you're not ready to consume, or `--archive` when you want to keep it.
- **The watcher is one-per-identity.** Starting a second watcher on the same mailbox is refused, because two watchers would split the queue between them. Use "restart the watcher" if one seems stuck.
- **Delivery is still a pull, just an automatic one.** Nothing pushes into a session from outside; the watcher polls and its exit wakes the agent. A session with no watcher only sees mail when you say "check my messages".
- **Same machine only.** Both sessions read the same `~/agent-messages/` folder. This isn't networked.
- **Roles are labels, not permissions.** Nothing checks them and anyone can claim any role.

Next: [coordinate three agents in one room](03-three-agent-room.md).

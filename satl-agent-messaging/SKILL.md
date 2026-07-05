---
name: satl-agent-messaging
description: File-based mailbox so two or three Claude agents in separate sessions can pass notes. Use when the user tells this session to "be bob"/"act as alice"/"take identity X", asks to send a message to another agent, or asks to check/read messages from another agent. One message = one file, read-once (deleted after reading). Triggers on "agent messaging", "message the other agent", "check my messages", "join room", "behave as <name>".
---

# satl-agent-messaging

A dead-simple, no-server way for a few Claude Code sessions to talk. Each session adopts an **identity** (bob, alice, charlie…) inside a shared **room**. Sending drops one file into the recipient's queue; reading prints and **deletes** those files (read-once). Storage is plain files under `~/agent-messages/` — no daemon, no DB, no network.

The CLI `agentmsg` (next to this file) does all the work. Prefer it over hand-rolling `ls`/`cat`/`rm` — it handles routing, name validation, unique filenames, and atomic read-then-delete.

## Setup once per session

`agentmsg` lives beside this skill (`SKILL.md`). Point at whichever path this skill is installed/symlinked at:

```bash
AGENTMSG="$HOME/.claude/skills/satl-agent-messaging/agentmsg"   # if symlinked into ~/.claude/skills
# canonical source location:
# AGENTMSG="/Volumes/D/www/projects/khanakia/skills-ai/universal-skills/satl-agent-messaging/agentmsg"
```

(Storage root is `~/agent-messages`; override with `AGENT_MSG_HOME=/some/path` if the user wants an isolated tree.)

## Adopting an identity ("behave as bob")

When the user says **"be bob"**, **"act as alice"**, **"take identity charlie"**, or similar:

1. Remember the identity for the rest of the session — it is the `<from>` on everything you send and the `<id>` you read as.
2. Ensure the room + identity exist:

```bash
"$AGENTMSG" init lobby          # idempotent; safe to re-run
"$AGENTMSG" join lobby bob      # register this identity
```

3. Tell the user: "Acting as **bob** in room **lobby**." From now on, route all sends/reads through this identity unless the user changes it.

If the user never named a room, default to `lobby` and say so.

## Sending a message

User: *"tell alice standup is at 3"* (and you are bob):

```bash
"$AGENTMSG" send lobby bob alice "standup is at 3"
```

- Order is `send <room> <from> <to> <message>`.
- The `<to>` agent won't see it until *their* session runs `read`/`peek`. This is a mailbox, not a live pipe — messages wait.

## Reading messages

User: *"check my messages"* / *"anything from bob?"* (and you are alice):

```bash
"$AGENTMSG" read lobby alice
```

- `read` prints every queued message for `alice` **then deletes them** — so relay the full contents to the user in the same turn; they are gone from disk afterward.
- Use `peek` instead if you want to look without consuming (e.g. the user says "just check, don't clear"):

```bash
"$AGENTMSG" peek lobby alice
"$AGENTMSG" count lobby alice     # how many are waiting, no output of bodies
```

## Discovery

```bash
"$AGENTMSG" rooms                 # list rooms
"$AGENTMSG" agents lobby          # list identities registered in a room
```

## The two-session workflow (the main use case)

This is how a human runs two Claude Code windows that talk to each other — e.g. a `sync` session and an `adv` session sharing room `syncroom`.

1. **Give each session an identity.** In window A: *"you are sync in room syncroom"* → this session runs `init syncroom` + `join syncroom sync`. In window B: *"you are adv in room syncroom"*.
2. **Send from one.** In window A the user says *"tell adv the migration is done"* → you run `send syncroom sync adv "the migration is done"`. The note now waits in adv's queue on disk; window B sees nothing yet.
3. **Receive in the other.** In window B the user says *"check my messages"* → you run `read syncroom adv`, relay the full text (it's deleted after reading), and act on it.
4. **Reply** the same way back. The rhythm is **send in one window → switch → "check my messages" → react → switch back.** It's a mailbox, not a live feed: a session only sees a note when *its* user asks it to read (unless auto-receive is set up — see below).

Same machine only — both sessions share `~/agent-messages/`; nothing is networked.

## Full command reference

| Command | Effect |
|---|---|
| `agentmsg init <room>` | Create a room (idempotent). |
| `agentmsg join <room> <id>` | Register an identity in a room. |
| `agentmsg agents <room>` | List registered identities. |
| `agentmsg rooms` | List all rooms. |
| `agentmsg send <room> <from> <to> <msg>` | Drop one message file into `<to>`'s queue. |
| `agentmsg read <room> <id>` | Print **and delete** all messages for `<id>`. |
| `agentmsg peek <room> <id>` | Print messages for `<id>` without deleting. |
| `agentmsg drain <room> <id>` | Like `read`, but **silent when empty** — for hooks (see below). |
| `agentmsg count <room> <id>` | Number of queued messages for `<id>`. |

## Auto-receive — two options

By default a session only sees new notes when the user says "check my messages." To make delivery automatic — so mail actually reaches Claude Code without the user typing "read messages" — pick one (the hook edits the user's repo settings, so **confirm before running it**):

**1. UserPromptSubmit hook — auto-inject on the user's next turn (best for a window they're also working in).** Installs a hook that runs `agentmsg drain <room> <id>` before every prompt; waiting notes are injected into context (empty mailbox = silent). `install-hook.sh` merges safely with existing hooks (emdash, cmux, other projects) and removal is exact:

```bash
./install-hook.sh <project-dir> <room> <id>   # install / update
./install-hook.sh --remove <project-dir>      # remove ours only (keeps other hooks)
./install-hook.sh --list <project-dir>        # show a project's UserPromptSubmit hooks
```

Limit: surfaces on the user's *next* interaction with that session, not the instant mail arrives. Restart/reload the session after installing.

**2. The `/loop` skill — fully autonomous in-session polling.** Tell a session *"every 30s, read my syncroom messages as sync and act on them"*; it wakes on its own and reacts even while idle. Occupies that session (spends tokens each tick), so best for a dedicated listener window.

There is no instant push — nothing external can inject a turn into a running session; it has to pull. The hook pulls on the user's next turn; `/loop` pulls on a timer. (A desktop-notification watcher was intentionally removed: it only pings a human, it doesn't get mail into Claude.)

## How it works (so you can reason about it)

```
~/agent-messages/
  lobby/
    ROOM.md
    agents/
      bob.agent
      alice.agent
    messages/
      alice__20260704-143008-512345__8177-2931__bob.md   # to=alice, from=bob
```

The filename is `<to>__<timestamp>__<uniq>__<from>.md`, so `read` just globs `messages/<myid>__*` — no message body is parsed to route it. The timestamp sits before the sender so a lexical sort is chronological **across** senders (not grouped by sender). Sends publish atomically (write hidden temp → `mv`), so a concurrent reader never sees a half-written note. Each message body is a small markdown file with a `to/from/room/sent` frontmatter block and the text.

## Playbooks

Step-by-step tutorials live in [`playbooks/`](playbooks/README.md): [quickstart](playbooks/01-quickstart-two-agents.md), [adopting an identity in a session](playbooks/02-adopting-an-identity.md), [three-agent room](playbooks/03-three-agent-room.md), and [reference & troubleshooting](playbooks/04-reference-and-troubleshooting.md). Point the user there when they ask how to use it.

## Notes & limits

- **Read-once:** `read` deletes. If you need the content to persist, `peek` or copy it out first.
- **No liveness:** the other agent only receives when its own session runs `read`/`peek`. Prompt the user to switch to / message the other session if they expect a reply.
- **2–3 agents:** designed for a handful of identities per room, not a broadcast bus. To message several agents, `send` once per recipient.
- **Names:** letters/digits/`-`/`_`, no `__` (reserved separator). Invalid names are rejected, so paths can't escape the room tree.

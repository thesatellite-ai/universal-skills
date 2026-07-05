# Playbook 1 — Quickstart: two agents pass notes

Goal: see the entire send → read → delete loop in **one terminal** in under a minute. No Claude session needed yet — just you and the CLI, playing both agents.

## Prerequisites

Point a variable at the CLI (see [playbooks/README](README.md) for the path):

```bash
AGENTMSG="$HOME/.claude/skills/satl-agent-messaging/agentmsg"
```

## Step 1 — create a room

A room is the shared space the agents talk in. We'll use `lobby`.

```bash
"$AGENTMSG" init lobby
```

You'll see `room 'lobby' ready at ~/agent-messages/lobby`. Running it again is harmless — `init` is idempotent.

## Step 2 — register the two identities

Each agent needs a name in the room.

```bash
"$AGENTMSG" join lobby bob
"$AGENTMSG" join lobby alice
```

Check they're both there:

```bash
"$AGENTMSG" agents lobby
# → alice
#   bob
```

## Step 3 — bob sends alice a message

The argument order is `send <room> <from> <to> <message>`. Read it left to right: "in lobby, from bob, to alice, say …".

```bash
"$AGENTMSG" send lobby bob alice "standup is at 3pm — bring the deploy notes"
```

Output confirms delivery and shows the filename that now sits in alice's queue.

## Step 4 — alice checks her mailbox

Alice sees how many notes are waiting, then reads them:

```bash
"$AGENTMSG" count lobby alice     # → 1
"$AGENTMSG" read  lobby alice
```

`read` prints the message (with a small `to/from/room/sent` header) **and deletes it**. Read it again and it's gone:

```bash
"$AGENTMSG" count lobby alice     # → 0
"$AGENTMSG" read  lobby alice     # → no messages for 'alice' in 'lobby'
```

That "read-once" behavior is the whole point: an agent processes each note exactly once, like tearing a slip off a spike.

## Step 5 — look without consuming (optional)

If you want to see what's waiting *without* clearing it, use `peek` instead of `read`:

```bash
"$AGENTMSG" send lobby alice bob "on my way"
"$AGENTMSG" peek lobby bob         # prints it, leaves it in the queue
"$AGENTMSG" count lobby bob        # → still 1
"$AGENTMSG" read lobby bob         # now consume it
```

## What you just learned

- `init` → `join` → `send` → `read` is the complete lifecycle.
- Messages wait on disk until the recipient reads them — order and timing are up to the readers.
- `read` deletes; `peek` doesn't; `count` just tells you how many are waiting.

Next: [drive this from an actual Claude Code session](02-adopting-an-identity.md).

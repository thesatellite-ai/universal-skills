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

Optionally give an identity a **role** — free text, spaces allowed, no quoting needed. It's a label so humans and agents can tell who is who:

```bash
"$AGENTMSG" join lobby bob CTO
"$AGENTMSG" join lobby alice Head of Product
```

Check they're both there:

```bash
"$AGENTMSG" agents lobby
# → alice — Head of Product
#   bob — CTO
```

Re-running `join` with a different role changes it (and keeps the original join date). Roles are labels only — nothing enforces them.

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

## Step 6 — keep a copy instead of destroying it (optional)

`read` is destructive by design, which means a note you wanted to keep is unrecoverable. `--archive` moves it to `lobby/archive/` instead of deleting it — it still leaves the inbox, so delivery stays exactly-once:

```bash
"$AGENTMSG" send lobby bob alice "ship date is the 14th"
"$AGENTMSG" read    lobby alice --archive     # === … (read-once, archiving) ===
"$AGENTMSG" count   lobby alice               # → 0, it left the inbox
"$AGENTMSG" history lobby alice               # → replays it, oldest first
```

Set `AGENT_MSG_ARCHIVE=1` in your environment to make that the default everywhere, and pass `--no-archive` when you want a one-off delete.

## Step 7 — wait for mail instead of polling by hand

`watch` blocks until something arrives, prints it, and exits. Try it with two terminals, or with a backgrounded send:

```bash
( sleep 3; "$AGENTMSG" send lobby alice bob "heads up" ) &
"$AGENTMSG" watch lobby bob --interval 1
# blocks ~3s, then prints the note and exits 0
```

Exit `0` means mail (on stdout); exit `2` means the `--timeout` elapsed with an empty mailbox. That exit is exactly how a Claude session gets woken up — see [playbook 2](02-adopting-an-identity.md). Stop a backgrounded one with `unwatch lobby bob`, and list every live one with `watchers`.

## Step 8 — clean up (optional)

```bash
"$AGENTMSG" leave  lobby alice          # deregister; refuses if mail is queued
"$AGENTMSG" rmroom lobby --force        # delete the room and everything in it
```

Both are guarded: `leave` won't silently destroy queued mail (pass `--force` to accept that), and `rmroom` prints what it's about to delete and refuses without `--force`.

## What you just learned

- `init` → `join` → `send` → `read` is the complete lifecycle; `leave` and `rmroom` undo it.
- Messages wait on disk until the recipient reads them — order and timing are up to the readers.
- `read` deletes; `peek` doesn't; `--archive` keeps a copy; `count` just tells you how many are waiting.
- `watch` turns "poll for mail" into "block until mail", which is what makes automatic delivery possible.

Next: [drive this from an actual Claude Code session](02-adopting-an-identity.md).

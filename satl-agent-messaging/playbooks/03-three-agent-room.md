# Playbook 3 — A three-agent room

Two agents is a conversation; three is coordination. This playbook sets up `bob`, `alice`, and `charlie` in one room and shows how to fan a message out to everyone and how to run a simple "lead assigns work" pattern.

```bash
AGENTMSG="$HOME/.claude/skills/satl-agent-messaging/agentmsg"
```

## Step 1 — one room, three identities

Give each identity a **role** while you're here — with three or more people in a room, roles are what let you address the group by function instead of memorising handles:

```bash
"$AGENTMSG" init project
"$AGENTMSG" join project bob     Lead
"$AGENTMSG" join project alice   Frontend
"$AGENTMSG" join project charlie Frontend
"$AGENTMSG" agents project
# → alice — Frontend
#   bob — Lead
#   charlie — Frontend
```

In three Claude sessions, tell each one "you are bob / alice / charlie in room **project**" (see [playbook 2](02-adopting-an-identity.md)).

## Step 2 — fan-out (broadcast to everyone)

`--all` sends to every identity in the room except the sender:

```bash
"$AGENTMSG" send project bob --all "kickoff at 10 — grab your assignments"
# → broadcast (all) -> 2 recipient(s): alice charlie
```

`--role` narrows it to everyone with a given role. Matching is case-insensitive, because you'll say "the frontend team" and the role was typed by hand:

```bash
"$AGENTMSG" send project bob --role frontend "please rebase before you start"
# → broadcast (role=frontend) -> 2 recipient(s): alice charlie
```

Under the hood a fan-out writes **one independent file per recipient** — there is no shared broadcast object. Each agent gets its own copy in its own queue, so one agent reading doesn't consume anyone else's, and read-once, ordering, and atomic publish all keep working per mailbox exactly as they do for a direct send. Recipients can tell the difference: broadcast messages carry a `broadcast: all` or `broadcast: role=frontend` line in their frontmatter, which is the difference between "reply expected" and "FYI".

Directed sends still work the same way when you want one person:

```bash
"$AGENTMSG" send project bob alice "you take the UI"
```

If you're driving Claude, just say *"tell everyone kickoff is at 10"* or *"tell the frontend team to rebase"* — it picks the right form.

## Step 3 — each agent drains its own queue

Alice's session:

```bash
"$AGENTMSG" read project alice     # sees only alice's notes
```

Charlie's session:

```bash
"$AGENTMSG" read project charlie   # sees only charlie's notes
```

Bob's kickoff to alice and the one to charlie are independent files in independent queues — no cross-talk, no double-reads.

## Step 4 — a lead-assigns-work loop

A common three-agent shape: **bob is the lead**, alice and charlie are workers.

1. Bob sends each worker a task (Step 2).
2. Each worker reads its task, does the work, and reports back to bob:
   ```bash
   "$AGENTMSG" send project alice   bob "UI done, PR #42 up"
   "$AGENTMSG" send project charlie bob "tests green"
   ```
3. Bob drains his queue and sees both reports — in the order they arrived, because reads are chronological across senders:
   ```bash
   "$AGENTMSG" read project bob
   # === 2 message(s) for 'bob' in 'project' (read-once, deleting) ===
   # ... alice: UI done, PR #42 up
   # ... charlie: tests green
   ```

Because bob's queue merges notes from every sender in true send-time order, he gets a clean chronological feed of everyone's replies — not one sender's batch followed by another's.

## Step 5 — keeping the room tidy

Rooms only ever grow unless you prune them. When an agent is finished:

```bash
"$AGENTMSG" leave project charlie
```

That stops charlie's watcher and removes the identity, so `agents` stops listing a handle nobody is behind and `--all` stops mailing a ghost. It refuses while mail is still queued for charlie — read it first, or pass `--force` to accept that those notes are destroyed.

When the whole effort is done:

```bash
"$AGENTMSG" rmroom project --force
```

Without `--force` it refuses and tells you exactly what it would destroy (identities, queued messages, archived messages). There is no undo, so the guard is deliberate.

If you want the coordination history to survive the cleanup, have each agent read with `--archive` (or set `AGENT_MSG_ARCHIVE=1`) so notes land in `project/archive/` instead of being deleted, and replay them with `history project`. Note that `rmroom` deletes the archive too — copy it out first if you want to keep it.

## When three is too many for this tool

`agentmsg` is built for a *handful* of identities passing notes, not a broadcast bus. `--all` fans out one file per recipient, which is linear: fine for a room of five, wasteful for a room of five hundred. If you find yourself with dozens of agents, or needing delivery receipts and retries, you've outgrown a file-mailbox — reach for a real queue. For 2–3 coordinating agents it's exactly enough.

Next: [command reference & troubleshooting](04-reference-and-troubleshooting.md).

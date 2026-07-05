# Playbook 3 — A three-agent room

Two agents is a conversation; three is coordination. This playbook sets up `bob`, `alice`, and `charlie` in one room and shows how to fan a message out to everyone and how to run a simple "lead assigns work" pattern.

```bash
AGENTMSG="$HOME/.claude/skills/satl-agent-messaging/agentmsg"
```

## Step 1 — one room, three identities

```bash
"$AGENTMSG" init project
"$AGENTMSG" join project bob
"$AGENTMSG" join project alice
"$AGENTMSG" join project charlie
"$AGENTMSG" agents project
# → alice
#   bob
#   charlie
```

In three Claude sessions, tell each one "you are bob / alice / charlie in room **project**" (see [playbook 2](02-adopting-an-identity.md)).

## Step 2 — fan-out (broadcast to everyone)

There's no broadcast command — a message goes to exactly one recipient. To reach the whole group, `send` once per recipient. That's deliberate: each agent gets its own copy in its own queue, so one agent reading doesn't consume everyone else's.

Bob announces a kickoff to both teammates:

```bash
"$AGENTMSG" send project bob alice   "kickoff: I'm taking the API, you take the UI"
"$AGENTMSG" send project bob charlie "kickoff: I'm taking the API, you take tests"
```

If you're driving Claude, just say: *"tell both alice and charlie that kickoff is starting and assign them UI and tests."* Claude issues the two `send` calls.

A tiny shell helper if you do this a lot:

```bash
broadcast() {           # broadcast <room> <from> <msg> <to1> <to2> ...
  local room="$1" from="$2" msg="$3"; shift 3
  for to in "$@"; do "$AGENTMSG" send "$room" "$from" "$to" "$msg"; done
}
broadcast project bob "standup in 5" alice charlie
```

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

## When three is too many for this tool

`agentmsg` is built for a *handful* of identities passing notes, not a broadcast bus. If you find yourself with dozens of agents, per-message fan-out, or needing delivery receipts and retries, you've outgrown a file-mailbox — reach for a real queue. For 2–3 coordinating agents it's exactly enough.

Next: [command reference & troubleshooting](04-reference-and-troubleshooting.md).

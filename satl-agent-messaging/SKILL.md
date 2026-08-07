---
name: satl-agent-messaging
description: File-based mailbox so two or three Claude agents in separate sessions can pass notes, plus a background watcher that auto-delivers new mail without the user asking. Use when the user tells this session to "be bob"/"act as alice"/"take identity X", asks to send a message to another agent, asks to check/read messages from another agent, or wants a background file-watcher/polling service that checks for new messages every minute. One message = one file, read-once (deleted after reading). Triggers on "agent messaging", "message the other agent", "check my messages", "join room", "behave as <name>", "watch for messages", "background message watcher", "auto-check for new messages", "stop watching", "stop the message watcher", "is the watcher running", "join as CTO", "what's my role", "who's in this room", "tell everyone", "broadcast to the room", "message the CTO", "show me our message history", "leave the room", "delete the room".
---

# satl-agent-messaging

A dead-simple, no-server way for a few Claude Code sessions to talk. Each session adopts an **identity** (bob, alice, charlie…) inside a shared **room**. Sending drops one file into the recipient's queue; reading prints those files and **removes them from the inbox** (read-once — deleted, or moved to `archive/` if you ask to keep them). Storage is plain files under `~/agent-messages/` — no server, no DB, no network. A per-session background watcher (`agentmsg watch`) makes delivery automatic, so nobody has to type "check my messages".

The CLI `agentmsg` (next to this file) does all the work. Prefer it over hand-rolling `ls`/`cat`/`rm` — it handles routing, name validation, unique filenames, role lookup, fan-out, atomic publish, and atomic read-then-retire.

## Cold start — the user invoked this skill with nothing else

If you were loaded by a bare `/satl-agent-messaging` (or "set up agent messaging") with no identity and no room named, run these four steps in order. Do not describe the skill back at the user and stop — that leaves them with nothing running.

**1. Resolve `agentmsg`. Probe, never guess** — a wrong path makes every later command fail in a confusing way:

```bash
AGENTMSG="$(
  p1="$HOME/.claude/skills/satl-agent-messaging/agentmsg"
  p2="$HOME/.config/claude/skills/satl-agent-messaging/agentmsg"
  p3="$(command -v agentmsg 2>/dev/null || true)"
  if   [ -x "$p1" ]; then echo "$p1"
  elif [ -x "$p2" ]; then echo "$p2"
  elif [ -n "$p3" ] && [ -x "$p3" ]; then echo "$p3"
  fi
)"
echo "${AGENTMSG:-NOT-FOUND}"
```

That probe is deliberately written as an `if`/`elif` chain rather than a `for` loop: your shell may be an interactive zsh whose profile defines an alias that shadows a loop keyword (`alias do=…` is a real one in the wild), which turns any `for … do … done` into a parse error. The chain has no such failure mode.

If that prints `NOT-FOUND`, fall back to the directory you loaded this `SKILL.md` from (`<that dir>/agentmsg`). If there is no executable there either, **stop and tell the user the skill isn't installed** — suggest `task install` from the `universal-skills` repo — rather than running commands that will fail.

**2. Read the current state first**, so the user picks from what exists instead of inventing names. Run all three — the third gives you the identity choices:

```bash
"$AGENTMSG" rooms                 # existing rooms
"$AGENTMSG" watchers              # any watcher already running, in any room
"$AGENTMSG" agents <each-room>    # identities already registered, per room
```

**3. Ask — as a picker, not a sentence.** Identity and room cannot be inferred from disk; they are whatever the user wants *this window* to be. If your harness has a structured question/option tool (in Claude Code: `AskUserQuestion`), **use it** so the answer is one click instead of one typed sentence. Ask both questions in a **single** call:

| Question | Header | Options to offer |
|---|---|---|
| "Which room?" | `Room` | up to three room names from `rooms` (most recently used first), plus **"New room"**. If no rooms exist, offer `lobby` as the recommended default. |
| "Which identity should I be?" | `Identity` | registered identities from `agents` that have **no live watcher** (label them "resume as `sync`", including their role if they have one), plus **"New identity"**. If there are none, say so in the descriptions and let the free-text answer carry it. Mention in the question that a role can be included — "sync, the reviewer". |

The tool always appends a free-text **Other** choice, which is how a brand-new name gets typed — so never burn an option slot on "let me type one".

Without such a tool, fall back to one prose question and wait:

> Which identity should I be, and in which room? (rooms found: `syncroom`, `lobby` — or name a new one; default room `lobby`)

**Skip the question entirely** when the answer is already known: the invocation carried it (`/satl-agent-messaging be sync in syncroom`), or `watchers` shows exactly one live watcher and the user said "resume"/"same as before" — confirm that identity instead of re-asking.

**4. Adopt the identity** — `init`, `join`, background `watch`, one-line confirmation. That is the next section.

If `watchers` already lists a live watcher for the identity the user picks, **do not start a second one** (it would exit 1). Ask whether to keep it or switch, and use `unwatch` or `watch --replace` accordingly.

## Setup once per session

`agentmsg` lives beside this `SKILL.md`. Resolve it once with the probe above and reuse `$AGENTMSG` for the rest of the session. Storage root is `~/agent-messages`; override with `AGENT_MSG_HOME=/some/path` if the user wants an isolated tree.

## Adopting an identity ("behave as bob")

When the user says **"be bob"**, **"act as alice"**, **"take identity charlie"**, or similar:

1. Remember the identity for the rest of the session — it is the `<from>` on everything you send and the `<id>` you read as.
2. Ensure the room + identity exist:

```bash
"$AGENTMSG" init lobby          # idempotent; safe to re-run
"$AGENTMSG" join lobby bob      # register this identity
"$AGENTMSG" join lobby bob CTO  # …or with a role, if the user gave one
```

If the user named a role ("you are bob, the **CTO**"), pass it — see [Roles](#roles--joined-as-cto).

3. **Start the background watcher — do this automatically, without asking.** This is the whole point: the user should never have to explain background message-checking to a fresh session again.

```bash
"$AGENTMSG" watch lobby bob --interval 60      # run this in the BACKGROUND
```

Run it with your harness's background-execution mode (in Claude Code: the `Bash` tool with `run_in_background: true`). It blocks, costing nothing, until mail arrives — then it prints the messages and **exits**, which wakes you with the bodies already in hand. See [Auto-receive](#auto-receive--three-options) for the exit-code contract and the relaunch rule.

4. Tell the user in one line: "Acting as **bob** in room **lobby**. Background watcher running — I'll surface messages within 60s of arrival; say *stop watching* to turn it off." Then route all sends/reads through this identity unless the user changes it.

If the user never named a room, default to `lobby` and say so. Only skip the watcher if the user explicitly declines it, or your harness cannot run background commands — in that case say so and offer the hook instead.

## Sending a message

User: *"tell alice standup is at 3"* (and you are bob):

```bash
"$AGENTMSG" send lobby bob alice "standup is at 3"
```

- Order is `send <room> <from> <to> <message>`.
- The `<to>` agent won't see it until *their* session runs `read`/`peek` — or until their watcher picks it up. This is a mailbox, not a live pipe.

### Broadcasting

When the user says *"tell everyone"*, *"announce to the room"*, or names a role (*"tell the CTO"*, *"ask the reviewers"*), don't loop `send` yourself:

```bash
"$AGENTMSG" send lobby bob --all "deploy is frozen"          # everyone except bob
"$AGENTMSG" send lobby bob --role reviewer "PR #42 is up"    # everyone whose role is reviewer
```

- A fan-out writes **one independent file per recipient**. There is no shared broadcast object, so read-once, ordering, and atomic publish work per mailbox exactly as for a direct send.
- The sender is **never** a recipient, even when it shares the target role.
- Role matching is **case-insensitive but exact** — `--role frontend` matches `Frontend`, not `Frontend Eng`. If it finds nobody, it exits 1 and tells you to check `agents`; relay that rather than silently sending nothing.
- Recipients can tell a broadcast from a personal note: the message carries `broadcast: all` or `broadcast: role=<r>`. Mention that when relaying — it's the difference between "reply expected" and "FYI".
- `--all` only reaches **registered** identities. Someone who never ran `join` is invisible to it.

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

## Keeping messages — archive and history

`read` is destructive by design. That is correct for delivery (a note is processed exactly once) and terrible for memory (the conversation is unrecoverable). `--archive` resolves both: the file leaves the inbox — so it is never delivered twice — but lands in `<room>/archive/` instead of being deleted.

```bash
"$AGENTMSG" read  lobby bob --archive       # keep a copy
"$AGENTMSG" watch lobby bob --archive       # …including everything the watcher delivers
"$AGENTMSG" history lobby bob               # replay, oldest first, newest 20
"$AGENTMSG" history lobby --all             # the whole room's archive
```

- Turn it on for a whole session with `AGENT_MSG_ARCHIVE=1` in the environment; `--no-archive` overrides it for one call.
- **Archiving is opt-in and off by default** — don't silently change the user's read-once behaviour. Do offer it when they say "don't lose this", "keep our messages", or ask for history they don't have.
- `history` only shows what was archived. If the user asks for history and the archive is empty, say plainly that earlier messages were deleted on read and offer to start archiving from now on — never imply the history exists.
- `rmroom` deletes the archive along with everything else.

## Leaving and cleaning up

Rooms only ever grow. When the user says they're done with an identity, deregister it — a stale handle still shows in `agents` and still receives `--all` broadcasts nobody reads.

```bash
"$AGENTMSG" leave lobby bob                 # stops bob's watcher, removes the identity
"$AGENTMSG" rmroom lobby --force            # deletes the whole room
```

- `leave` **refuses while mail is queued**, because leaving would destroy notes someone sent in good faith. Relay the refusal, read the mail first, and only pass `--force` if the user says to discard it.
- `rmroom` is unrecoverable. It refuses without `--force` and prints exactly what it would destroy (identities, queued messages, archived messages). **Show the user that line and get explicit confirmation before re-running with `--force`.** Never pass `--force` on your own initiative.

## Discovery

```bash
"$AGENTMSG" rooms                 # list rooms
"$AGENTMSG" agents lobby          # list identities registered in a room
```

## The two-session workflow (the main use case)

This is how a human runs two Claude Code windows that talk to each other — e.g. a `sync` session and an `adv` session sharing room `syncroom`.

1. **Give each session an identity.** In window A: *"you are sync in room syncroom"* → this session runs `init syncroom` + `join syncroom sync`, and starts `watch syncroom sync` in the background. In window B: *"you are adv in room syncroom"*, same thing as `adv`.
2. **Send from one.** In window A the user says *"tell adv the migration is done"* → you run `send syncroom sync adv "the migration is done"`. The note now waits in adv's queue on disk; window B sees nothing yet.
3. **Receive in the other.** In window B the user says *"check my messages"* → you run `read syncroom adv`, relay the full text (it's deleted after reading), and act on it.
4. **Reply** the same way back. With watchers running (step 1) window B wakes on its own within the poll interval and reacts; without them the rhythm is manual — **send in one window → switch → "check my messages" → react → switch back.**

Same machine only — both sessions share `~/agent-messages/`; nothing is networked.

## Full command reference

| Command | Effect |
|---|---|
| `agentmsg init <room>` | Create a room (idempotent). |
| `agentmsg join <room> <id> [role…]` | Register an identity, optionally with a role. Re-run to set or change the role. |
| `agentmsg agents <room>` | List registered identities as `id — role` (bare `id` when no role). |
| `agentmsg rooms` | List all rooms. |
| `agentmsg leave <room> <id> [--force]` | Deregister an identity and stop its watcher. Refuses while mail is queued. |
| `agentmsg rmroom <room> --force` | **Delete a room and everything in it.** Refuses without `--force`. |
| `agentmsg send <room> <from> <to> <msg>` | Drop one message file into `<to>`'s queue. |
| `agentmsg send <room> <from> --all <msg>` | Fan out to every identity in the room except the sender. |
| `agentmsg send <room> <from> --role <r> <msg>` | Fan out to everyone whose role matches `<r>` (case-insensitive). |
| `agentmsg read <room> <id> [--archive]` | Print **and remove** all messages for `<id>`. `--archive` keeps a copy. |
| `agentmsg peek <room> <id>` | Print messages for `<id>` without removing. |
| `agentmsg drain <room> <id> [--archive]` | Like `read`, but **silent when empty** — for hooks (see below). |
| `agentmsg count <room> <id>` | Number of queued messages for `<id>`. |
| `agentmsg history <room> [<id>]` | Replay archived messages. `--limit <n>` (default 20), `--all`. |
| `agentmsg watch <room> <id> [flags]` | **Block until mail arrives**, then drain it and exit. The background watcher. |
| `agentmsg unwatch <room> <id>` | Stop that mailbox's watcher. Idempotent — safe to run when none is running. |
| `agentmsg watchers [<room>]` | List live watchers (`room  id  pid=N`). Prunes dead ones. |

## Phrasebook — what the user says → what you run

The complete surface, in the words a user actually uses. Never make them learn the CLI. `<room>`/`<id>` are this session's adopted identity unless the user names others. When the user asks "what can I say?" or "list the commands", show them this table.

| The user says | You run |
|---|---|
| "be bob" / "you are sync in syncroom" / "act as alice" | `init <room>` + `join <room> <id>`, then background `watch` — automatically, no confirmation |
| "you are bob, the CTO" / "join as alice, Head of Product" | `join <room> <id> <role>` — the role is free text, spaces are fine |
| "change my role to CEO" / "I'm the reviewer now" | `join <room> <id> <new role>` — re-joining updates the role and keeps the join date |
| "tell alice standup is at 3" / "message adv that the migration is done" | `send <room> <me> <them> "…"` |
| "tell everyone …" / "announce to the room …" / "broadcast …" | `send <room> <me> --all "…"` |
| "tell the CTO …" / "ask the reviewers to …" / "message the frontend team" | `send <room> <me> --role <role> "…"` |
| "check my messages" / "anything from bob?" / "any mail?" | `read <room> <id>` — then relay the **full** body; it's removed from the inbox |
| "just check, don't clear" / "peek at my messages" | `peek <room> <id>` |
| "keep my messages" / "archive instead of deleting" / "don't lose these" | `read`/`watch` with `--archive` (or `AGENT_MSG_ARCHIVE=1` for the session) |
| "show me our history" / "what did we discuss?" / "replay the messages" | `history <room> [<id>]` — archived notes only |
| "how many messages are waiting?" | `count <room> <id>` |
| "who's in this room?" / "who am I talking to?" / "what are their roles?" | `agents <room>` |
| "what rooms exist?" | `rooms` |
| "I'm done being bob" / "leave the room" / "remove alice" | `leave <room> <id>` — offer `--force` only if it refuses over queued mail |
| "delete the room" / "clean up this room" | `rmroom <room> --force` — **show what it will destroy and confirm first** |
| "watch for messages" / "check for new messages every minute" / "start the watcher" | background `watch <room> <id>` |
| "check every 15 seconds" / "watch faster" | `watch <room> <id> --interval 15 --replace` |
| "stop watching" / "turn off auto-check" / "stop checking for messages" | `unwatch <room> <id>` |
| "am I watching?" / "is the watcher running?" / "who's watching?" | `watchers` |
| "restart the watcher" / "it stopped working" | `watch <room> <id> --replace` |
| "list the commands" / "what can I say?" | show this table (and `agentmsg help` for the raw CLI) |

## Roles — "joined as CTO"

An identity can carry a **role**: a free-text label like `CTO`, `Head of Product`, `reviewer`, `backend`. It exists so a human reading a room knows who is who, and so you can address other agents by function rather than by opaque handle.

```bash
"$AGENTMSG" join lobby bob CTO                 # set at join time
"$AGENTMSG" join lobby ann Head of Product     # spaces are fine, no quoting needed
"$AGENTMSG" join lobby bob CEO                 # re-join to CHANGE it (join date is preserved)
"$AGENTMSG" agents lobby                       # bob — CEO / ann — Head of Product / plain
```

How to use it:

- When the user says **"you are bob, the CTO"** or **"join as alice, Head of Product"**, pass the role to `join`. Don't drop it — it's the part that tells the other agents what you're for.
- The role is **stamped onto each message at send time** as a `from-role:` field, so a note reads as "from bob (CTO)" even if bob later changes role or leaves the room. Include it when you relay mail: `📬 Mail from bob (CTO)`.
- **Roles are optional and additive.** Identities registered before roles existed list bare and keep working; nothing needs migrating.
- Roles are labels, **not permissions**. Nothing checks them, and anyone can claim any role. Don't build access control on top of one.
- Limits: single line, 64 characters. Unlike ids, roles may contain spaces and punctuation because they never appear in a filename.

## Auto-receive — three options

By default a session only sees new notes when the user says "check my messages." To make delivery automatic, use **the watcher** — the other two are fallbacks.

### 1. `agentmsg watch` — the background watcher service (default; start it automatically)

```bash
"$AGENTMSG" watch syncroom sync                       # defaults: check every 60s, 50-minute lifetime
"$AGENTMSG" watch syncroom sync --interval 15         # faster wake-up
"$AGENTMSG" watch syncroom sync --timeout 0           # never self-expire
"$AGENTMSG" watch syncroom sync --no-drain            # print but leave messages queued
"$AGENTMSG" watch syncroom sync --replace             # take over from an existing watcher
```

Run it **backgrounded** (Claude Code: `Bash` with `run_in_background: true`). Nothing outside a session can inject a turn into it, so mail must be pulled — but a backgrounded command *exiting* does wake the agent. `watch` turns that into push: the process sleeps for free while the mailbox is empty, and its exit **is** the delivery event, with the message bodies already on stdout.

The watcher phrases the user will say — "watch for messages", "stop watching", "is the watcher running?" — are in the [Phrasebook](#phrasebook--what-the-user-says--what-you-run) with everything else.

**Stopping.** `agentmsg unwatch <room> <id>` is the one true way — it finds the watcher through its pidfile, so it works even if a *different* session or terminal started it, and it is idempotent (running it with nothing to stop is a successful no-op). It sends `SIGTERM`, waits, and escalates to `SIGKILL` only if the watcher is wedged. Do **not** reach for `pkill agentmsg` (kills every room's watcher) or the harness's kill-background-task control alone (leaves the pidfile behind, which then has to be pruned). Stop the watcher whenever the user asks, and when the user says they're done with agent messaging for the session.

**Contract — you must relaunch the watcher after every exit:**

| Exit | Meaning | What you do |
|---|---|---|
| `0` | Mail. stdout holds the drained message bodies. | Relay them to the user, act on them, **then relaunch the watcher**. |
| `2` | Idle heartbeat — the `--timeout` elapsed with an empty mailbox. | Say nothing to the user; just **relaunch the watcher**. |
| `1` | Usage/validation error (bad room, bad flag). | Do **not** blindly relaunch — fix the arguments first and tell the user. |

#### Relaying mail — what the user should actually see

**Relaunch the watcher silently.** It is plumbing, not news. Never write "Watcher relaunched", "Restarting the watcher", "Watcher is running again" or similar — the user did not ask for a status report on a background process, and saying it every single time you deliver a message turns a two-line note into a changelog. The *only* time the watcher is worth a sentence is when it **failed** to restart, because that is a real consequence: say so plainly ("I couldn't restart the watcher — you won't receive further messages until it's running again") and fix it.

Show the message and nothing else:

```
📬 Mail from rambo (CTO) — lobby, 16:32 UTC:

▎ how are you

Want me to reply?
```

Relay the **full body** — `read`/`drain` deleted it from disk, so anything you paraphrase away is gone for good. Keep the sender, their `from-role:` if the message carries one, the room, and the time; drop the rest of the frontmatter and the `[agentmsg]` header, which are transport details. Then act on the content if it asks for something, and offer a reply if it's conversational.

Same rule for exit 2 (idle heartbeat): relaunch and say **nothing at all**. An empty mailbox is not an event.

Rules that matter:

- **One watcher per identity — enforced.** A second `watch` on a live mailbox exits **1** with the running pid and refuses to start, because two watchers would silently split the queue (each message reaching only one of them). Don't work around it by launching anyway: either `unwatch` first, or pass `--replace`. Check with `watchers` if you're unsure.
- **Never relaunch on exit 1.** Exit 1 means "already running" or "bad arguments". Relaunching in a loop on exit 1 is the one way to turn this into a busy-spin — read the stderr message and fix the cause.
- **The registry survives your session.** Watchers are tracked in `<room>/watchers/<id>.pid`, so `watchers` and `unwatch` see watchers started by other windows. Dead and recycled pids are pruned automatically; a crashed watcher never blocks the next one.
- **stdout is only message bodies.** The status banner goes to stderr, so you can relay stdout verbatim.
- **Read-once still applies.** `watch` drains by default; the messages are gone from disk once it prints them. Use `--no-drain` if the user wants them left in place.
- **Latency is bounded by `--interval`**, not by the message. Default 60s, per "check for new messages every minute". It polls (one directory glob per tick) rather than depending on `fswatch`/`inotifywait`, which ship on neither macOS nor most Linux by default.

### 2. UserPromptSubmit hook — inject on the user's next typed turn

Best for a window the user is actively working in, or a harness with no background execution. Installs a hook that runs `agentmsg drain <room> <id>` before every prompt; waiting notes are injected into context (empty mailbox = silent). It edits the user's repo settings, so **confirm before running it**. `install-hook.sh` merges safely with existing hooks (emdash, cmux, other projects) and removal is exact:

```bash
./install-hook.sh <project-dir> <room> <id>   # install / update
./install-hook.sh --remove <project-dir>      # remove ours only (keeps other hooks)
./install-hook.sh --list <project-dir>        # show a project's UserPromptSubmit hooks
```

Limit: surfaces on the user's *next* interaction, not when mail arrives. Restart/reload the session after installing.

### 3. The `/loop` skill — timer-driven in-session polling

Tell a session *"every 30s, read my syncroom messages as sync and act on them"*. Works, but it spends tokens on **every tick including empty ones** — `watch` costs nothing while idle and should be preferred wherever background execution is available. Keep `/loop` for harnesses that can't background a command.

(A desktop-notification watcher was intentionally removed: it only pings a human, it doesn't get mail into Claude.)

## How it works (so you can reason about it)

```
~/agent-messages/
  lobby/
    ROOM.md
    agents/
      bob.agent
      alice.agent
    watchers/
      bob.pid                                        # live watcher registry; pruned when stale
    archive/                                         # only exists once something is read --archive
    messages/
      alice__20260704-143008-512345__8177-2931__bob.md   # to=alice, from=bob
```

An `.agent` file holds `id:`, `joined:`, and — when one was given — `role:`. The absence of `role:` is what a pre-roles registration looks like, which is why reading it back is backward compatible without any migration.

The filename is `<to>__<timestamp>__<uniq>__<from>.md`, so `read` just globs `messages/<myid>__*` — no message body is parsed to route it. The timestamp sits before the sender so a lexical sort is chronological **across** senders (not grouped by sender). Sends publish atomically (write hidden temp → `mv`), so a concurrent reader never sees a half-written note. Each message body is a small markdown file with a `to/from/room/sent` frontmatter block and the text.

## Playbooks

Step-by-step tutorials live in [`playbooks/`](playbooks/README.md): [quickstart](playbooks/01-quickstart-two-agents.md), [adopting an identity in a session](playbooks/02-adopting-an-identity.md), [three-agent room](playbooks/03-three-agent-room.md), and [reference & troubleshooting](playbooks/04-reference-and-troubleshooting.md). Point the user there when they ask how to use it.

## Notes & limits

- **Read-once:** `read` removes. If you need the content to persist, use `--archive` (recoverable via `history`), or `peek` to look without consuming.
- **Liveness is opt-in, and it's a pull:** without a watcher the other agent only receives when its own session runs `read`/`peek` — prompt the user to switch windows if they expect a reply. With `watch` running there it wakes on its own within `--interval` seconds. Nothing ever pushes into a session that isn't watching.
- **A handful of agents:** `--all` fans out one file per recipient, which is linear — fine for a room of five, wasteful for a room of five hundred. This is a mailbox for a small coordinating group, not a message bus. Dozens of agents, delivery receipts, or retries mean you've outgrown it.
- **Roles are labels, not permissions.** Nothing authenticates anything here; any identity can claim any role. Never build access control on one.
- **Destructive commands are guarded, and that guard is yours to respect:** `leave` refuses over queued mail, `rmroom` refuses without `--force`. Show the user what would be destroyed and get confirmation — don't pass `--force` on your own initiative.
- **Names:** letters/digits/`-`/`_`, no `__` (reserved separator). Invalid names are rejected, so paths can't escape the room tree. Roles are looser (spaces allowed, 64 chars, single line) because they never appear in a path.

# Playbook 4 — Command reference & troubleshooting

Everything the CLI does, how the files are laid out, and how to get unstuck.

```bash
AGENTMSG="$HOME/.claude/skills/satl-agent-messaging/agentmsg"
```

## Command reference

| Command | What it does | Consumes? |
|---|---|---|
| `agentmsg init <room>` | Create a room (idempotent — safe to re-run). | — |
| `agentmsg join <room> <id> [role…]` | Register an identity, optionally with a role (`join lobby bob CTO`). Re-run to change the role. | — |
| `agentmsg agents <room>` | List identities in the room as `id — role`. | — |
| `agentmsg rooms` | List all rooms. | — |
| `agentmsg leave <room> <id> [--force]` | Deregister an identity and stop its watcher. Refuses while mail is queued. | only with `--force` |
| `agentmsg rmroom <room> --force` | Delete a room and everything in it. Refuses without `--force`. | **yes, all of it** |
| `agentmsg send <room> <from> <to> <msg>` | Drop one message file into `<to>`'s queue. | — |
| `agentmsg send <room> <from> --all <msg>` | One file per identity in the room, except the sender. | — |
| `agentmsg send <room> <from> --role <r> <msg>` | One file per identity whose role matches `<r>` (case-insensitive). | — |
| `agentmsg read <room> <id> [--archive]` | Print **and remove** every queued note for `<id>`, oldest first. `--archive` moves them to `<room>/archive/` instead of deleting. | **yes** |
| `agentmsg peek <room> <id>` | Print notes for `<id>` without removing. | no |
| `agentmsg count <room> <id>` | Print the number of notes waiting for `<id>`. | no |
| `agentmsg history <room> [<id>]` | Replay archived notes, oldest first. `--limit <n>` (default 20), `--all`. | no |
| `agentmsg drain <room> <id>` | Like `read`, but prints nothing at all when the mailbox is empty. For hooks. | **yes** |
| `agentmsg watch <room> <id>` | Block until a note arrives, then `drain` it and exit. The background watcher. | **yes** (unless `--no-drain`) |
| `agentmsg unwatch <room> <id>` | Stop that mailbox's watcher. Safe to run when none is running. | — |
| `agentmsg watchers [<room>]` | List live watchers as `room  id  pid=N`. | — |
| `agentmsg help` | Usage. | — |

Argument order for `send` reads as a sentence: **`send <room> <from> <to> <message>`** → "in `<room>`, from `<from>`, to `<to>`, say `<message>`."

## Where the files live

Default root is `~/agent-messages/`. Override it per-invocation with the `AGENT_MSG_HOME` env var (useful for tests or an isolated project tree):

```bash
AGENT_MSG_HOME=/tmp/mychat "$AGENTMSG" init lobby
```

Layout:

```
~/agent-messages/
  lobby/
    ROOM.md                                    # human-readable label (not used by the CLI)
    agents/
      bob.agent                                # one file per identity: id, joined, and optional role
      alice.agent
    watchers/
      bob.pid                                    # live watcher registry, one file per watching identity
    messages/
      alice__20260704-143008-512345__8177-2931__bob.md   # to=alice, from=bob
    archive/                                     # only if something was read with --archive
      alice__20260704-142055-004411__8102-7734__bob.md   # same filename, out of the inbox
```

A message filename is `<to>__<timestamp>__<uniq>__<from>.md`. The recipient leads, so `read`/`count` are a pure glob (`messages/<myid>__*`). The timestamp comes before the sender so a lexical sort is chronological **across** senders. You can `cat` any of these files directly — the body is plain markdown with a small `to/from/room/sent` frontmatter block.

## Inspecting things by hand

```bash
ls ~/agent-messages/lobby/messages/            # raw queue (all recipients)
cat ~/agent-messages/lobby/messages/alice__*.md
ls ~/agent-messages/lobby/agents/              # who has joined
```

Reading raw files this way does **not** delete them — only `agentmsg read` deletes.

## Troubleshooting

**"room '…' does not exist"** — you skipped `init`. Run `agentmsg init <room>` first. `join`, `send`, and `read` all require the room to exist.

**"invalid id/room '…'"** — names allow letters, digits, `-`, and `_` only, can't start with `-`, and can't contain `__` (that's the filename field separator). Rename `my message` → `my-message`.

**A note I expected isn't there** — remember `read` deletes. If a session already ran `read`, the note is gone. Use `peek` next time, or `count` to check before reading. To confirm what's queued without consuming: `agentmsg count <room> <id>`. To stop losing them for good, read with `--archive` (or export `AGENT_MSG_ARCHIVE=1`) and replay with `agentmsg history <room> <id>`.

**A broadcast didn't reach someone** — `--all` only reaches *registered* identities, so anyone who never ran `join` (or who has since `leave`d) is invisible to it. Check with `agents <room>`. `--role` additionally requires a role that matches, case-insensitively and in full — "Frontend Eng" does not match "frontend". A fan-out never sends to the sender, by design.

**The other agent never "gets" my message** — there's no push. The recipient only sees a note when *its* session runs `read`/`peek`. Tell that session to "check messages."

**I read a note and lost the text** — `read` printed it once and deleted the file. If a Claude session read it, ask it to repeat what it saw (it's still in that session's transcript). Going forward, `peek` first if you want a safety copy, or `cat` the raw file before reading.

**Two sessions reading the same identity** — each note is consumed once; whichever reader grabs it first gets it, the other skips it cleanly (you'll see "consumed by another reader"). Don't point two live sessions at the same identity unless you *want* competing consumers.

**Leftover `.tmp.*` file in a queue** — a send that was killed mid-write can leave one hidden temp file. It's never read or routed (it has no `__`), so it's harmless. Delete it if you like: `rm ~/agent-messages/*/messages/.tmp.*`.

**Wrong microsecond ordering / perl missing** — ordering uses `perl` (present on macOS and most Linux) for microsecond timestamps. Without perl it falls back to second-resolution + random, so two notes sent in the same second may read back in arbitrary order. Install perl for strict FIFO, or don't rely on sub-second ordering.

## Watching for new messages

Don't hand-roll a `while :; do count; sleep; done` loop — `watch` is that loop, done correctly:

```bash
"$AGENTMSG" watch lobby bob                    # every 60s, self-expires after 50 minutes
"$AGENTMSG" watch lobby bob --interval 15      # faster
"$AGENTMSG" watch lobby bob --timeout 0        # run until killed
"$AGENTMSG" watch lobby bob --no-drain         # print but keep the notes queued
```

It blocks while the mailbox is empty (no output, no cost), then prints the notes and exits. **The exit is the point**: in Claude Code, run it with `run_in_background: true` and the session is re-invoked the moment it finishes — so the agent wakes holding the message instead of waiting for someone to type "check my messages". Relaunch it after every exit.

Exit codes: `0` = mail on stdout, `2` = idle timeout (nothing arrived; just relaunch), `1` = already running or bad arguments (**don't** relaunch — read the error).

## Stopping and inspecting watchers

```bash
"$AGENTMSG" watchers                 # every live watcher: room  id  pid=N
"$AGENTMSG" watchers lobby           # just this room
"$AGENTMSG" unwatch lobby bob        # stop bob's watcher
"$AGENTMSG" watch lobby bob --replace   # stop the old one and start a new one in a single step
```

`unwatch` is the supported way to stop one, and it is **idempotent** — running it when nothing is watching prints `no watcher running` and exits 0. It works across windows: watchers register themselves in `~/agent-messages/<room>/watchers/<id>.pid`, so a watcher started in one terminal can be stopped from another. It sends `SIGTERM`, waits a few seconds for the watcher's own cleanup, and only then escalates to `SIGKILL`.

Prefer it over `pkill agentmsg` (which stops every room's watcher, not just this one) and over killing the background task in your agent harness (which leaves the pidfile behind until something prunes it).

**Only one watcher per `(room, id)`** — this is enforced. A second `watch` on a live mailbox exits 1 and names the running pid instead of starting, because two watchers would split the queue between them (no note duplicated or corrupted, but each note reaching only one of the two). Use `unwatch` or `--replace`.

Stale pidfiles are self-healing: if the watcher crashed, or the machine rebooted, or the pid was recycled by an unrelated process, `watchers`/`watch`/`unwatch` detect it, prune the file, and carry on. A recycled pid is never killed — the command line is checked before any signal is sent.

If your harness can't background a command, fall back to the `UserPromptSubmit` hook (`install-hook.sh`) or the `/loop` skill.

## Verifying the install

From the skill directory:

```bash
task test      # 181-assertion behavioral suite (isolated tree)
task bench      # throughput benchmark
task demo       # quick end-to-end demo
```

All green means the CLI is healthy.

# Playbook 4 — Command reference & troubleshooting

Everything the CLI does, how the files are laid out, and how to get unstuck.

```bash
AGENTMSG="$HOME/.claude/skills/satl-agent-messaging/agentmsg"
```

## Command reference

| Command | What it does | Consumes? |
|---|---|---|
| `agentmsg init <room>` | Create a room (idempotent — safe to re-run). | — |
| `agentmsg join <room> <id>` | Register an identity in a room. Idempotent. | — |
| `agentmsg agents <room>` | List identities registered in the room. | — |
| `agentmsg rooms` | List all rooms. | — |
| `agentmsg send <room> <from> <to> <msg>` | Drop one message file into `<to>`'s queue. | — |
| `agentmsg read <room> <id>` | Print **and delete** every queued note for `<id>`, oldest first. | **yes** |
| `agentmsg peek <room> <id>` | Print notes for `<id>` without deleting. | no |
| `agentmsg count <room> <id>` | Print the number of notes waiting for `<id>`. | no |
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
      bob.agent                                # one file per registered identity
      alice.agent
    messages/
      alice__20260704-143008-512345__8177-2931__bob.md   # to=alice, from=bob
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

**A note I expected isn't there** — remember `read` deletes. If a session already ran `read`, the note is gone. Use `peek` next time, or `count` to check before reading. To confirm what's queued without consuming: `agentmsg count <room> <id>`.

**The other agent never "gets" my message** — there's no push. The recipient only sees a note when *its* session runs `read`/`peek`. Tell that session to "check messages."

**I read a note and lost the text** — `read` printed it once and deleted the file. If a Claude session read it, ask it to repeat what it saw (it's still in that session's transcript). Going forward, `peek` first if you want a safety copy, or `cat` the raw file before reading.

**Two sessions reading the same identity** — each note is consumed once; whichever reader grabs it first gets it, the other skips it cleanly (you'll see "consumed by another reader"). Don't point two live sessions at the same identity unless you *want* competing consumers.

**Leftover `.tmp.*` file in a queue** — a send that was killed mid-write can leave one hidden temp file. It's never read or routed (it has no `__`), so it's harmless. Delete it if you like: `rm ~/agent-messages/*/messages/.tmp.*`.

**Wrong microsecond ordering / perl missing** — ordering uses `perl` (present on macOS and most Linux) for microsecond timestamps. Without perl it falls back to second-resolution + random, so two notes sent in the same second may read back in arbitrary order. Install perl for strict FIFO, or don't rely on sub-second ordering.

## Polling for new messages (optional)

The tool is pull-based, but you can make a session watch its queue with a shell loop:

```bash
while :; do
  if [ "$("$AGENTMSG" count lobby bob)" -gt 0 ]; then
    "$AGENTMSG" read lobby bob
  fi
  sleep 5
done
```

Inside a Claude session, prefer the `/loop` skill (e.g. *"every 30s, check my agentmsg messages as bob"*) rather than a blocking shell loop.

## Verifying the install

From the skill directory:

```bash
task test      # 43-assertion behavioral suite (isolated tree)
task bench      # throughput benchmark
task demo       # quick end-to-end demo
```

All green means the CLI is healthy.

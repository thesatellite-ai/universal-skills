---
id: 2026-08-07-08
date: 2026-08-07
type: decision
title: Broadcast, archive, leave and rmroom — the v0.3 surface and its guards
tags: [satl-agent-messaging, agentmsg, broadcast, archive, destructive, concurrency]
files: [satl-agent-messaging/agentmsg, satl-agent-messaging/test.sh, satl-agent-messaging/bench.sh, satl-agent-messaging/SKILL.md]
status: active
confidence: high
supersedes:
until:
---

**What** — agentmsg 0.3.0 adds four things: fan-out (`send <room> <from> --all|--role <r> <msg>`), opt-in archiving (`read`/`drain`/`watch --archive`, `AGENT_MSG_ARCHIVE=1`, replayed by `history`), identity removal (`leave`), and room deletion (`rmroom --force`). It also closes a TOCTOU race in the watcher claim.

**Why** — Each closes a gap the earlier design created. `send` one-at-a-time made "tell everyone" an N-command loop the agent had to hand-roll (playbook 3 even shipped a shell helper for it), and roles made "tell the CTO" the obvious next ask. Read-once delivery is right for exactly-once processing but destroys the conversation, so there was no answer to "what did we discuss" — archiving keeps the text *without* weakening delivery, because the file still leaves the inbox. Rooms only ever grew: `agents` filled with dead handles, and once `--all` existed those ghosts started receiving mail. Room deletion had no command at all, so the only cleanup was `rm -rf` by hand.

**How** — Fan-out flags occupy the `<to>` positional slot, which is unambiguous because `validate_name` forbids an id starting with `-`. `_send_one` writes one independent file per recipient (no shared broadcast object), tagged `broadcast: all` / `broadcast: role=<r>`; the sender is always excluded; `--role` matches case-insensitively but in full. `_retire_msg` is the single choke point for "message delivered": `mv` into `<room>/archive/` or `rm`. The watcher claim is now `(set -o noclobber; printf '%s\n' "$$" > "$pf")` with bounded retries — previously "check live, then write" let two simultaneous starts both win, which is exactly the split mailbox the single-watcher rule exists to prevent.

**Evidence** — `bash satl-agent-messaging/test.sh` → 181 passed, 0 failed. Race test launches 5 concurrent `watch` on one mailbox and asserts exactly one wins. `bench.sh` (N=60) on this machine: send 25/s, read 111/s, read --archive 62/s, `--all` fan-out 34/s, watcher wake-up 0.166s at `--interval 1`.

**Don't** — Don't make archiving the default; read-once is the documented contract and flipping it silently changes every existing caller. Don't let an agent pass `rmroom --force` or `leave --force` on its own initiative — the guards exist to surface an unrecoverable loss to the human, and SKILL.md tells the agent to show the refusal and confirm. Don't point `--all` at a large room: it is linear in recipients, one file each. Don't reintroduce `(( … )) && die` as a loop body's last statement (the filename-collision loop had this latent bug under `set -e`; see [[2026-08-07-01]]).

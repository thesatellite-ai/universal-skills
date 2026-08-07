---
id: 2026-08-07-05
date: 2026-08-07
type: decision
title: agentmsg watch turns background-command exit into message push
tags: [satl-agent-messaging, agentmsg, background, delivery, bash]
files: [satl-agent-messaging/agentmsg, satl-agent-messaging/SKILL.md, satl-agent-messaging/test.sh]
status: active
confidence: high
supersedes:
until:
---

**What** — `agentmsg watch <room> <id>` blocks while the mailbox is empty and *exits* when mail arrives, printing the drained bodies on stdout. It is the default auto-receive mechanism, started automatically the moment a session adopts an identity; the `UserPromptSubmit` hook and the `/loop` skill are now documented as fallbacks only.

**Why** — SKILL.md previously asserted "there is no instant push", which is true of the *messages* but false of the *harness*: Claude Code's `run_in_background` re-invokes the agent when a backgrounded command finishes. So a command whose exit is the delivery event gives push semantics without any daemon. This beats both older options — the hook only fires on the user's next keystroke, and `/loop` spends tokens on every empty tick, whereas a blocked `watch` costs nothing while idle. The user's actual complaint was having to re-explain background message-checking to every new session; making the skill auto-start the watcher on identity adoption is what removes that, not the command by itself.

**How** — `cmd_watch` in `satl-agent-messaging/agentmsg`. Named exit codes are the contract with the caller, which must relaunch after every exit: `EXIT_WATCH_MAIL=0` (bodies on stdout), `EXIT_WATCH_TIMEOUT=2` (idle heartbeat), `1` (already-running or usage error — do NOT relaunch). Tunables `WATCH_DEFAULT_INTERVAL=60`, `WATCH_DEFAULT_TIMEOUT=3000`, `WATCH_MIN_INTERVAL=1`, `WATCH_STOP_GRACE=5`. It checks the queue *before* the first sleep so already-waiting mail delivers immediately, and clamps the final sleep to the remaining timeout so the heartbeat lands on time. The status banner goes to **stderr** so stdout stays pure message bodies and can be relayed verbatim.

Lifecycle rides on a pidfile registry at `<room>/watchers/<id>.pid`, which is what makes `unwatch`/`watchers` work across sessions and makes the one-watcher-per-mailbox rule enforceable (a second `watch` dies with exit 1 naming the live pid; `--replace` takes over). `_live_watcher_pid` prunes on every failed check — non-numeric, dead pid, or a live pid whose `ps -o command=` does not mention agentmsg. That last check is a PID-reuse guard: without it `unwatch` would SIGKILL whatever unrelated process inherited the recycled pid. `_watch_cleanup` on `trap EXIT` (plus explicit `TERM`/`INT` traps that `exit`, so EXIT still fires) removes the pidfile however the process ends.

**Evidence** — `bash satl-agent-messaging/test.sh` → 103 passed, 0 failed. Notable cases: mail sent from a background subshell 2s into a live `watch` (exit 0, body on stdout); banner never on stdout; `unwatch` on a watcher with `--interval 30` returns in well under 10s; a pidfile pointing at a live `sleep 300` is treated as stale and that process is verifiably still alive after `unwatch`.

**Don't** — Don't reach for `fswatch`/`inotifywait`: neither ships by default on macOS or most Linux, and a 60s directory glob already meets the "check every minute" requirement with zero dependencies. Don't use a plain `sleep "$interval"` in the loop — bash only runs traps once the foreground child finishes, so SIGTERM from `unwatch` would sit unhandled for up to a full interval; `_watch_sleep` backgrounds the sleep and blocks in `wait`, which the trap can interrupt. Don't tell users to `pkill agentmsg` (kills every room's watcher) or to kill the harness background task alone (leaves the pidfile). Don't write the loop's timeout check as a bare `(( elapsed >= timeout ))` statement — under `set -e` a false arithmetic evaluation exits the script (same class as [[2026-08-07-01]]); it is wrapped in `if` for that reason.

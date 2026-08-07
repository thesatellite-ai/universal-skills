#!/usr/bin/env bash
#
# test.sh — full behavioral test suite for agentmsg.
#
# Runs against an isolated AGENT_MSG_HOME temp tree (never touches the real
# ~/agent-messages). Covers every command, ordering guarantees, validation,
# edge cases, and a concurrency (no-loss / atomic-publish) stress test.
#
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
A="$HERE/agentmsg"

export AGENT_MSG_HOME
AGENT_MSG_HOME="$(mktemp -d)/agent-messages"
trap 'rm -rf "$(dirname "$AGENT_MSG_HOME")"' EXIT

pass=0; fail=0
ok()   { pass=$((pass+1)); printf '  \033[32m✓\033[0m %s\n' "$1"; }
bad()  { fail=$((fail+1)); printf '  \033[31m✗\033[0m %s\n' "$1"; [[ -n "${2:-}" ]] && printf '      %s\n' "$2"; }

# assert_eq <label> <expected> <actual>
assert_eq() { [[ "$2" == "$3" ]] && ok "$1" || bad "$1" "expected [$2] got [$3]"; }
# assert_contains <label> <needle> <haystack>
assert_contains() { case "$3" in *"$2"*) ok "$1";; *) bad "$1" "missing [$2] in output";; esac; }
# assert_ok <label> <cmd...>   (expects exit 0)
assert_ok()   { local l="$1"; shift; if "$@" >/dev/null 2>&1; then ok "$l"; else bad "$l" "exit $?"; fi; }
# assert_fail <label> <cmd...> (expects non-zero)
assert_fail() { local l="$1"; shift; if "$@" >/dev/null 2>&1; then bad "$l" "expected failure, got exit 0"; else ok "$l"; fi; }

section() { printf '\n\033[1m%s\033[0m\n' "$1"; }

# ── rooms / init ──────────────────────────────────────────────────────────
section "init + rooms"
assert_contains "rooms empty before any init" "no rooms" "$($A rooms)"
assert_ok "init lobby" "$A" init lobby
assert_ok "init lobby again (idempotent)" "$A" init lobby
assert_contains "rooms lists lobby" "lobby" "$($A rooms)"
assert_contains "ROOM.md created" "Room: lobby" "$(cat "$AGENT_MSG_HOME/lobby/ROOM.md")"

# ── join / agents ─────────────────────────────────────────────────────────
section "join + agents"
assert_ok "join bob" "$A" join lobby bob
assert_ok "join alice" "$A" join lobby alice
assert_contains "join bob again is idempotent" "already registered" "$($A join lobby bob)"
agents_out="$($A agents lobby)"
assert_contains "agents lists bob" "bob" "$agents_out"
assert_contains "agents lists alice" "alice" "$agents_out"
assert_fail "join in missing room fails" "$A" join nope charlie

# ── roles ─────────────────────────────────────────────────────────────────
section "roles"
$A init rroom >/dev/null
assert_contains "join with a role reports it" "joined room 'rroom' as CTO" "$($A join rroom cto_bob CTO)"
assert_contains "role may be multi-word and unquoted" "as Head of Product" "$($A join rroom ann Head of Product)"
assert_contains "join without a role still works" "joined room 'rroom'" "$($A join rroom plain)"
roles_out="$($A agents rroom)"
assert_contains "agents shows id — role" "cto_bob — CTO" "$roles_out"
assert_contains "agents shows a multi-word role" "ann — Head of Product" "$roles_out"
assert_contains "agents shows a role-less id bare" "plain" "$roles_out"
assert_eq "a role-less id gets no em dash" "0" "$(grep -c '^plain —' <<<"$roles_out")"
assert_contains "re-join without a role reports the existing one" "(role: CTO)" "$($A join rroom cto_bob)"

# Re-joining is how a role is changed later; the original join time must survive.
joined_before="$(sed -n 's/^joined: //p' "$AGENT_MSG_HOME/rroom/agents/cto_bob.agent")"
assert_contains "re-join with a new role updates it" "as CEO" "$($A join rroom cto_bob CEO)"
assert_contains "agents reflects the new role" "cto_bob — CEO" "$($A agents rroom)"
assert_eq "the original join time is preserved" "$joined_before" "$(sed -n 's/^joined: //p' "$AGENT_MSG_HOME/rroom/agents/cto_bob.agent")"

# The sender's role is stamped at SEND time so it survives later role changes.
$A send rroom cto_bob ann "board deck ready" >/dev/null
$A join rroom cto_bob Advisor >/dev/null
msg="$($A read rroom ann)"
assert_contains "message carries the sender's role" "from-role: CEO" "$msg"
assert_contains "message body intact alongside the role" "board deck ready" "$msg"
$A send rroom plain ann "no role here" >/dev/null
assert_eq "a role-less sender stamps no from-role" "0" "$(grep -c '^from-role:' <<<"$($A read rroom ann)")"

# Backward compatibility: .agent files written before roles existed have no
# `role:` line and must still read and list cleanly.
printf 'id: legacy\njoined: 2026-01-01T00:00:00Z\n' > "$AGENT_MSG_HOME/rroom/agents/legacy.agent"
assert_contains "a pre-role agent file lists fine" "legacy" "$($A agents rroom)"
assert_contains "a pre-role agent file re-joins fine" "already registered in 'rroom'" "$($A join rroom legacy)"
assert_contains "a pre-role agent file can gain a role" "as QA" "$($A join rroom legacy QA)"

assert_fail "role with a newline is rejected" "$A" join rroom nl "$(printf 'a\nb')"
assert_fail "role longer than the cap is rejected" "$A" join rroom toolong "$(printf 'x%.0s' $(seq 1 65))"
assert_ok   "role exactly at the cap is allowed" "$A" join rroom atcap "$(printf 'x%.0s' $(seq 1 64))"

# ── send / count / peek / read ────────────────────────────────────────────
section "send / count / peek / read (read-once)"
$A send lobby bob alice "hello alice" >/dev/null
assert_eq "count = 1 after one send" "1" "$($A count lobby alice)"
peek_out="$($A peek lobby alice)"
assert_contains "peek shows body" "hello alice" "$peek_out"
assert_eq "count unchanged after peek" "1" "$($A count lobby alice)"
read_out="$($A read lobby alice)"
assert_contains "read shows body" "hello alice" "$read_out"
assert_eq "count = 0 after read (deleted)" "0" "$($A count lobby alice)"
assert_contains "read on empty is friendly" "no messages" "$($A read lobby alice)"
assert_ok "read on empty exits 0" "$A" read lobby alice

# ── chronological ordering ACROSS senders ─────────────────────────────────
section "ordering: chronological across senders"
$A join lobby zoe >/dev/null
$A send lobby bob alice "MSG-A" >/dev/null
$A send lobby zoe alice "MSG-B" >/dev/null
$A send lobby bob alice "MSG-C" >/dev/null
order="$($A read lobby alice | grep -oE 'MSG-[ABC]' | tr '\n' ' ')"
assert_eq "read order is send order (not grouped by sender)" "MSG-A MSG-B MSG-C " "$order"

# ── ordering within the same second (microsecond key) ─────────────────────
section "ordering: rapid same-second burst stays FIFO"
for i in $(seq 1 12); do $A send lobby bob alice "seq-$i" >/dev/null; done
got="$($A read lobby alice | grep -oE 'seq-[0-9]+' | tr '\n' ' ')"
want=""; for i in $(seq 1 12); do want+="seq-$i "; done
assert_eq "12 rapid sends read back in order" "$want" "$got"

# ── body fidelity ─────────────────────────────────────────────────────────
section "body fidelity"
printf -v ml 'line1\nline2\nline3'
$A send lobby bob alice "$ml" >/dev/null
ml_out="$($A read lobby alice)"
assert_contains "multiline line1" "line1" "$ml_out"
assert_contains "multiline line3" "line3" "$ml_out"
$A send lobby bob alice 'weird: "quotes" $VAR `cmd` & <tag> 100% #hash émoji✅' >/dev/null
sp_out="$($A read lobby alice)"
assert_contains "special chars preserved" 'weird: "quotes" $VAR `cmd` & <tag> 100% #hash émoji✅' "$sp_out"
$A send lobby bob alice "one two three four" >/dev/null
assert_contains "multi-word unquoted-ish body joined" "one two three four" "$($A read lobby alice)"

# ── unregistered recipient still delivered (with warning) ─────────────────
section "unregistered recipient"
warn="$($A send lobby bob ghost "boo" 2>&1 >/dev/null)"
assert_contains "warns on unregistered recipient" "not a registered identity" "$warn"
assert_eq "message to unregistered id still delivered" "1" "$($A count lobby ghost)"
$A read lobby ghost >/dev/null

# ── prefix isolation (bob vs bobby) ───────────────────────────────────────
section "prefix isolation"
$A join lobby bobby >/dev/null
$A send lobby alice bob "for bob only" >/dev/null
assert_eq "bob has 1" "1" "$($A count lobby bob)"
assert_eq "bobby has 0 (no prefix bleed)" "0" "$($A count lobby bobby)"
$A read lobby bob >/dev/null

# ── validation / injection ────────────────────────────────────────────────
section "name validation"
assert_fail "reject path traversal id" "$A" join lobby "../evil"
assert_fail "reject slash id" "$A" join lobby "a/b"
assert_fail "reject double-underscore id" "$A" join lobby "a__b"
assert_fail "reject leading-dash id" "$A" join lobby "-x"
assert_fail "reject empty id" "$A" join lobby ""
assert_fail "reject empty body" "$A" send lobby bob alice ""
assert_fail "unknown command" "$A" frobnicate
assert_fail "send with missing recipient" "$A" send lobby bob
assert_ok   "help exits 0" "$A" help
assert_ok   "underscore (single) id allowed" "$A" join lobby agent_1

# ── drain (hook-friendly reader) ──────────────────────────────────────────
section "drain: silent-when-empty, consumes when present"
assert_eq "drain is silent on empty mailbox" "" "$($A drain lobby alice)"
assert_ok "drain on empty exits 0" "$A" drain lobby alice
assert_eq "drain is silent on missing room" "" "$($A drain ghostroom alice)"
$A send lobby bob alice "drain me" >/dev/null
drain_out="$($A drain lobby alice)"
assert_contains "drain prints injectable header" "[agentmsg]" "$drain_out"
assert_contains "drain prints the body" "drain me" "$drain_out"
assert_eq "drain consumed the message" "0" "$($A count lobby alice)"

# ── concurrency: 60 parallel sends, zero loss, no partial reads ───────────
section "concurrency: 60 parallel sends → no loss, atomic publish"
$A init stress >/dev/null
$A join stress sink >/dev/null
N=60
for i in $(seq 1 $N); do
  $A send stress worker sink "payload-$i" >/dev/null &
done
wait
assert_eq "all $N messages present, none lost/clobbered" "$N" "$($A count stress sink)"
# no leftover temp files leaked into the queue
leftovers="$(find "$AGENT_MSG_HOME/stress/messages" -name '.tmp.*' | wc -l | tr -d ' ')"
assert_eq "no leftover temp files" "0" "$leftovers"
# every message is a complete file (frontmatter + body) — no partial writes
peekall="$($A peek stress sink)"
front="$(grep -c '^from: worker' <<<"$peekall")"
bodies="$(grep -c '^payload-' <<<"$peekall")"
assert_eq "every message has intact frontmatter" "$N" "$front"
assert_eq "every message has intact body" "$N" "$bodies"
# all payloads unique 1..N (nothing overwrote another)
uniq_n="$(grep -oE 'payload-[0-9]+' <<<"$peekall" | sort -u | wc -l | tr -d ' ')"
assert_eq "all $N payloads distinct (no overwrite)" "$N" "$uniq_n"
$A read stress sink >/dev/null

# ── watch (blocking mailbox watcher) ──────────────────────────────────────
section "watch"
$A init wroom >/dev/null
$A join wroom listener >/dev/null
$A join wroom talker >/dev/null

# Already-queued mail must deliver on the FIRST check, without waiting out an
# interval — the watcher checks before it sleeps.
$A send wroom talker listener "pre-queued note" >/dev/null
wout=""; wrc=0
wout="$($A watch wroom listener --interval 1 --timeout 30 2>/dev/null)" || wrc=$?
assert_eq "watch exits 0 when mail is waiting" "0" "$wrc"
assert_contains "watch prints the message body" "pre-queued note" "$wout"
assert_contains "watch uses the injectable drain header" "[agentmsg]" "$wout"
assert_eq "watch drained the queue" "0" "$($A count wroom listener)"

# Delivery must be near-immediate, not one-interval-late.
start=$SECONDS
$A send wroom talker listener "fast note" >/dev/null
$A watch wroom listener --interval 30 --timeout 60 >/dev/null 2>&1 || true
assert_eq "queued mail delivers without sleeping a full interval" "0" "$(( (SECONDS - start) >= 30 ? 1 : 0 ))"

# --no-drain = peek semantics: printed but left on disk.
$A send wroom talker listener "keep me" >/dev/null
wout="$($A watch wroom listener --interval 1 --timeout 30 --no-drain 2>/dev/null)" || true
assert_contains "watch --no-drain prints the body" "keep me" "$wout"
assert_eq "watch --no-drain leaves the message queued" "1" "$($A count wroom listener)"
$A read wroom listener >/dev/null

# Idle heartbeat: empty mailbox + elapsed timeout => exit 2, nothing on stdout.
wout=""; wrc=0
wout="$($A watch wroom listener --interval 1 --timeout 1 2>/dev/null)" || wrc=$?
assert_eq "watch exits 2 on idle timeout" "2" "$wrc"
assert_eq "watch prints nothing to stdout on timeout" "" "$wout"

# The real use case: watcher is already blocking when the message arrives.
( sleep 2; $A send wroom talker listener "arrived mid-watch" >/dev/null ) &
wout=""; wrc=0
wout="$($A watch wroom listener --interval 1 --timeout 30 2>/dev/null)" || wrc=$?
wait
assert_eq "watch wakes on mail that arrives while blocking" "0" "$wrc"
assert_contains "watch prints the mid-watch body" "arrived mid-watch" "$wout"
assert_eq "mid-watch mail was drained" "0" "$($A count wroom listener)"

# stdout is reserved for message bodies; the banner must go to stderr so the
# caller can inject stdout verbatim.
$A send wroom talker listener "purity check" >/dev/null
wout="$($A watch wroom listener --interval 1 --timeout 30 2>/dev/null)" || true
case "$wout" in *"watching 'listener'"*) bad "watch banner stays off stdout" "banner leaked to stdout";; *) ok "watch banner stays off stdout";; esac

# Validation — all of these must fail loudly (exit 1), never block.
assert_fail "watch rejects a missing room"        "$A" watch
assert_fail "watch rejects a missing id"          "$A" watch wroom
assert_fail "watch rejects an unknown room"       "$A" watch nosuchroom listener --timeout 1
assert_fail "watch rejects a non-numeric interval" "$A" watch wroom listener --interval abc
assert_fail "watch rejects interval 0"            "$A" watch wroom listener --interval 0
assert_fail "watch rejects a non-numeric timeout" "$A" watch wroom listener --timeout abc
assert_fail "watch rejects an unknown flag"       "$A" watch wroom listener --nope
assert_fail "watch rejects an extra argument"     "$A" watch wroom listener extra
assert_fail "watch rejects an invalid id"         "$A" watch wroom 'bad__id' --timeout 1
assert_contains "help documents watch" "agentmsg watch" "$($A help)"
assert_contains "help documents unwatch" "agentmsg unwatch" "$($A help)"
assert_contains "help documents watchers" "agentmsg watchers" "$($A help)"

# ── watcher lifecycle: registry, single-watcher rule, unwatch ─────────────
section "watch lifecycle (unwatch / watchers / single-watcher rule)"

WPIDF="$AGENT_MSG_HOME/wroom/watchers/listener.pid"

# start_watcher <room> <id> [flags...] -> echoes the shell pid, waits for the
# pidfile so the test never races the watcher's startup.
start_watcher() {
  local r="$1" i="$2"; shift 2
  "$A" watch "$r" "$i" "$@" >/dev/null 2>&1 &
  local wp=$! n=0
  while [[ ! -f "$AGENT_MSG_HOME/$r/watchers/$i.pid" ]] && (( n < 50 )); do sleep 0.1; n=$((n+1)); done
  echo "$wp"
}
# gone <pid> -> 0 if the process is no longer running
gone() { ! kill -0 "$1" 2>/dev/null; }

assert_contains "watchers is empty before any watcher" "no live watchers" "$($A watchers)"

wpid="$(start_watcher wroom listener --interval 30 --timeout 300)"
assert_eq "watch writes a pidfile" "1" "$([[ -f "$WPIDF" ]] && echo 1 || echo 0)"
assert_eq "pidfile holds the watcher pid" "$wpid" "$(head -n1 "$WPIDF")"
assert_contains "watchers lists the live watcher" "wroom  listener  pid=$wpid" "$($A watchers)"
assert_contains "watchers <room> filters to that room" "listener" "$($A watchers wroom)"

# The single-watcher rule is enforced, not advisory: a silent split mailbox is
# worse than a loud error.
assert_fail "a second watch on a live mailbox is refused" "$A" watch wroom listener --timeout 5
out="$($A watch wroom listener --timeout 5 2>&1 || true)"
assert_contains "refusal names the running pid" "already running (pid $wpid)" "$out"
assert_contains "refusal tells you how to stop it" "agentmsg unwatch wroom listener" "$out"
assert_contains "a different id may watch the same room" "watching 'talker'" "$($A watch wroom talker --interval 1 --timeout 1 2>&1 || true)"

# unwatch must interrupt a 30s nap promptly — proof the sleep is interruptible.
t0=$SECONDS
assert_contains "unwatch reports the stop" "stopped watcher for 'listener'" "$($A unwatch wroom listener)"
assert_eq "unwatch returns well inside the poll interval" "0" "$(( (SECONDS - t0) >= 10 ? 1 : 0 ))"
n=0; while ! gone "$wpid" && (( n < 50 )); do sleep 0.1; n=$((n+1)); done
assert_eq "the watcher process is actually dead" "0" "$(gone "$wpid" && echo 0 || echo 1)"
assert_eq "unwatch removed the pidfile" "0" "$([[ -f "$WPIDF" ]] && echo 1 || echo 0)"
assert_contains "watchers is empty again" "no live watchers" "$($A watchers)"

# Stopping is idempotent so an agent can always run it.
assert_contains "unwatch with nothing running is a no-op" "no watcher running" "$($A unwatch wroom listener)"
assert_ok "unwatch with nothing running still exits 0" "$A" unwatch wroom listener

# The watcher cleans up after itself on its own exits, not just on unwatch.
$A send wroom talker listener "exit cleanup check" >/dev/null
$A watch wroom listener --interval 1 --timeout 30 >/dev/null 2>&1 || true
assert_eq "pidfile removed after a mail exit" "0" "$([[ -f "$WPIDF" ]] && echo 1 || echo 0)"
$A watch wroom listener --interval 1 --timeout 1 >/dev/null 2>&1 || true
assert_eq "pidfile removed after a timeout exit" "0" "$([[ -f "$WPIDF" ]] && echo 1 || echo 0)"

# A crashed watcher leaves a stale pidfile; it must not block the next one.
echo 999999 > "$WPIDF"
assert_contains "a stale pidfile is not reported as live" "no live watchers" "$($A watchers)"
# Exit 2 (idle heartbeat) proves it STARTED; exit 1 would mean it was refused.
wrc=0; $A watch wroom listener --interval 1 --timeout 1 >/dev/null 2>&1 || wrc=$?
assert_eq "a stale pidfile does not block a new watcher" "2" "$wrc"
assert_eq "stale pidfile was pruned" "0" "$([[ -f "$WPIDF" ]] && echo 1 || echo 0)"

# PID reuse: a recycled pid belonging to some unrelated process must never be
# claimed as ours, and above all must never be killed by unwatch.
sleep 300 & victim=$!
echo "$victim" > "$WPIDF"
assert_contains "a recycled pid is not claimed as a watcher" "no watcher running" "$($A unwatch wroom listener)"
assert_eq "unwatch did NOT kill the unrelated process" "0" "$(kill -0 "$victim" 2>/dev/null && echo 0 || echo 1)"
kill "$victim" 2>/dev/null || true; wait "$victim" 2>/dev/null || true

# --replace: take over a live mailbox in one step.
wpid="$(start_watcher wroom listener --interval 30 --timeout 300)"
$A send wroom talker listener "after replace" >/dev/null
assert_contains "--replace takes over and delivers" "after replace" "$($A watch wroom listener --replace --interval 1 --timeout 20 2>/dev/null || true)"
n=0; while ! gone "$wpid" && (( n < 50 )); do sleep 0.1; n=$((n+1)); done
assert_eq "--replace stopped the previous watcher" "0" "$(gone "$wpid" && echo 0 || echo 1)"
$A unwatch wroom listener >/dev/null 2>&1 || true

# Validation.
assert_fail "unwatch rejects a missing room" "$A" unwatch
assert_fail "unwatch rejects a missing id"   "$A" unwatch wroom
assert_fail "unwatch rejects an unknown room" "$A" unwatch nosuchroom listener
assert_fail "watchers rejects an unknown room" "$A" watchers nosuchroom

# ── broadcast (--all / --role) ────────────────────────────────────────────
section "broadcast"
$A init bc >/dev/null
$A join bc boss >/dev/null
$A join bc eng1 Engineer >/dev/null
$A join bc eng2 engineer >/dev/null          # different case on purpose
$A join bc pm "Head of Product" >/dev/null

out="$($A send bc boss --all "all hands at 4")"
assert_contains "--all reports the recipient count" "3 recipient(s)" "$out"
assert_eq "--all delivered to eng1" "1" "$($A count bc eng1)"
assert_eq "--all delivered to eng2" "1" "$($A count bc eng2)"
assert_eq "--all delivered to pm"   "1" "$($A count bc pm)"
assert_eq "--all did NOT deliver to the sender" "0" "$($A count bc boss)"
assert_contains "broadcast messages are tagged" "broadcast: all" "$($A peek bc pm)"

# Role matching is case-insensitive: the user says "the CTO", the role was
# typed by hand, and those will not always agree.
out="$($A send bc boss --role engineer "deploy freeze")"
assert_contains "--role reports the recipient count" "2 recipient(s)" "$out"
assert_eq "--role reached the Engineer" "2" "$($A count bc eng1)"
assert_eq "--role reached the engineer (other case)" "2" "$($A count bc eng2)"
assert_eq "--role skipped the non-matching role" "1" "$($A count bc pm)"
assert_contains "--role messages record the role" "broadcast: role=engineer" "$($A peek bc eng1)"
assert_contains "--role matches regardless of query case" "1 recipient(s)" "$($A send bc boss --role "HEAD OF PRODUCT" "roadmap?")"

# A sender never broadcasts to itself, even when it shares the target role.
$A join bc boss Engineer >/dev/null
assert_contains "--role excludes the sender" "2 recipient(s)" "$($A send bc boss --role engineer "still two")"
assert_eq "sender still has an empty mailbox" "0" "$($A count bc boss)"

assert_fail "--role with no match fails"        "$A" send bc boss --role nobody "hello"
assert_fail "--role without a role name fails"  "$A" send bc boss --role
assert_fail "--all with an empty body fails"    "$A" send bc boss --all
assert_fail "--role with an empty body fails"   "$A" send bc boss --role engineer
assert_fail "an unknown send flag fails"        "$A" send bc boss --nope "hi"
$A init empty_bc >/dev/null; $A join empty_bc solo >/dev/null
assert_fail "--all with nobody else fails"      "$A" send empty_bc solo --all "anyone?"

# ── leave / rmroom ────────────────────────────────────────────────────────
section "leave + rmroom"
$A init lv >/dev/null
$A join lv stay >/dev/null
$A join lv goer >/dev/null
$A join lv dirty >/dev/null

assert_contains "leave deregisters an identity" "left room 'lv'" "$($A leave lv goer)"
assert_eq "the .agent file is gone" "0" "$([[ -f "$AGENT_MSG_HOME/lv/agents/goer.agent" ]] && echo 1 || echo 0)"
assert_eq "agents no longer lists them" "0" "$(grep -c '^goer$' <<<"$($A agents lv)")"
assert_fail "leaving twice fails" "$A" leave lv goer

# Leaving with mail queued would silently destroy someone else's note.
$A send lv stay dirty "please read me" >/dev/null
assert_fail "leave refuses while mail is queued" "$A" leave lv dirty
assert_contains "the refusal says how to proceed" "pass --force to discard" "$($A leave lv dirty 2>&1 || true)"
assert_eq "the refused leave changed nothing" "1" "$($A count lv dirty)"
assert_contains "leave --force discards queued mail" "1 queued message(s) discarded" "$($A leave lv dirty --force)"
assert_eq "the queue is really gone" "0" "$(ls "$AGENT_MSG_HOME/lv/messages" | grep -c '^dirty__' || true)"

# A departed identity must not keep a watcher polling a mailbox nobody owns.
$A join lv watched >/dev/null
wpid="$(start_watcher lv watched --interval 30 --timeout 300)"
$A leave lv watched >/dev/null
n=0; while ! gone "$wpid" && (( n < 50 )); do sleep 0.1; n=$((n+1)); done
assert_eq "leave stops that identity's watcher" "0" "$(gone "$wpid" && echo 0 || echo 1)"

# rmroom is unrecoverable, so it must say what it would destroy and refuse.
$A init doomed >/dev/null
$A join doomed a >/dev/null
$A join doomed b >/dev/null
$A send doomed a b "bye" >/dev/null
assert_fail "rmroom refuses without --force" "$A" rmroom doomed
out="$($A rmroom doomed 2>&1 || true)"
assert_contains "the refusal counts identities" "2 identity(ies)" "$out"
assert_contains "the refusal counts queued mail" "1 queued message(s)" "$out"
assert_eq "the refused rmroom deleted nothing" "1" "$([[ -d "$AGENT_MSG_HOME/doomed" ]] && echo 1 || echo 0)"
assert_contains "rmroom --force deletes" "deleted room 'doomed'" "$($A rmroom doomed --force)"
assert_eq "the room tree is gone" "0" "$([[ -d "$AGENT_MSG_HOME/doomed" ]] && echo 1 || echo 0)"
assert_eq "rooms no longer lists it" "0" "$(grep -c '^doomed$' <<<"$($A rooms)" || true)"
assert_fail "rmroom on an unknown room fails" "$A" rmroom nosuchroom --force

# ── archive + history ─────────────────────────────────────────────────────
section "archive + history"
$A init ar >/dev/null
$A join ar keep >/dev/null
$A join ar sender >/dev/null

# Default is still destructive — read-once must not change silently.
$A send ar sender keep "vanishes" >/dev/null
$A read ar keep >/dev/null
assert_eq "a plain read leaves no archive" "0" "$(ls "$AGENT_MSG_HOME/ar/archive" 2>/dev/null | wc -l | tr -d ' ')"

$A send ar sender keep "kept forever" >/dev/null
out="$($A read ar keep --archive)"
assert_contains "read --archive says so" "read-once, archiving" "$out"
assert_eq "the inbox is empty after archiving" "0" "$($A count ar keep)"
assert_eq "the archive holds it" "1" "$(ls "$AGENT_MSG_HOME/ar/archive" | wc -l | tr -d ' ')"
assert_contains "history replays it" "kept forever" "$($A history ar keep)"
assert_contains "history is scoped to the room too" "kept forever" "$($A history ar)"

# The env var flips the default for a whole session; the flag still wins.
$A send ar sender keep "env archived" >/dev/null
AGENT_MSG_ARCHIVE=1 $A read ar keep >/dev/null
assert_eq "AGENT_MSG_ARCHIVE=1 archives by default" "2" "$(ls "$AGENT_MSG_HOME/ar/archive" | wc -l | tr -d ' ')"
$A send ar sender keep "explicitly deleted" >/dev/null
AGENT_MSG_ARCHIVE=1 $A read ar keep --no-archive >/dev/null
assert_eq "--no-archive overrides the env var" "2" "$(ls "$AGENT_MSG_HOME/ar/archive" | wc -l | tr -d ' ')"

# drain and watch archive too, or a watching session would lose everything.
$A send ar sender keep "drained + archived" >/dev/null
$A drain ar keep --archive >/dev/null
assert_eq "drain --archive archives" "3" "$(ls "$AGENT_MSG_HOME/ar/archive" | wc -l | tr -d ' ')"
$A send ar sender keep "watched + archived" >/dev/null
$A watch ar keep --interval 1 --timeout 20 --archive >/dev/null 2>&1 || true
assert_eq "watch --archive archives" "4" "$(ls "$AGENT_MSG_HOME/ar/archive" | wc -l | tr -d ' ')"

# history limits: newest kept, but printed oldest-first.
hist_all="$($A history ar keep --all)"
assert_contains "history --all shows the oldest" "kept forever" "$hist_all"
assert_contains "history --all shows the newest" "watched + archived" "$hist_all"
hist1="$($A history ar keep --limit 1)"
assert_contains "history --limit keeps the NEWEST" "watched + archived" "$hist1"
assert_eq "history --limit drops older ones" "0" "$(grep -c 'kept forever' <<<"$hist1")"
assert_contains "history reports how many it showed" "1 of 4 archived" "$hist1"
$A init noarch >/dev/null
assert_contains "history explains an empty archive" "archiving is opt-in" "$($A history noarch)"
assert_fail "history rejects a bad limit" "$A" history ar keep --limit abc
assert_fail "history rejects an unknown room" "$A" history nosuchroom

# ── watcher claim is atomic (no TOCTOU) ───────────────────────────────────
section "watcher claim race"
$A init race >/dev/null
$A join race target >/dev/null
racers=()
for i in 1 2 3 4 5; do
  $A watch race target --interval 30 --timeout 60 >/dev/null 2>&1 &
  racers+=( $! )
done
sleep 1
live="$($A watchers race | grep -c 'target' || true)"
assert_eq "exactly one of 5 simultaneous watchers wins" "1" "$live"
$A unwatch race target >/dev/null
for rp in "${racers[@]}"; do wait "$rp" 2>/dev/null || true; done
assert_contains "the mailbox is free afterwards" "no live watchers" "$($A watchers race)"

# ── summary ───────────────────────────────────────────────────────────────
printf '\n\033[1mResult:\033[0m %d passed, %d failed\n' "$pass" "$fail"
[[ "$fail" -eq 0 ]] || exit 1

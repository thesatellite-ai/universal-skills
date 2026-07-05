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

# ── summary ───────────────────────────────────────────────────────────────
printf '\n\033[1mResult:\033[0m %d passed, %d failed\n' "$pass" "$fail"
[[ "$fail" -eq 0 ]] || exit 1

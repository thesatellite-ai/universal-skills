#!/usr/bin/env bash
#
# bench.sh — throughput benchmark for agentmsg (isolated temp tree).
#
# Measures sequential send throughput, bulk read+delete, the archive path, a
# broadcast fan-out, and watcher wake-up latency.
# Usage: bench.sh [N]   (default N=500)
#
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
A="$HERE/agentmsg"
N="${1:-500}"

export AGENT_MSG_HOME
AGENT_MSG_HOME="$(mktemp -d)/agent-messages"
trap 'rm -rf "$(dirname "$AGENT_MSG_HOME")"' EXIT

$A init bench >/dev/null
$A join bench sink >/dev/null

secs() { perl -MTime::HiRes=time -e 'printf "%.4f", time'; }
rate() { perl -e 'printf "%.0f", $ARGV[0] > 0 ? $ARGV[1]/$ARGV[0] : 0' "$1" "$2"; }

printf '\033[1magentmsg benchmark\033[0m  (N=%d, root=%s)\n\n' "$N" "$AGENT_MSG_HOME"

t0="$(secs)"
for i in $(seq 1 "$N"); do $A send bench worker sink "payload number $i with some words" >/dev/null; done
t1="$(secs)"
send_dt="$(perl -e 'printf "%.3f", $ARGV[1]-$ARGV[0]' "$t0" "$t1")"
printf '  send  %5d msgs in %7ss   → %5s msg/s\n' "$N" "$send_dt" "$(rate "$send_dt" "$N")"

cnt="$($A count bench sink)"
printf '  queue depth verified: %s / %s\n' "$cnt" "$N"

t2="$(secs)"
$A read bench sink >/dev/null
t3="$(secs)"
read_dt="$(perl -e 'printf "%.3f", $ARGV[1]-$ARGV[0]' "$t2" "$t3")"
printf '  read  %5d msgs in %7ss   → %5s msg/s\n' "$N" "$read_dt" "$(rate "$read_dt" "$N")"

printf '  queue depth after read: %s\n' "$($A count bench sink)"

# Archiving swaps an unlink for a same-directory rename. Worth measuring: it is
# the path a session runs on every delivery once AGENT_MSG_ARCHIVE is on.
for i in $(seq 1 "$N"); do $A send bench worker sink "archive payload $i" >/dev/null; done
t4="$(secs)"
$A read bench sink --archive >/dev/null
t5="$(secs)"
arch_dt="$(perl -e 'printf "%.3f", $ARGV[1]-$ARGV[0]' "$t4" "$t5")"
printf '  read  %5d msgs in %7ss   → %5s msg/s   (--archive)\n' "$N" "$arch_dt" "$(rate "$arch_dt" "$N")"

# Fan-out cost: one independent file per recipient, so this scales linearly and
# is the number to watch before pointing --all at a large room.
FAN=50
$A init fan >/dev/null
$A join fan boss >/dev/null
for i in $(seq 1 "$FAN"); do $A join fan "member$i" Engineer >/dev/null; done
t6="$(secs)"
$A send fan boss --all "fan-out payload" >/dev/null
t7="$(secs)"
fan_dt="$(perl -e 'printf "%.3f", $ARGV[1]-$ARGV[0]' "$t6" "$t7")"
printf '  send  %5d fan-out in %7ss   → %5s msg/s   (--all)\n' "$FAN" "$fan_dt" "$(rate "$fan_dt" "$FAN")"

# Watcher wake-up: how long from "mail lands" to "watcher has exited with it".
# This is the number that decides whether --interval 60 feels instant or laggy;
# a 1s interval isolates the polling overhead from the configured cadence.
$A init wbench >/dev/null
$A join wbench listener >/dev/null
$A join wbench poster >/dev/null
( sleep 2; $A send wbench poster listener "wake up" >/dev/null ) &
t8="$(secs)"
$A watch wbench listener --interval 1 --timeout 30 >/dev/null 2>&1 || true
t9="$(secs)"
wait
wake_dt="$(perl -e 'printf "%.3f", $ARGV[1]-$ARGV[0]-2' "$t8" "$t9")"
printf '  watch wake-up latency: %ss after arrival (--interval 1)\n' "$wake_dt"

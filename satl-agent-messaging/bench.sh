#!/usr/bin/env bash
#
# bench.sh — throughput benchmark for agentmsg (isolated temp tree).
#
# Measures sequential send throughput and bulk-read+delete throughput.
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

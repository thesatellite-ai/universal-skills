#!/usr/bin/env bash
# Behavioral test suite for project-memory. Runs entirely in an isolated temp tree —
# never touches a real .ai/memory store. Run: bash test.sh  (or `task test`)

set -uo pipefail

CLI="$(cd "$(dirname "$0")" && pwd)/project-memory"
TMP=$(mktemp -d)
export MEMORY_DIR="$TMP/.ai/memory"
trap 'rm -rf "$TMP"' EXIT

pass=0; fail=0
ok()   { pass=$((pass+1)); printf '  ok   %s\n' "$1"; }
bad()  { fail=$((fail+1)); printf '  FAIL %s\n' "$1"; }
check() { if [ "$2" = "$3" ]; then ok "$1"; else bad "$1 (want '$3', got '$2')"; fi; }
contains() { if printf '%s' "$2" | grep -qF -- "$3"; then ok "$1"; else bad "$1 (missing '$3')"; fi; }
missing()  { if printf '%s' "$2" | grep -qF -- "$3"; then bad "$1 (unexpected '$3')"; else ok "$1"; fi; }

printf 'project-memory test suite\n\n'

# --- init ------------------------------------------------------------------
printf 'init\n'
"$CLI" init > /dev/null
[ -f "$MEMORY_DIR/INDEX.md" ] && ok "creates INDEX.md" || bad "creates INDEX.md"
[ -f "$MEMORY_DIR/FILES.md" ] && ok "creates FILES.md" || bad "creates FILES.md"
contains "empty store still writes a header" "$(cat "$MEMORY_DIR/INDEX.md")" "# Memory index"
"$CLI" check > /dev/null 2>&1
check "check passes on a fresh empty store" "$?" "0"

# --- new -------------------------------------------------------------------
printf '\nnew\n'
P1=$("$CLI" new gotcha "Vite HMR drops symlinked packages")
contains "slugifies the title" "$P1" "01-vite-hmr-drops-symlinked-packages.md"
contains "file lands in today's date dir" "$P1" "$(date +%F)"
contains "template has the Why section" "$(cat "$P1")" "**Why**"
contains "template has the Don't section" "$(cat "$P1")" "**Don't**"
check "id matches date-NN" "$(grep '^id:' "$P1" | cut -d' ' -f2)" "$(date +%F)-01"

P2=$("$CLI" new decision "Dropped Redis for the job queue")
check "second chunk increments the sequence" "$(grep '^id:' "$P2" | cut -d' ' -f2)" "$(date +%F)-02"

OUT=$("$CLI" new nonsense "bad type" 2>&1); rc=$?
check "rejects an unknown type" "$rc" "1"
contains "explains the valid types" "$OUT" "valid:"

OUT=$("$CLI" new gotcha 2>&1); rc=$?
check "rejects a missing title" "$rc" "1"

# --- index -----------------------------------------------------------------
printf '\nindex\n'
# Fill in real frontmatter so the indexes have something to key on.
perl -0pi -e 's/^tags: \[\]$/tags: [vite, hmr]/m;  s/^files: \[\]$/files: [vite.config.ts, packages\/ui\/]/m' "$P1"
perl -0pi -e 's/^tags: \[\]$/tags: [queue, redis]/m; s/^files: \[\]$/files: [src\/queue.ts]/m'                  "$P2"
"$CLI" index > /dev/null
IDX=$(cat "$MEMORY_DIR/INDEX.md"); FIL=$(cat "$MEMORY_DIR/FILES.md")
contains "index lists chunk 1 by title" "$IDX" "Vite HMR drops symlinked packages"
contains "index lists chunk 2 by title" "$IDX" "Dropped Redis for the job queue"
contains "index carries the type"       "$IDX" "| gotcha |"
contains "index carries the tags"       "$IDX" "vite, hmr"
contains "index links to the chunk"     "$IDX" "($(date +%F)/01-vite-hmr-drops-symlinked-packages.md)"
check   "newest chunk sorts first"      "$(printf '%s' "$IDX" | grep -n 'Dropped Redis' | cut -d: -f1)" \
                                        "$(( $(printf '%s' "$IDX" | grep -n 'Vite HMR' | cut -d: -f1) - 1 ))"
contains "reverse index maps a file"      "$FIL" "| vite.config.ts |"
contains "reverse index maps a directory" "$FIL" "| packages/ui/ |"
contains "reverse index maps chunk 2"     "$FIL" "| src/queue.ts |"
missing  "generated files exclude themselves" "$IDX" "INDEX.md)"

# One file named by two chunks must collapse into a single row listing both.
P3=$("$CLI" new convention "Vite config owns all aliases")
perl -0pi -e 's/^files: \[\]$/files: [vite.config.ts]/m' "$P3"
"$CLI" index > /dev/null
ROW=$(grep -F '| vite.config.ts |' "$MEMORY_DIR/FILES.md")
check "shared path yields exactly one row" "$(printf '%s\n' "$ROW" | wc -l | tr -d ' ')" "1"
contains "shared path lists both chunks" "$ROW" "$(date +%F)-03"
contains "shared path keeps the first chunk" "$ROW" "$(date +%F)-01"

# Regression pin: a chunk whose `files:` list is empty must still be indexed.
# An empty list once ended the collection loop on a false test and aborted the
# whole `index` run under `set -e`, truncating INDEX.md.
"$CLI" new state "No files attached" > /dev/null
"$CLI" index > /dev/null
contains "chunk with empty files list is still indexed" "$(cat "$MEMORY_DIR/INDEX.md")" "No files attached"
contains "chunks before it survive the empty list"      "$(cat "$MEMORY_DIR/INDEX.md")" "Vite HMR drops symlinked packages"

# --- check -----------------------------------------------------------------
printf '\ncheck\n'
"$CLI" check > /dev/null 2>&1
check "check passes right after index" "$?" "0"
"$CLI" new gotcha "Unindexed chunk" > /dev/null
"$CLI" check > /dev/null 2>&1
check "check fails when a chunk is unindexed" "$?" "1"
"$CLI" check > /dev/null 2>&1
check "check self-heals, so the next run passes" "$?" "0"

# --- find / files ----------------------------------------------------------
printf '\nfind / files\n'
contains "find matches a title word" "$("$CLI" find Redis)" "Dropped Redis for the job queue"
contains "find is case-insensitive"  "$("$CLI" find redis)" "Dropped Redis for the job queue"
missing  "find excludes the indexes" "$("$CLI" find Redis)" "INDEX"
check    "find on no match is empty" "$("$CLI" find zzzznotpresent)" ""
contains "files resolves a path"     "$("$CLI" files vite.config.ts)" "$(date +%F)-01"
contains "files reports an unknown path" "$("$CLI" files nope/nope.ts)" "no chunks recorded"

# --- store discovery -------------------------------------------------------
printf '\nstore discovery\n'
mkdir -p "$TMP/src/deep/nested"
OUT=$(cd "$TMP/src/deep/nested" && MEMORY_DIR= "$CLI" files vite.config.ts)
contains "walks up from a nested cwd to find the store" "$OUT" "$(date +%F)-01"

# --- misc ------------------------------------------------------------------
printf '\nmisc\n'
OUT=$("$CLI" bogus 2>&1); rc=$?
check "unknown command exits non-zero" "$rc" "1"
contains "unknown command suggests help" "$OUT" "project-memory help"
contains "help lists every command" "$("$CLI" help)" "project-memory check"

printf '\n%d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]

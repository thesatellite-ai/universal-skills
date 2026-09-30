#!/usr/bin/env bash
#
# test.sh — behavioral suite for spec-promises.
#
# Every case builds a small project in an isolated mktemp dir and asserts on
# the CLI's output and exit code. Each failure mode `check` exists to catch is
# produced on purpose, so a check that silently stopped firing fails here.
# Bash 3.2 safe (macOS ships it): no mapfile, no associative arrays.
#
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SP="$HERE/spec-promises"
T="$(mktemp -d)"
trap '/bin/rm -rf "$T"' EXIT

pass=0; fail=0
ok()  { pass=$((pass+1)); printf '  \033[32m✓\033[0m %s\n' "$1"; }
bad() { fail=$((fail+1)); printf '  \033[31m✗\033[0m %s\n' "$1"; if [[ -n "${2:-}" ]]; then printf '      %s\n' "$2"; fi; }
assert_contains()     { case "$3" in *"$2"*) ok "$1";; *) bad "$1" "missing [$2] in [$3]";; esac; }
assert_not_contains() { case "$3" in *"$2"*) bad "$1" "unexpected [$2]";; *) ok "$1";; esac; }
assert_eq() { if [[ "$2" == "$3" ]]; then ok "$1"; else bad "$1" "expected [$2] got [$3]"; fi; }
section() { printf '\n\033[1m%s\033[0m\n' "$1"; }

# project <dir> — a spec with two promises, one prose line, and a test pinning one.
project() {
  mkdir -p "$1/docs" "$1/pkg"
  cat > "$1/docs/SPEC.md" <<'EOF'
# Spec

The cache never stores a secret. Plain sentences are ignored.

Exports are always sorted by id.

- Never paste code into a doc.

```text
never read inside a fence
```
EOF
  printf '# spec: docs/SPEC.md\n\ncache-secret\ttest\tThe cache never stores a secret.\nexport-order\ttest\tExports are always sorted by id.\nauthor-advice\tprose: advice to authors\tNever paste code into a doc.\n' > "$1/promises.txt"
  printf 'package pkg\n\n// promise:cache-secret promise:export-order\nfunc TestCache(t *testing.T) {}\n' > "$1/pkg/cache_test.go"
}

check() { ( cd "$1" && "$SP" check --list promises.txt "${@:2}" 2>&1 ); }

section "scan"
project "$T/a"
out=$(cd "$T/a" && "$SP" scan docs/SPEC.md)
assert_contains "scan finds a never sentence with its line" "docs/SPEC.md:3	The cache never stores a secret." "$out"
assert_contains "scan finds an always sentence" "Exports are always sorted by id." "$out"
assert_not_contains "scan splits sentences: the plain one is left out" "Plain sentences" "$out"
assert_not_contains "scan skips fenced code" "inside a fence" "$out"
assert_eq "scan finds exactly three" "3" "$(printf '%s\n' "$out" | grep -c .)"

section "check: a consistent project passes"
out=$(check "$T/a"); rc=$?
assert_eq "exit 0" "0" "$rc"
assert_contains "summary counts tested and prose" "2 tested, 1 prose" "$out"

section "check: a new promise that is not listed"
project "$T/b"
printf '\nThe importer must not follow symlinks.\n' >> "$T/b/docs/SPEC.md"
out=$(check "$T/b"); rc=$?
assert_eq "exit 1" "1" "$rc"
assert_contains "names the unlisted sentence and its line" "docs/SPEC.md:13: promise not in promises.txt: 'The importer must not follow symlinks.'" "$out"

section "check: a listed promise reworded in the spec"
project "$T/c"
sed -i.bak 's/always sorted by id/sorted by id/' "$T/c/docs/SPEC.md"
out=$(check "$T/c"); rc=$?
assert_eq "exit 1" "1" "$rc"
assert_contains "names the stale quote" "export-order: quote no longer in the spec" "$out"

section "check: a test promise nothing pins"
project "$T/d"
printf 'package pkg\n\n// promise:cache-secret\nfunc TestCache(t *testing.T) {}\n' > "$T/d/pkg/cache_test.go"
out=$(check "$T/d"); rc=$?
assert_eq "exit 1" "1" "$rc"
assert_contains "names the unpinned id" "export-order: no test names promise:export-order" "$out"

section "check: a prose promise needs no test"
project "$T/e"
out=$(check "$T/e")
assert_not_contains "author-advice is not demanded of any test" "promise:author-advice" "$out"

section "check: a typo in a test's reference"
project "$T/f"
printf 'package pkg\n\n// promise:cache-secret promise:export-order promise:cache-secrte\nfunc TestCache(t *testing.T) {}\n' > "$T/f/pkg/cache_test.go"
out=$(check "$T/f"); rc=$?
assert_eq "exit 1" "1" "$rc"
assert_contains "names the unknown id and where" "pkg/cache_test.go: names promise:cache-secrte, which promises.txt does not list" "$out"

section "check: only test files pin"
project "$T/g"
printf 'package pkg\n\n// promise:cache-secret\nfunc TestCache(t *testing.T) {}\n' > "$T/g/pkg/cache_test.go"
printf 'package pkg\n\n// promise:export-order\nfunc Export() {}\n' > "$T/g/pkg/export.go"
out=$(check "$T/g"); rc=$?
assert_eq "a reference in production code does not count" "1" "$rc"
out=$(check "$T/g" --tests '**/*.go'); rc=$?
assert_eq "--tests widens what counts" "0" "$rc"

section "check: dependencies are never searched"
project "$T/h"
printf 'package pkg\n\n// promise:cache-secret\nfunc TestCache(t *testing.T) {}\n' > "$T/h/pkg/cache_test.go"
mkdir -p "$T/h/node_modules/x"; printf '// promise:export-order\n' > "$T/h/node_modules/x/a.test.js"
out=$(check "$T/h"); rc=$?
assert_eq "a reference under node_modules does not pin" "1" "$rc"

section "check: malformed lists are refused, not passed"
project "$T/i"
printf '# spec: docs/SPEC.md\n' > "$T/i/promises.txt"
out=$(check "$T/i"); rc=$?
assert_eq "an empty list exits 2" "2" "$rc"
assert_contains "and says so" "lists no promises" "$out"
printf '# spec: docs/SPEC.md\ncache-secret\tmaybe\tThe cache never stores a secret.\n' > "$T/i/promises.txt"
out=$(check "$T/i"); rc=$?
assert_eq "an unknown kind exits 2" "2" "$rc"
printf '# spec: docs/SPEC.md\nx\tprose: \tThe cache never stores a secret.\n' > "$T/i/promises.txt"
out=$(check "$T/i"); rc=$?
assert_eq "prose with no reason exits 2" "2" "$rc"
printf 'cache-secret\ttest\tThe cache never stores a secret.\n' > "$T/i/promises.txt"
out=$(check "$T/i"); rc=$?
assert_eq "no spec named exits 2" "2" "$rc"
out=$(check "$T/i" --spec docs/SPEC.md --tests '**/*.nothing'); rc=$?
assert_eq "--spec supplies it" "1" "$rc"
assert_contains "and the check runs" "no test names promise:cache-secret" "$out"

section "init"
project "$T/j"
/bin/rm "$T/j/promises.txt"
out=$(cd "$T/j" && "$SP" init docs/SPEC.md --list promises.txt 2>&1); rc=$?
assert_eq "exit 0" "0" "$rc"
assert_contains "reports the count" "3 promise sentence(s)" "$out"
assert_contains "records the spec" "# spec: docs/SPEC.md" "$(cat "$T/j/promises.txt")"
assert_contains "one todo row per sentence" "todo-2	test	Exports are always sorted by id." "$(cat "$T/j/promises.txt")"
out=$(check "$T/j"); rc=$?
assert_eq "a fresh list fails until tests name it" "1" "$rc"
out=$(cd "$T/j" && "$SP" init docs/SPEC.md --list promises.txt 2>&1); rc=$?
assert_eq "init refuses to overwrite" "1" "$rc"

printf '\n%d passed, %d failed\n' "$pass" "$fail"
[[ "$fail" -eq 0 ]]

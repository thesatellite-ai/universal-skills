#!/usr/bin/env bash
#
# test.sh — behavioral suite for design-spec.
#
# Every case builds a site in an isolated mktemp dir and asserts on the CLI's
# output, exit code and generated HTML. Nothing outside that dir is touched,
# except that the shipped example is built into a temp copy. Bash 3.2 safe
# (macOS ships it): no mapfile, no associative arrays.
#
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
D="$HERE/design-spec"
T="$(mktemp -d)"
trap '/bin/rm -rf "$T"' EXIT

pass=0; fail=0
ok()  { pass=$((pass+1)); printf '  \033[32m✓\033[0m %s\n' "$1"; }
bad() { fail=$((fail+1)); printf '  \033[31m✗\033[0m %s\n' "$1"; if [[ -n "${2:-}" ]]; then printf '      %s\n' "$2"; fi; }
assert_contains()     { case "$3" in *"$2"*) ok "$1";; *) bad "$1" "missing [$2]";; esac; }
assert_not_contains() { case "$3" in *"$2"*) bad "$1" "unexpected [$2]";; *) ok "$1";; esac; }
assert_eq() { if [[ "$2" == "$3" ]]; then ok "$1"; else bad "$1" "expected [$2] got [$3]"; fi; }
section() { printf '\n\033[1m%s\033[0m\n' "$1"; }

# site <dir> — a minimal valid site: config plus a one-feature guide.
site() {
  mkdir -p "$1/src"
  cat > "$1/src/site.json" <<'EOF'
{"name": "Demo", "tagline": "A demo.", "groups": [{"name": "Core", "color": "cobalt"}]}
EOF
  cat > "$1/src/guide.md" <<'EOF'
# The guide

<!-- group: Core -->
## Parse

**The problem:** input arrives as `<raw>` text.

**The fix:** parse it.

```text title="you write"
a
```
EOF
}

section "init"
"$D" init "$T/new" --name Demo >/dev/null; rc=$?
assert_eq "init exits 0" 0 "$rc"
assert_eq "init writes every template" "7" "$(ls "$T/new/src" | wc -l | tr -d ' ')"
assert_eq "init copies the stylesheet" "yes" "$([[ -f "$T/new/style.css" ]] && echo yes || echo no)"
assert_contains "init fills in the name" '"name": "Demo"' "$(cat "$T/new/src/site.json")"
"$D" init "$T/new" --name Again >/dev/null 2>&1; rc=$?
assert_eq "init refuses to overwrite" 1 "$rc"
out="$("$D" check "$T/new" 2>&1)"; rc=$?
assert_eq "a fresh scaffold fails check" 1 "$rc"
assert_contains "the scaffold's TODOs are reported" "TODO left in" "$out"

section "build"
site "$T/a"
"$D" build "$T/a" >/dev/null; rc=$?
assert_eq "build exits 0" 0 "$rc"
idx="$(cat "$T/a/index.html")"
assert_contains "the overview has a tile per feature" 'data-feature="parse"' "$idx"
assert_contains "a tile shows the problem line" "Input arrives as" "$idx"
assert_contains "code in a tile is escaped once" "&lt;raw&gt;" "$idx"
assert_not_contains "code in a tile is never escaped twice" "&amp;lt;" "$idx"
assert_not_contains "a page with no source is not in the menu" 'href="cookbook.html"' "$idx"
assert_eq "a missing stylesheet is supplied" "yes" "$([[ -f "$T/a/style.css" ]] && echo yes || echo no)"
guide="$(cat "$T/a/guide.html")"
assert_contains "pages carry a reading time" "min read" "$guide"
cp "$T/a/index.html" "$T/first.html"
"$D" build "$T/a" >/dev/null
assert_eq "building twice gives identical output" "$(cat "$T/first.html")" "$(cat "$T/a/index.html")"

section "rendering"
site "$T/r"
cat >> "$T/r/src/guide.md" <<'EOF'

<!-- group: none -->
## Later

Has [a bad link](javascript:alert(1)) and [a good one](why.html).

```html
<script>alert("x")</script>
```
EOF
printf '# Why\n\nIntro.\n' > "$T/r/src/why.md"
"$D" build "$T/r" >/dev/null
g="$(cat "$T/r/guide.html")"
assert_contains "code blocks are escaped" "&lt;script&gt;alert" "$g"
assert_not_contains "a raw script never reaches the page" '<script>alert("x")' "$g"
assert_not_contains "a javascript: link is not a link" 'href="javascript:' "$g"
assert_contains "a relative link is kept" 'href="why.html"' "$g"
"$D" check "$T/r" >/dev/null 2>&1; rc=$?
assert_eq "a group: none section is not held to the feature rules" 0 "$rc"
assert_contains "pages link to the next page" 'class="next" href="guide.html"' "$(cat "$T/r/why.html")"
printf '# Rules\n\n## Group\n\n### R1 · A rule\n\nText.\n' > "$T/r/src/rules.md"
"$D" build "$T/r" >/dev/null
assert_contains "an optional rules page joins the menu" 'href="rules.html"' "$(cat "$T/r/index.html")"
assert_eq "the rules page is written" "yes" "$([[ -f "$T/r/rules.html" ]] && echo yes || echo no)"

section "check"
site "$T/c"
"$D" check "$T/c" >/dev/null 2>&1; rc=$?
assert_eq "a complete site passes" 0 "$rc"
cat >> "$T/c/src/guide.md" <<'EOF'

## Stray

Text.

<!-- group: Moon -->
## Orphan

**The problem:** x.
EOF
printf '# Cookbook\n\n## Thin recipe\n\n```text title="files"\na\n```\n' > "$T/c/src/cookbook.md"
out="$("$D" check "$T/c" 2>&1)"; rc=$?
assert_eq "problems fail the check" 1 "$rc"
assert_contains "an ungrouped section is reported" '`Stray` has no <!-- group' "$out"
assert_contains "an unknown group is reported" "which site.json does not list" "$out"
assert_contains "a missing fix is reported" "has no **The fix:** line" "$out"
assert_contains "a missing example is reported" "has no example" "$out"
assert_contains "a thin recipe is reported" "needs at least two code blocks" "$out"
json="$("$D" check "$T/c" --json 2>/dev/null)"
assert_contains "json says not ok" '"ok": false' "$json"

section "errors"
mkdir -p "$T/e1/src"
"$D" build "$T/e1" >/dev/null 2>&1; rc=$?
assert_eq "no site.json fails" 1 "$rc"
site "$T/e2"; printf '{"groups": [{"name": "X", "color": "pink"}]}' > "$T/e2/src/site.json"
out="$("$D" build "$T/e2" 2>&1)"; rc=$?
assert_eq "an unknown colour fails" 1 "$rc"
assert_contains "the error names the colours" "use one of" "$out"
site "$T/e3"; printf '{nope' > "$T/e3/src/site.json"
"$D" build "$T/e3" >/dev/null 2>&1; rc=$?
assert_eq "broken json fails" 1 "$rc"

section "the shipped example"
cp -R "$HERE/examples/envcheck" "$T/ex"
"$D" check "$T/ex" >/dev/null 2>&1; rc=$?
assert_eq "the example passes check" 0 "$rc"
"$D" build "$T/ex" >/dev/null
for f in index why picture how-it-works guide cookbook decisions; do
  if ! cmp -s "$T/ex/$f.html" "$HERE/examples/envcheck/$f.html"; then bad "the committed $f.html is up to date" "rebuild examples/envcheck"; else ok "the committed $f.html is up to date"; fi
done

printf '\n%d passed, %d failed\n' "$pass" "$fail"
[[ "$fail" -eq 0 ]]

#!/usr/bin/env bash
#
# lint-skills.sh — structural checks for the skill collection.
#
# The product here is markdown, so nothing else validates it: a typo in a
# `name:` field or a skill missing from the README table is invisible until a
# user hits it. These are the invariants CLAUDE.md states as conventions,
# turned into something that fails.
#
# Checks, per satl-*/ directory:
#   1. SKILL.md exists
#   2. it opens with YAML frontmatter
#   3. frontmatter `name:` equals the directory name
#   4. frontmatter has a non-empty `description:` (the entire trigger surface)
#   5. the skill appears in the root README's skills table
#   6. a skill shipping an executable also ships a test.sh for it
#
# NOT checked: that a CLI is named the skill name minus the `satl-` prefix.
# That is a preference with a standing exception — satl-agent-messaging ships
# `agentmsg`, not `agent-messaging`, and renaming it now would break every doc,
# the installed symlink, and the user's muscle memory for no benefit.
#
# Usage: bash lint-skills.sh   (exit 0 clean, 1 with findings)
set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$HERE"

problems=0
checked=0

fail() { printf '  \033[31m✗\033[0m %-24s %s\n' "$1" "$2"; problems=$((problems + 1)); }

for d in satl-*/; do
  name="${d%/}"
  checked=$((checked + 1))

  if [[ ! -f "$d/SKILL.md" ]]; then
    fail "$name" "no SKILL.md"
    continue
  fi

  if [[ "$(head -n1 "$d/SKILL.md")" != "---" ]]; then
    fail "$name" "SKILL.md does not start with YAML frontmatter"
    continue
  fi

  # Only read the frontmatter block: a later `name:` in prose must not count.
  fm="$(sed -n '2,/^---$/p' "$d/SKILL.md")"

  fm_name="$(printf '%s\n' "$fm" | sed -n 's/^name: *//p' | head -n1)"
  if [[ "$fm_name" != "$name" ]]; then
    fail "$name" "frontmatter name is '$fm_name', expected '$name'"
  fi

  fm_desc="$(printf '%s\n' "$fm" | sed -n 's/^description: *//p' | head -n1)"
  if [[ -z "$fm_desc" ]]; then
    fail "$name" "frontmatter has no description (the skill will never trigger)"
  fi

  # The README table links each skill as `(satl-name/)`.
  if ! grep -q "($name/)" README.md; then
    fail "$name" "missing from the skills table in README.md"
  fi

  # An executable with no test suite is the one thing here that can silently
  # break — the markdown is read by a human, the code is not.
  ships_cli=0
  for f in "$d"*; do
    [[ -f "$f" && -x "$f" ]] || continue
    case "$(basename "$f")" in
      *.sh) continue ;;                                 # helper/test scripts, not the CLI
      *) ships_cli=1 ;;
    esac
  done
  if (( ships_cli == 1 )) && [[ ! -f "$d/test.sh" ]]; then
    fail "$name" "ships an executable but has no test.sh"
  fi
done

if (( problems == 0 )); then
  printf '\033[32m✓\033[0m %d skills checked, no problems\n' "$checked"
  exit 0
fi
printf '\n\033[31m%d problem(s)\033[0m across %d skills\n' "$problems" "$checked"
exit 1

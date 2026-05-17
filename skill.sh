#!/usr/bin/env bash
# skill.sh — install universal-skills into Claude Code.
#
# Usage:
#   ./skill.sh                 list available skills
#   ./skill.sh <name>          install one skill (symlink into ~/.claude/skills)
#   ./skill.sh all             install every skill
#   ./skill.sh <name> --copy   copy instead of symlink (for offline / pinned use)
#   DEST=/path ./skill.sh ...  install into a different skills dir
#
# Symlink (default) keeps the skill live with `git pull`. --copy detaches it.

set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="${DEST:-$HOME/.claude/skills}"

list_skills() {
  find "$REPO_DIR" -mindepth 2 -maxdepth 2 -name SKILL.md -print0 \
    | xargs -0 -n1 dirname 2>/dev/null \
    | xargs -n1 basename 2>/dev/null | sort
}

install_one() {
  local name="$1" mode="${2:-symlink}" src="$REPO_DIR/$name"
  if [[ ! -f "$src/SKILL.md" ]]; then
    echo "✗ '$name' is not a skill (no SKILL.md). Available:" >&2
    list_skills | sed 's/^/  - /' >&2
    return 1
  fi
  mkdir -p "$DEST"
  rm -rf "${DEST:?}/$name"
  if [[ "$mode" == "--copy" ]]; then
    cp -R "$src" "$DEST/$name"; echo "✓ copied  $name → $DEST/$name"
  else
    ln -s "$src" "$DEST/$name"; echo "✓ linked  $name → $DEST/$name"
  fi
}

main() {
  local arg="${1:-}"
  if [[ -z "$arg" ]]; then
    echo "Available skills (DEST=$DEST):"; list_skills | sed 's/^/  - /'
    echo; echo "Install:  ./skill.sh <name>   |   ./skill.sh all"; exit 0
  fi
  if [[ "$arg" == "all" ]]; then
    while read -r s; do install_one "$s" "${2:-symlink}"; done < <(list_skills)
    exit 0
  fi
  install_one "$arg" "${2:-symlink}"
}

main "$@"

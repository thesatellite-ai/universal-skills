#!/usr/bin/env bash
#
# install-hook.sh — wire (or remove) an auto-read UserPromptSubmit hook into a
# project's .claude/settings.json so a Claude session automatically receives
# agentmsg notes on each of your turns, without you asking it to "check messages".
#
# The hook runs `agentmsg drain <room> <id>` before every prompt you submit:
#   - waiting messages get printed (and consumed) → injected into the session's
#     context so the agent reacts to them this turn
#   - empty mailbox → silent, no context noise
#
# It MERGES into settings.json — existing hooks (emdash, other projects, etc.)
# are preserved. Our entry is tagged with a marker comment so removal is exact.
#
# Usage:
#   install-hook.sh <project-dir> <room> <id>     # install / update
#   install-hook.sh --remove <project-dir>        # remove our hook only
#   install-hook.sh --list <project-dir>          # show current UserPromptSubmit hooks
#
set -euo pipefail

MARKER="agentmsg-autoread"   # tag embedded in our hook command for exact matching
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
AGENTMSG="$HERE/agentmsg"

die()  { echo "install-hook: $*" >&2; exit 1; }
info() { echo "install-hook: $*"; }

command -v jq >/dev/null 2>&1 || die "jq is required (brew install jq)"
[[ -x "$AGENTMSG" ]] || die "agentmsg not found/executable at $AGENTMSG"

settings_path() { echo "$1/.claude/settings.json"; }

# Ensure a well-formed settings.json exists (create {} if absent/empty).
ensure_settings() {
  local sp="$1"
  mkdir -p "$(dirname "$sp")"
  if [[ ! -s "$sp" ]]; then echo '{}' > "$sp"; fi
  jq -e . "$sp" >/dev/null 2>&1 || die "$sp is not valid JSON — refusing to touch it"
}

# Strip any of OUR hook entries (matched by MARKER) from UserPromptSubmit.
# Leaves every other hook untouched. Safe on files with no hooks at all.
strip_ours() {
  local sp="$1" tmp
  tmp="$(mktemp)"
  jq --arg m "$MARKER" '
    if (.hooks.UserPromptSubmit | type) == "array" then
      .hooks.UserPromptSubmit |= (
        map(select(
          ((.hooks // []) | map(.command // "" | contains($m)) | any) | not
        ))
      )
      | (if (.hooks.UserPromptSubmit | length) == 0 then del(.hooks.UserPromptSubmit) else . end)
    else . end
  ' "$sp" > "$tmp" && mv "$tmp" "$sp"
}

cmd_install() {
  local dir="${1:-}" room="${2:-}" id="${3:-}"
  [[ -n "$dir" && -n "$room" && -n "$id" ]] || die "usage: install-hook.sh <project-dir> <room> <id>"
  [[ -d "$dir" ]] || die "project dir '$dir' does not exist"
  # Validate names the same way the CLI does, so we never write a broken hook.
  for n in "$room" "$id"; do
    [[ "$n" =~ ^[A-Za-z0-9][A-Za-z0-9_-]*$ && "$n" != *__* ]] || die "invalid name '$n' (letters/digits/-/_ , no __)"
  done

  local sp; sp="$(settings_path "$dir")"
  ensure_settings "$sp"
  strip_ours "$sp"   # idempotent: drop a prior version before re-adding

  # The command: drain, fail-silent, tagged with MARKER (a shell comment).
  local cmd="\"$AGENTMSG\" drain $room $id 2>/dev/null || true # $MARKER"

  local tmp; tmp="$(mktemp)"
  jq --arg cmd "$cmd" '
    .hooks //= {} |
    .hooks.UserPromptSubmit //= [] |
    .hooks.UserPromptSubmit += [ { "hooks": [ { "type": "command", "command": $cmd } ] } ]
  ' "$sp" > "$tmp" && mv "$tmp" "$sp"

  info "installed auto-read hook in $sp"
  info "  → runs: $AGENTMSG drain $room $id  (on every prompt in that session)"
  info "restart / reload that Claude session for the hook to take effect."
}

cmd_remove() {
  local dir="${1:-}"
  [[ -n "$dir" ]] || die "usage: install-hook.sh --remove <project-dir>"
  local sp; sp="$(settings_path "$dir")"
  [[ -f "$sp" ]] || { info "no settings.json at $sp — nothing to remove"; return 0; }
  jq -e . "$sp" >/dev/null 2>&1 || die "$sp is not valid JSON — refusing to touch it"
  local before after
  before="$(jq --arg m "$MARKER" '[.. | .command? // empty | select(contains($m))] | length' "$sp")"
  strip_ours "$sp"
  # If hooks object is now empty, tidy it up.
  local tmp; tmp="$(mktemp)"
  jq 'if (.hooks | type) == "object" and (.hooks | length) == 0 then del(.hooks) else . end' "$sp" > "$tmp" && mv "$tmp" "$sp"
  after="$(jq --arg m "$MARKER" '[.. | .command? // empty | select(contains($m))] | length' "$sp")"
  info "removed $((before - after)) agentmsg hook(s) from $sp"
}

cmd_list() {
  local dir="${1:-}"
  [[ -n "$dir" ]] || die "usage: install-hook.sh --list <project-dir>"
  local sp; sp="$(settings_path "$dir")"
  [[ -f "$sp" ]] || { info "no settings.json at $sp"; return 0; }
  echo "UserPromptSubmit hooks in $sp:"
  jq -r '(.hooks.UserPromptSubmit // []) | .[].hooks[]?.command // empty | "  - " + .' "$sp"
}

main() {
  case "${1:-}" in
    --remove) shift; cmd_remove "$@" ;;
    --list)   shift; cmd_list   "$@" ;;
    -h|--help|"") cat <<EOF
install-hook.sh — auto-read agentmsg hook installer

  install-hook.sh <project-dir> <room> <id>   install / update the hook
  install-hook.sh --remove <project-dir>      remove our hook (keeps other hooks)
  install-hook.sh --list   <project-dir>      list a project's UserPromptSubmit hooks

The hook runs \`agentmsg drain <room> <id>\` on every prompt; waiting messages
are auto-injected into the session, empty mailbox is silent. Merges safely with
existing hooks; removal is exact (matched by the '$MARKER' tag).
EOF
      ;;
    *) cmd_install "$@" ;;
  esac
}

main "$@"

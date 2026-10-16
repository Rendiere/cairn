#!/usr/bin/env bash
# Prints one block per Claude Code session changed in the last N days, newest first: date, title, cwd, the user's own messages.
set -uo pipefail
days="${1:?usage: sessions.sh <days> <profile-dir>...}"; shift
[ $# -gt 0 ] || { echo "sessions.sh: no profile folder given; usage: sessions.sh <days> <profile-dir>..." >&2; exit 2; }
command -v jq >/dev/null 2>&1 || { echo "sessions.sh: jq is not installed; install it (brew install jq) and run again" >&2; exit 1; }
for profile in "$@"; do
  [ -d "$profile/projects" ] || { echo "sessions.sh: $profile has no projects/ folder; fix [sources.claude_code] profiles with /cairn:setup" >&2; exit 1; }
done
for profile in "$@"; do
  find "$profile/projects" -name '*.jsonl' -not -path '*/subagents/*' -mtime "-$days" -print0
done | xargs -0 ls -1t 2>/dev/null |
while IFS= read -r f; do
  title=$(jq -r 'select(.type=="ai-title").aiTitle' "$f" 2>/dev/null | tail -1)
  cwd=$(jq -r 'select(.cwd).cwd' "$f" 2>/dev/null | head -1)
  case "$cwd" in */.claude-mem/*) continue ;; esac
  profile=${f%%/projects/*}
  echo "=== $(date -r "$f" +%F) | $(basename "$profile") | ${title:-untitled} | $cwd"
  jq -r 'select(.type=="user" and (.isMeta|not)) | .message.content
    | if type=="string" then . else (map(select(.type=="text").text) | join(" ")) end
    | select(length > 0)
    | select(startswith("This session is being continued") | not)
    | select((startswith("<") | not) or startswith("<command-name>"))
    | gsub("\\s+"; " ") | .[0:300]' "$f" 2>/dev/null | sed 's/^/- /' || true
done

#!/usr/bin/env bash
# Prints one block per Claude Code session changed in the last N days: title, cwd, the user's own messages.
set -uo pipefail
days="${1:?usage: sessions.sh <days> <profile-dir>...}"; shift
for profile in "$@"; do
  find "$profile/projects" -name '*.jsonl' -not -path '*/subagents/*' -mtime "-$days" -print0 2>/dev/null |
  while IFS= read -r -d '' f; do
    title=$(jq -r 'select(.type=="ai-title").aiTitle' "$f" 2>/dev/null | tail -1)
    cwd=$(jq -r 'select(.cwd).cwd' "$f" 2>/dev/null | head -1)
    case "$cwd" in */.claude-mem/*) continue ;; esac
    echo "=== $(basename "$profile") | ${title:-untitled} | $cwd"
    jq -r 'select(.type=="user" and (.isMeta|not)) | .message.content
      | if type=="string" then . else (map(select(.type=="text").text) | join(" ")) end
      | select(length > 0)
      | select(startswith("This session is being continued") | not)
      | select((startswith("<") | not) or startswith("<command-name>"))
      | gsub("\\s+"; " ") | .[0:300]' "$f" 2>/dev/null | sed 's/^/- /' || true
  done
done

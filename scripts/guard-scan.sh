#!/usr/bin/env bash
# Fails when a commit holds a term from the untracked .git/info/guard-terms, so the list itself is never committed.
#   scripts/guard-scan.sh --all        scan every commit on every ref
#   scripts/guard-scan.sh --pre-push   scan the commits a push sends (refs on stdin, as git passes them)
set -uo pipefail
case "${1:-}" in
  --all | --pre-push) ;;
  *) echo "usage: $0 --all | --pre-push" >&2; exit 2 ;;
esac

terms="$(git rev-parse --git-common-dir)/info/guard-terms"
patterns=$(mktemp)
trap 'rm -f "$patterns"' EXIT
sed -e 's/\r$//' -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' "$terms" 2>/dev/null | grep -v -e '^#' -e '^$' >"$patterns"
if [ ! -s "$patterns" ]; then
  echo "guard-scan: no terms in $terms; add one term per line before pushing." >&2
  exit 1
fi
match=(-i -w -F -f "$patterns")

if [ "$1" = --all ]; then
  list=$(git rev-list --all) || exit 1
else
  zero=0000000000000000000000000000000000000000
  list=""
  while read -r _ local_sha _ remote_sha; do
    [ "$local_sha" = "$zero" ] && continue
    if [ "$remote_sha" = "$zero" ]; then
      range=$(git rev-list "$local_sha" --not --remotes) || exit 1
    else
      range=$(git rev-list "$remote_sha..$local_sha") || exit 1
    fi
    list="$list $range"
  done
fi

found=0
for c in $(printf '%s\n' $list | sort -u); do
  git grep -I -l "${match[@]}" "$c" >/dev/null 2>&1
  status=$?
  [ $status -gt 1 ] && { echo "guard-scan: could not search commit $c" >&2; exit 1; }
  if [ $status -eq 0 ] \
    || grep -q "${match[@]}" <<<"$(git cat-file commit "$c")" \
    || grep -q "${match[@]}" <<<"$(git ls-tree -r --name-only "$c")"; then
    echo "guard-scan: commit $(git log -1 --format='%h %s' "$c") holds a guard term" >&2
    found=1
  fi
done
exit $found

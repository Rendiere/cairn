#!/usr/bin/env bash
# Runs /cairn:setup headless without and with an employer in throwaway folders and checks the result.
set -uo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
tools='Skill Read Write Edit Glob Grep Bash(git:*) Bash(mkdir:*) Bash(cp:*) Bash(ln:*) Bash(ls:*) Bash(cat:*) Bash(touch:*) Bash(test:*) Bash(date:*) Bash(command:*) Bash(printf:*) Bash(echo:*) Bash(rm:*) Bash(bash:*) Bash(find:*) Bash(sed:*) Bash(chmod:*) Bash(cd:*)'
fail=0
real_conf=$HOME/.config/cairn
before=$(ls -la "$real_conf" 2>/dev/null)

check() {
  if eval "$2" >/dev/null 2>&1; then echo "pass  $1"; else echo "FAIL  $1"; fail=1; fi
}

run_setup() {
  local dir=$1 answers=$2
  (cd "$dir" && CAIRN_CONFIG="$dir/config.toml" claude -p "Run the cairn setup skill (/cairn:setup). This is a non-interactive test run: do not ask questions, use these answers, and skip anything they do not cover. The machine file is $dir/config.toml (CAIRN_CONFIG is set to it); write nothing outside $dir. $answers" \
    --plugin-dir "$root" --allowedTools "$tools" --permission-mode acceptEdits >"$dir/setup.log" 2>&1)
}

common='Owner name: Ada. Git email for the vault: ada@example.com. No existing knowledge base. Skip every source probe and record no sources. Cadence: accept the defaults (daily 15 minutes weekdays 08:30, weekly 30 minutes Fri 10:00, monthly 45 minutes first Mon 10:00). Do not create a calendar event or a GitHub repo.'

check_vault() {
  local v=$1
  check "cairn.toml names the owner" "grep -q 'owner *= *\"Ada\"' $v/cairn.toml"
  for t in concept system project synthesis person queue map; do check "template $t.md" "test -f $v/templates/$t.md"; done
  for d in concepts systems projects synthesis people queue study interviews maps; do check "$d/.gitkeep" "test -f $v/$d/.gitkeep"; done
  check "no persons/, .company or .githooks/" "test ! -e $v/persons && test ! -e $v/.company && test ! -e $v/.githooks"
  check "vault is a git repo with a commit" "git -C $v rev-parse HEAD"
}

one=$(mktemp -d)
echo "== no employer: $one"
run_setup "$one" "No employer. New vault at $one/brain. $common"
check "machine config written" "test -f $one/config.toml"
check_vault "$one/brain"
check "no company in cairn.toml" "! grep -q '^company' $one/brain/cairn.toml"

two=$(mktemp -d)
echo "== employer: $two"
run_setup "$two" "Employer: Acme. New vault at $two/brain. $common"
check "machine config written" "test -f $two/config.toml"
check_vault "$two/brain"
check "cairn.toml names the employer" "grep -q 'company *= *\"Acme\"' $two/brain/cairn.toml"

check "real ~/.config/cairn untouched" "test \"\$(ls -la $real_conf 2>/dev/null)\" = \"\$before\""

[ $fail -eq 0 ] && echo "smoke: all checks passed" || echo "smoke: failures above; logs in $one/setup.log and $two/setup.log"
exit $fail

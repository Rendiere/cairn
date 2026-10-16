#!/usr/bin/env bash
# Runs /cairn:setup headless for a one-vault and a two-vault layout in throwaway folders and checks the result.
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

common='Owner name: Ada. Git email for every vault: ada@example.com. No existing knowledge base. Skip every source probe and record no sources. Cadence: accept the defaults (daily 15 minutes weekdays 08:30, weekly 30 minutes Fri 10:00, monthly 45 minutes first Mon 10:00). Do not create a calendar event or a GitHub repo.'

one=$(mktemp -d)
echo "== one vault: $one"
run_setup "$one" "No employer, so one vault. New portable vault at $one/brain. $common"
v=$one/brain
check "machine config written" "test -f $one/config.toml"
check "cairn.toml names the owner" "grep -q 'owner *= *\"Ada\"' $v/cairn.toml"
for t in concept system project synthesis person queue; do check "template $t.md" "test -f $v/templates/$t.md"; done
for d in concepts systems projects synthesis people queue study interviews; do check "$d/.gitkeep" "test -f $v/$d/.gitkeep"; done
check "no persons/ folder" "test ! -e $v/persons"
check "vault is a git repo with a commit" "git -C $v rev-parse HEAD"
check "no guard with one vault" "test -z \"\$(git -C $v config core.hooksPath)\""

two=$(mktemp -d)
echo "== two vaults: $two"
run_setup "$two" "Employer: Acme, so two vaults. New portable vault at $two/brain. New company vault at $two/work. Guard terms: Acme, C++Widget. $common"
p=$two/brain; c=$two/work
check "machine config written" "test -f $two/config.toml"
check "portable cairn.toml names the owner" "grep -q 'owner *= *\"Ada\"' $p/cairn.toml"
check "company cairn.toml names the company" "grep -q 'company *= *\"Acme\"' $c/cairn.toml"
check "company name absent from portable vault" "! grep -rqi acme --exclude-dir=.git --exclude=.company $p"
check "general/ resolves to the portable vault" "test \"\$(cd $c/general && pwd -P)\" = \"\$(cd $p && pwd -P)\""
check ".company lists the terms file" "grep -q '^terms=' $p/.company"
check "core.hooksPath is .githooks" "test \"\$(git -C $p config core.hooksPath)\" = .githooks"
for t in concept synthesis queue; do check "portable template $t.md" "test -f $p/templates/$t.md"; done
for t in system project person synthesis queue map; do check "company template $t.md" "test -f $c/templates/$t.md"; done
check "company people/.gitkeep" "test -f $c/people/.gitkeep"
check "no persons/ folder" "test ! -e $c/persons && test ! -e $p/persons"
echo 'notes on C++Widget' >"$p/smoke-term.md"
git -C "$p" add smoke-term.md
check "guard rejects a listed term" "! (cd $p && .githooks/pre-commit)"
git -C "$p" reset -q smoke-term.md; rm -f "$p/smoke-term.md"
echo 'notes on parquet' >"$p/smoke-clean.md"
git -C "$p" add smoke-clean.md
check "guard passes a clean line" "(cd $p && .githooks/pre-commit)"
git -C "$p" reset -q smoke-clean.md; rm -f "$p/smoke-clean.md"

check "real ~/.config/cairn untouched" "test \"\$(ls -la $real_conf 2>/dev/null)\" = \"\$before\""

[ $fail -eq 0 ] && echo "smoke: all checks passed" || echo "smoke: failures above; logs in $one/setup.log and $two/setup.log"
exit $fail

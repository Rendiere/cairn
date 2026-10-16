# Evidence

Gathered by three read-only agents (structure; copy and honesty; weight, friction and states) reading every
shipped file at commit `09e540c`. The orchestrator re-checked the findings marked ✓ against the source.
Paths are relative to the repo root. Cairn has no GUI, so the visual and accessibility agents were not
deployed; their principles are scored from format-consistency and state evidence below.

## E1. Structure

- E1.1 Four commands, seven invocation forms, four implicit modes (setup re-run, legacy import, study
  refresher, re-interview). `README.md:11-14`, `skills/interview/SKILL.md:50-52`, `skills/study/SKILL.md:29-30`.
- E1.2 Questions per run: setup 9 to 12 with one vault, 13 to 17 with two (`skills/setup/SKILL.md:12-82`);
  a concept interview 9 to 15 turns (`skills/interview/SKILL.md:60,71-84,106,109`).
- E1.3 Steps: setup 10, study 7, interview 10, sweep 12; max depth 2 inside a file. Sweep step 10 can run
  an interview, which can offer a study: a three-skill chain (`skills/sweep/SKILL.md:77`, `skills/interview/SKILL.md:71`).
- E1.4 Rules restated across files: the routing test in 6 files, the guard rule in 9 locations, the
  one-way link rule in 3, the time limit for an interview 4 times in one file, `AGENTS.md` identical to
  `CLAUDE.md` in both vaults. Full list in the structural report; examples `vault/portable/README.md:13-31`,
  `skills/interview/SKILL.md:24-46`.
- E1.5 Orphan config and placeholders: `cadence.slot`, `vaults.company_name`, `sources.granola.enabled`
  written but never read; `cairn.toml` read but never written; `{start}` in `config.example.toml:20,23`
  and `{{date}}`/`{{links}}` in `vault/templates/queue.md:5,10` never filled ✓; `maps/` created with no
  map template; `labs/` never created; empty folders have no `.gitkeep`.

## E2. Copy and honesty

- E2.1 Person notes are written to `persons/` (`skills/interview/SKILL.md:90` ✓) but setup creates
  `people/` (`skills/setup/SKILL.md:39,46` ✓).
- E2.2 "Defensible" needs questions 1, 2 and 5 (`skills/interview/SKILL.md:96-97`); a person has 3
  questions (`:64`), so a person note never becomes defensible and the sweep never drops it.
- E2.3 Sweep says "no note is written here" (`skills/sweep/SKILL.md:8` ✓) and step 10 writes `depends:`
  into existing notes (`:75-76` ✓).
- E2.4 Interview step 8 says `depends:` is confirmed at read-back; read-back asks only "does this sound
  like you?" (`skills/interview/SKILL.md:105-110` ✓).
- E2.5 project and person templates lack `depends:` and "Going deeper", which interview and sweep write to
  (`vault/templates/project.md`, `person.md`; `skills/interview/SKILL.md:103`; `skills/sweep/SKILL.md:76`).
- E2.6 README says setup "switches on the employer-term guard" (`README.md:11`); it is wired only with two
  vaults (`skills/setup/SKILL.md:44-58`). "Rejects the employer's terms" (`README.md:22`) is an unescaped
  substring regex on added lines, bypassed by `--no-verify` (`vault/portable/.githooks/pre-commit:9-11`).
- E2.7 Skill descriptions advertise `/sweep`, `/interview`, `/study`; the plugin's commands are
  `/cairn:*` (`skills/*/SKILL.md:3`).
- E2.8 Time promises (setup 15, interview 10, sweep 30 minutes) are not enforced; interview steps 4 to 10
  run after the clock (`skills/interview/SKILL.md:134-135`).
- E2.9 Setup's vault test needs `templates/concept.md` (`skills/setup/SKILL.md:31-32` ✓); company
  scaffolding never gets it (`:44-45` ✓), so an existing company vault fails the test.
- E2.10 Jargon used before definition: "second brain", "the brain", "defensible", "read-back", "portable",
  "queue item", "synthesis", "study pack", "routing test", "Going deeper", "cadence". First uses at
  `README.md:3-14`, `skills/sweep/SKILL.md:14,49`.
- E2.11 Hook errors state the problem without the fix: missing `.company`, missing or empty terms file, and
  a term hit all print no next step (`vault/portable/.githooks/pre-commit:6-14`); the shipped terms file is
  only a comment, so it counts as empty until setup fills it.
- E2.12 Read-back is "Done when they say yes" with no exit for no (`skills/interview/SKILL.md:109-110` ✓).
- E2.13 No dark patterns. The calendar event and the study offer can be declined (`skills/setup/SKILL.md:81-83`,
  `skills/interview/SKILL.md:72`).

## E3. Weight, friction and states

- E3.1 Install to first note: 2 shell commands, 2 slash commands, 9 or more setup questions, 9 to 15
  interview turns, 0 hand edits (`README.md:30-34`).
- E3.2 Sweep loads every Zoom summary, Drive doc, Slack thread, Granola note and folder file in the window
  with no cap; the window runs from the last sweep, so a missed month means a month of material
  (`skills/sweep/SKILL.md:20-37`). `sessions.sh` caps each message at 300 characters but not the count (`:17`).
- E3.3 Study has no time limit (`skills/study/SKILL.md`); sweep can chain into a study (`skills/sweep/SKILL.md:77`).
- E3.4 States per skill:

  | State | setup | study | interview | sweep |
  |---|---|---|---|---|
  | Missing config | present `:18-23` | indirect `:11-13` | present `:12-13` | present `:16` |
  | Empty (nothing found) | present | no rule | n/a | missing `:68-71` |
  | Interrupted | missing, config written last `:84` | missing, pack written last `:50` | missing, nothing written before step 5 `:86` | missing, record written last `:81` |
  | Error (hook, source, push) | present for hook and sources; push missing | hook present; push missing | hook present; push missing | source present; hook and push missing |
  | Success message | present `:88-98` | present `:48-49` | missing | missing |
  | Same-day re-run | present | present | transcript filename collides `:86` | record overwritten (`BACKLOG.md:92`) |

- E3.5 `sessions.sh` hides `jq` and `find` errors (`2>/dev/null`, `|| true`), so a missing `jq` gives
  empty output with no message (`skills/sweep/scripts/sessions.sh:6-17`).
- E3.6 Lasting interruptions: one optional recurring calendar event (`skills/setup/SKILL.md:81-82`).

## Gaps

Nothing was executed: no run of setup, the hook or `sessions.sh`. Whether `../../vault/` paths resolve from
the installed plugin cache, and whether bare `/sweep` triggers fire, are unverified.

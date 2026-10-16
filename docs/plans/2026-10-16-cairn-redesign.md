# Cairn redesign plan

Cairn is a Claude Code plugin (repo `Rendiere/cairn`, at `~/dev/personal/cairn`) that turns a knowledge
worker's recent work into notes in their own words. It has four skills: `setup` creates the vaults and
config, `sweep` finds gaps in recent material, `study` teaches a topic, and `interview` asks fixed
questions per note type and writes only the user's answers. Notes live in a portable git vault (true at any
employer) and an optional company vault, kept apart by a pre-commit hook that rejects the employer's names.

A Dieter Rams audit of commit `09e540c` scored the design 12/30, with thoroughness at 0, and called for a
redesign (`DESIGN-IS-2026-10-15/`). Two structural choices caused most failures. First, the rules are
restated in up to nine places across skills and vault files and have drifted apart: person notes are
written to `persons/` while setup creates `people/`, and templates lack fields the skills write. Second,
every skill writes its output only at its last step, so an interrupted session loses everything.

This plan rebuilds the skills, vault scaffolding and config around three principles, in priority order:
any skill can stop at any turn and lose nothing; every note type can be created, found and finished
through the same path; every rule, term and config key exists in exactly one place.

Each phase is self-contained and runs in a fresh session. Read Phase 0 before any phase. Codex support is
out of scope.

## Phase 0: Allowed mechanisms (documentation discovery, done 2026-10-16)

Sources: Claude Code docs at `code.claude.com/docs/en/` (`skills.md`, `plugins/manifest-reference.md`,
`plugins/marketplace-reference.md`, `plugins/loading.md`, `plugins/create.md`, `hooks.md`) and the Agent
Skills spec at `agentskills.io/specification`.

Allowed:

- SKILL.md frontmatter: use only `name` and `description`. They are the Agent Skills standard fields, and
  claude.ai uploads reject other keys. `name` matches the folder, lowercase and hyphens, at most 64
  characters. Keep `description` under 1,024 characters (Agent Skills limit).
- Referencing shipped files: write `${CLAUDE_PLUGIN_ROOT}/shared/rules.md`. Claude Code substitutes
  `${CLAUDE_PLUGIN_ROOT}` (the installed plugin's absolute path) anywhere in a SKILL.md body
  (`skills.md`, "Substitution variables in SKILL.md"). The variable is not set in Bash tool calls, so a
  command must use the substituted text, not `$CLAUDE_PLUGIN_ROOT`. Bare relative paths such as
  `../../vault/` are not documented to resolve and must go.
- The installed plugin is a copy under the Claude config dir's `plugins/cache/<marketplace>/<plugin>/<version>/`.
  With marketplace `source: "./"` the plugin root is the repo root, so `shared/`, `vault/` and `skills/`
  are all copied. Never write user data under the plugin folder; it is replaced on update.
- Invocation: plugin skills are `/cairn:<skill>`. Do not advertise bare `/sweep` in descriptions.
- A plugin cannot install git hooks; Claude Code plugin hooks fire on Claude Code events only. The guard
  stays a git `pre-commit` script that setup wires with `git config core.hooksPath .githooks`.
- A `CLAUDE.md` at the plugin root is not loaded and `claude plugin validate` warns about it. Shared rules
  go in `shared/rules.md`, which every skill tells the model to read.
- Validation: `claude plugin validate <repo root>` checks manifests and every SKILL.md frontmatter. Load a
  working copy with `claude --plugin-dir <repo root>` and `/reload-plugins` after edits.
- `plugin.json` `version` pins users until it changes. Bump it in the last phase.

Do not:

- Use Claude Code-only frontmatter (`allowed-tools`, `argument-hint`, `disable-model-invocation` and the
  rest); nothing in the skills needs it.
- Put shared instructions in a plugin-root `CLAUDE.md`.
- Use bare relative paths to files in the plugin.
- Add `..` paths to `plugin.json` or `marketplace.json`; manifest paths must start with `./` and stay
  inside the plugin root.

## Decisions this plan implements

Made in a design review on 2026-10-15 and recorded in `BACKLOG.md`:

- Rules live once in the plugin. A vault's `README.md` says what the vault holds; its `CLAUDE.md` and
  `AGENTS.md` say only that notes are written through cairn's skills.
- Config split. The vault's `cairn.toml`, in git, holds owner name, cadence and company. Guard terms live in
  the company vault. `~/.config/cairn/config.toml` (or `$CAIRN_CONFIG`) holds only what is true of one
  machine: vault paths and available sources.
- One active company vault. Archived ones stay in the local config with `archived = true`, and the guard
  reads terms from every listed company vault.
- Claude Code only. Codex support was decided on 2026-10-15 and parked on 2026-10-16; the skills keep to
  standard frontmatter so it stays possible. A source whose tool is missing is skipped with a note.
- "Defensible" requires these headings by type: concept (one sentence, why it exists, my position); system
  (one sentence, why we have it, built from); project (one sentence, what I am asked to do); synthesis (the
  question, how it works, what I would do); person (role and what they own). An interview raises at most
  two "Going deeper" items.
- The existing knowledge base (KB) is read-only. Study lists matching KB notes, sweep tags a gap "in your
  KB", and setup reads the KB once and queues its ten most basic topics.
- Cadence sizes, slots chosen at setup: daily 15 minutes, default first thing in the morning (top two gaps
  parked, plus one queue item closed or one 5-minute read-back); weekly 30 or 60 minutes (full sweep plus
  one study or interview); monthly 45 or 60 minutes (full sweep, three read-backs, a check across the
  month's notes).

## Phase 1: Shared sources of truth

What to implement:

1. Create `shared/rules.md`: the vault rules now spread across `vault/portable/README.md:13-52`,
   `vault/company/README.md:9-41` and `skills/interview/SKILL.md:20-46`. One section each for the vaults
   and routing test, links, the guard, note prose (user's words only, grammar fixes, `[claude]` lines),
   interview conduct, and the session-state rules below. Copy the wording from those lines, merge
   duplicates, and keep the stricter version where they differ. Vaults keep both `CLAUDE.md` and
   `AGENTS.md` so other agents opening a vault see the pointer.
2. Add a glossary to the top of `shared/rules.md`, defining before first use: vault, portable vault,
   company vault, home vault, routing test, guard terms, note, note type, study pack, lab, queue item,
   Going deeper, synthesis, defensible, draft, read-back, sweep, cadence, slot, knowledge base.
3. Create `shared/note-types.md` with one table, one row per type, columns: type, vault (portable or
   company; everything in portable with one vault), folder (`concepts/`, `systems/`, `projects/`,
   `synthesis/`, `people/`), template file, question set, required headings for defensible. Copy the
   question sets from `skills/interview/SKILL.md:58-64` and the required headings from the decisions above.
4. Add the session-state rules to `shared/rules.md`: every skill writes its output file at its first step
   and appends after every answer; every skill ends with one line saying what was written and what to run
   next; every error says what to run next; a push that fails is reported and left for the next run.
5. In each `skills/*/SKILL.md`, replace restated rules with "Read `${CLAUDE_PLUGIN_ROOT}/shared/rules.md`
   and `${CLAUDE_PLUGIN_ROOT}/shared/note-types.md` before anything else." Replace `../../vault/`,
   `../interview/SKILL.md` and `../sweep/scripts/` with `${CLAUDE_PLUGIN_ROOT}/...` paths. Remove the `/sweep`, `/interview` and `/study`
   trigger words from descriptions; name `/cairn:<skill>` instead.
6. Cut `vault/portable/README.md` and `vault/company/README.md` to what the vault holds: folders and the
   boundary, about 15 lines each. Set both vaults' `CLAUDE.md` and `AGENTS.md` to the single line "Notes
   here are written only through cairn's skills (/cairn:interview, /cairn:study, /cairn:sweep)."

Documentation references: Phase 0 "Referencing shipped files" and "A CLAUDE.md at the plugin root".

Verification:

- `grep -rn "still be true\|routing test" skills vault` finds only pointers to `shared/rules.md`, no rule text.
- `grep -rn "\.\./" skills` returns nothing.
- Loaded with `claude --plugin-dir .`, a skill's first step reads `shared/rules.md` from the plugin path.
- `grep -rn "^description:.*/\(sweep\|study\|interview\)\b" skills` returns nothing.
- `claude plugin validate .` passes.

Anti-pattern guards: do not leave a copy of a rule in a README "for humans"; do not put rules in a
plugin-root `CLAUDE.md`; do not use `$CLAUDE_PLUGIN_ROOT` inside a Bash command.

## Phase 2: Templates and folders from the note-type table

What to implement:

1. Rewrite each file in `vault/templates/` to match its row in `shared/note-types.md`: one heading per
   question, in order, and frontmatter `type`, `status: draft`, `depends: []`, `interviewed: []` on every
   note template. Add "Going deeper" to project and person, which lack it now.
2. List every placeholder each template uses in `shared/note-types.md` and what fills it: `{{title}}`,
   `{{date}}` (today, ISO), `{{links}}` (wikilinks to the topics the question touches). Remove any
   placeholder no skill fills.
3. Add a `.gitkeep` to every folder setup creates, so empty folders survive a clone.
4. Add `labs/` handling: either setup creates it with the `.gitignore` patterns in both vaults, or study
   creates it on first use. Pick study; it is the only writer.
5. Add a map template `vault/templates/map.md` for `maps/`, or remove `maps/`. Keep it: interview step 8
   writes to maps (`skills/interview/SKILL.md:106-107`).

Documentation references: `shared/note-types.md` from Phase 1; current templates in `vault/templates/`.

Verification:

- For each row in `shared/note-types.md`, `grep -c "^## " vault/templates/<type>.md` equals the number of
  questions.
- `grep -rn "{{" vault/templates` lists only placeholders named in `shared/note-types.md`.
- `grep -rn "persons" skills vault shared` returns nothing.

Anti-pattern guards: do not derive folder names by pluralising the type in skill text; always read the
folder column.

## Phase 3: Config split, guard and setup

What to implement:

1. Define the two config files in `shared/rules.md` and in `config.example.toml` (split into
   `config.example.toml` for the machine and `vault/cairn.example.toml` for the vault):
   - Vault `cairn.toml`: `owner`, `company` (company vault only), `[cadence.daily|weekly|monthly]` each
     with `enabled`, `minutes`, `slot`.
   - Machine config: `[vaults] portable`, `[[vaults.company]] path, archived`, `[sources.*]` as now.
   - Drop keys nothing reads: `vaults.company_name`, `sources.granola.enabled`. Either substitute `{start}`
     in sweep's queries or remove it; substitute it, with the window start date.
2. Guard hook `vault/portable/.githooks/pre-commit`: read every `terms=` line from the untracked
   `.company` file (one per listed company vault, archived included), skip `#` lines, and match with
   `grep -iF -f` (fixed strings, no regex). Every failure message ends with what to run next, for example
   "run /cairn:setup to repair". With an empty terms list, fail with that instruction.
3. Rewrite `skills/setup/SKILL.md`:
   - A vault is recognised by `cairn.toml` at its root, for both vault kinds.
   - Write the machine config after the first answer and update it after each step, so an interrupted
     setup resumes at the first incomplete step on the next run.
   - On a second machine, read owner, company and cadence from the cloned vault's `cairn.toml` and ask
     only for paths and sources.
   - Ask for each cadence's slot and length within the decided sizes; default daily to first thing in the
     morning.
   - Wire `core.hooksPath` only with a company vault; say in the closing line whether the guard is on.
   - KB onboarding: read the KB once, rank its topics with the basics first, and write the top ten as queue
     items tagged "in your KB".
   - Import the older layout (`.company` with `vault=`, old `cairn.toml`, single `config.toml`).
4. Fail loudly in `skills/sweep/scripts/sessions.sh` when `jq` is missing or a profile folder does not exist.

Documentation references: Phase 0 "A plugin cannot install git hooks"; current hook at
`vault/portable/.githooks/pre-commit`; current setup at `skills/setup/SKILL.md:18-98`.

Verification, in a throwaway `HOME` (`HOME=$(mktemp -d)`):

- A commit containing a term with a regex character (`C++`, `a.b`) is rejected; one without it passes.
- With two `terms=` lines, a term from either file is rejected.
- `sessions.sh 1 /nonexistent` exits non-zero with a message.

Anti-pattern guards: do not parse TOML in the hook; setup writes the flat `.company` file. Do not write
guard terms to the portable vault or the machine config.

## Phase 4: Interview

What to implement in `skills/interview/SKILL.md`:

1. Step 1 creates the transcript `interviews/YYYY-MM-DD-HHMM-<slug>.md` (time added, so two runs on one
   day do not collide) and appends each question and answer as it happens.
2. An interview stopped at any point leaves the transcript and a queue item "resume interview: <slug>"
   listing the unanswered headings. `/cairn:interview <slug>` on a note with open headings asks only those.
3. The note's folder, template and question set come from `shared/note-types.md`. Defensible is set from
   the required-headings column, not question numbers.
4. At most two "Going deeper" queue items per interview.
5. Read-back asks "does this sound like you?" and accepts edits or "not yet"; "not yet" keeps the note
   `draft` and ends the step. The proposed `depends:` links are confirmed in the same read-back.
6. Final line: the note's path, its status, and the next command.

Documentation references: `shared/rules.md` and `shared/note-types.md` from Phase 1; current steps at
`skills/interview/SKILL.md:66-139`.

Verification: run `/cairn:interview` on a person topic against a test vault; the note lands in `people/`,
reaches `defensible` with only "role and what they own" answered, and a second interview the same day
writes a second transcript.

Anti-pattern guards: do not reintroduce numbered-question rules; do not write any non-user sentence into a
note without `[claude]`.

## Phase 5: Sweep and study

What to implement:

1. `skills/sweep/SKILL.md` runs one of three flows from the vault's `cairn.toml` cadence, sized as in the
   decisions above. The user can pick the flow at start when more than one is enabled.
2. Input caps per flow: daily reads the last 24 hours, weekly 7 days, monthly 30 days, and never more than
   that even when sweeps were missed. Each source has a maximum item count per flow; stated in the skill.
3. The sweep record is `interviews/YYYY-MM-DD-HHMM-sweep.md`, created at step 1 and appended per step.
   The window start reads the newest file matching `*-sweep.md` whose name parses as a date.
4. Empty state: with no sources or no gaps, say so in one line and offer a read-back instead.
5. Say plainly that a sweep writes queue items and `depends:` links into existing notes; remove "no note
   is written here".
6. Gaps covered by the KB are tagged "in your KB".
7. `skills/study/SKILL.md`: a 20-minute limit, stated and checked with `date +%H:%M`; the study pack is
   created at step 1 and appended as the session runs; it lists matching KB notes as sources; it
   creates `labs/` on first use.

Documentation references: decisions above; current sweep at `skills/sweep/SKILL.md:20-91`; current study at
`skills/study/SKILL.md:29-62`.

Verification: in a test vault with no sources configured, `/cairn:sweep` ends with the empty-state line;
two sweeps on one day produce two records; a study stopped after one step leaves a pack with that step.

Anti-pattern guards: do not add new source types; do not let a daily sweep start a study or interview.

## Phase 6: Honest copy

What to implement:

1. Rewrite `README.md` for a stranger: what cairn does, install (noting GitHub access is needed while the
   repo is private), the four commands, the two-vault option and what the guard does and does not catch
   (fixed-string match on committed text; bypassed by `git commit --no-verify`).
2. Check every skill `description` and `plugin.json`/`marketplace.json` description against behaviour.
3. Run `ce-noslop` in edit mode on `README.md` and `shared/rules.md`.

Verification: each claim in `README.md` maps to a skill step or script line, and the README says Codex is
not supported.

## Phase 7: Migration and verification

What to implement:

1. Setup's import path migrates an existing vault: moves any `persons/` notes to `people/`, replaces old
   READMEs and `CLAUDE.md`/`AGENTS.md`, writes `cairn.toml` from the old config, and rewrites `.company`.
   Run it on the owner's real vaults only after a dry run that lists every change.
2. `scripts/smoke.sh`: in a throwaway `HOME`, run setup headless (`claude -p` with `--plugin-dir .`) for a
   one-vault and a two-vault layout and assert: config written, `cairn.toml` present, hook rejects a
   guard term, templates and `.gitkeep` present, no `persons/`.
3. Bump `version` in `.claude-plugin/plugin.json`.
4. Update `BACKLOG.md`: mark items done, keep open questions.

Verification:

- `claude plugin validate .` passes.
- `scripts/smoke.sh` passes for both layouts.
- `grep -rn "\.\./\|persons/\|no note is written" skills shared vault README.md` returns nothing.
- A re-run of the design-is audit scores principle 8 at 2 or more and no principle at 0.

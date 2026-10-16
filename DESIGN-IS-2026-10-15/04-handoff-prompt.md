# Handoff

````
/make-plan Redesign the cairn Claude Code plugin (repo Rendiere/cairn, commit 09e540c): its four skills (setup, study, interview, sweep), the vault scaffolding in vault/, and config.example.toml. Current design failed a Dieter Rams audit at 12/30 with critical gaps in principles #8 thorough (0), #2 useful (1), #4 understandable (1) and #6 honest (1).

Cairn turns a knowledge worker's recent work (meetings, email, chat, agent sessions) into notes in their own words: the sweep finds gaps ranked by how many topics build on them, study teaches a topic, the interview asks fixed questions per note type and writes only the user's answers. Notes live in a portable git vault (true at any employer) and an optional company vault, kept apart by a pre-commit hook that rejects the employer's names.

Verdict paragraph:
> Cairn scores 12/30 with a 0 on thoroughness, so the rule gives REDESIGN: the study, interview and sweep loop is worth keeping, but the skills, vault files and config around it need rebuilding from the primary task, with every rule stated once, every state handled and every claim matching behaviour.

Why redesign and not refine: the total is below 20 and thoroughness scored 0, and the failures come from two structural choices: rules copied as prose across eleven files, which drift apart, and skills that write their outputs only at their last step, so any interruption loses the session.

Preserve from current design:
- The study → interview → sweep loop and its order (README.md:11-14).
- The interview's contract: one question per turn, the user's answers are the only note prose, grammar fixes only, teaching after the questions (skills/interview/SKILL.md:42-46, 75-78, 91-92).
- The "Done when" ending on every procedure step (all four SKILL.md files).
- Portable and company vaults with one-way links and the guard hook (vault/portable/README.md:13-17, vault/portable/.githooks/pre-commit).
- Plain Markdown notes in git, readable in Obsidian (README.md:18).

Discard:
- Rules restated in vault READMEs and every skill: the routing test in 6 files, the guard rule in 9 locations, AGENTS.md duplicating CLAUDE.md (vault/portable/README.md:13-31, skills/interview/SKILL.md:24-46). Caused failure on #10 and, through drift, #2 and #3.
- The "defensible = questions 1, 2 and 5" rule tied to question numbers (skills/interview/SKILL.md:96-97); a person note has 3 questions and can never pass. Caused failure on #2.
- Writing the transcript, sweep record, study pack and config only at the final step (skills/interview/SKILL.md:86, skills/sweep/SKILL.md:81, skills/study/SKILL.md:50, skills/setup/SKILL.md:84). Caused failure on #8.
- Sweep reading every source item in an open-ended window (skills/sweep/SKILL.md:20-37). Caused failure on #9.

Top moves from the audit:
1. #8 thorough: give every skill an interrupted, empty, error and success state; write the interview transcript and the sweep record as the session runs, not at the end. Evidence: skills/interview/SKILL.md:86, skills/sweep/SKILL.md:81, skills/study/SKILL.md:50; no skill handles push failure; interview and sweep end with no success message; read-back "Done when they say yes" has no exit (skills/interview/SKILL.md:109-110).
2. #10 as little design, #4 understandable: hold the rules and a glossary once, in the plugin (rules.md), and have skills and vault CLAUDE.md/AGENTS.md point to it; drop config keys nothing reads (cadence.slot, vaults.company_name, sources.granola.enabled) and fill or remove unfilled placeholders ({start} in config.example.toml:20,23; {{date}}, {{links}} in vault/templates/queue.md:5,10). Define "defensible", "read-back", "portable", "queue item", "synthesis", "study pack" before first use.
3. #2 useful, #3 aesthetic: one note-type table drives folder name, template, question set and required headings. Fixes person notes written to persons/ while setup makes people/ (skills/interview/SKILL.md:90 vs skills/setup/SKILL.md:39,46), project and person templates missing depends: and Going deeper (vault/templates/project.md, person.md), and setup's vault test failing on company vaults (skills/setup/SKILL.md:31-32, 44-45).
4. #6 honest: make every claim match behaviour. Sweep says "no note is written" but writes depends: into notes (skills/sweep/SKILL.md:8 vs 75-76); README says setup "switches on" the guard and it "rejects the employer's terms" (README.md:11,22), but the guard is two-vault only and an unescaped substring regex bypassed by --no-verify; skill descriptions advertise /sweep, /interview, /study instead of /cairn:*; stated session lengths are not enforced.
5. #9 environmentally friendly: size the sweep's input to the session length for each cadence, with a cap per source and a maximum window.

Decisions already made that the redesign must implement (from a design review on 2026-10-15):
- Rules live once in the plugin; a vault's README says what it holds and its CLAUDE.md/AGENTS.md say only "write notes through cairn's skills".
- Config split: owner name, cadence and company live in the vault's cairn.toml in git; guard terms live in the company vault; ~/.config/cairn/config.toml holds only vault paths and available sources for that machine.
- One active company vault; archived ones stay in the local config with archived = true, and the guard hook reads terms from every listed company vault.
- Claude Code and Codex both supported from the same skill files; a source whose tool is missing is skipped with a note.
- Required headings for "defensible", by type: concept (one sentence, why it exists, my position); system (one sentence, why we have it, built from); project (one sentence, what I am asked to do); synthesis (the question, how it works, what I would do); person (role and what they own). At most two "Going deeper" items per interview.
- Existing knowledge base: read-only; study lists matching KB notes; sweep tags gaps "in your KB"; setup reads it once and queues the top ten basics.
- Cadence sizes, slot chosen by the user at setup: daily 15 min (default first thing in the morning: top 2 gaps parked plus one queue item closed or one 5-minute read-back); weekly 30 or 60 min (full sweep plus one study or interview); monthly 45 or 60 min (full sweep, three read-backs, a check across the month's notes).

Redesign principles in priority order:
1. #8 thorough: every skill can be stopped at any turn and lose nothing; every run ends with a one-line result; empty and error states say what to do next.
2. #2 useful: every note type can be created, found and reach "defensible" through the same path.
3. #10 as little design as possible: each rule, term and config key exists in exactly one place, and nothing is written that nothing reads.

Deliverables for the plan:
- New information architecture: plugin files (rules.md, note-type table, skills, scripts) and vault files, each with its single responsibility.
- New primary flow for each cadence (daily, weekly, monthly), low-fi and labeled, side by side with the current 30-minute sweep.
- States checklist per skill: empty, interrupted, error, success, re-run, offline.
- Migration path for an existing vault created by the current setup (folder rename people/persons, README cut-down, config split).
- Cutover criteria: a fresh-machine smoke test (throwaway HOME, temp vault) passes for one-vault and two-vault setups.

Anti-patterns to guard against:
- Porting the old structure under new wording, such as moving rules into rules.md while leaving copies in the READMEs.
- Keeping both layouts working indefinitely instead of migrating.
- Adding features (new sources, hosted surfaces) during the redesign.
- Treating the Preserve list as optional.
````

---
name: setup
description: First-run setup, repair and upgrade for cairn on this machine. Creates or connects the portable vault and, for someone with an employer, a company vault with the guard hook that keeps the employer's names out of the portable vault. Writes the machine config as it goes, so an interrupted run resumes where it stopped. On a second machine it reads owner, cadence and company from the cloned vaults and asks only for paths and sources. Sets the daily, weekly and monthly review slots, probes the sources the sweep can read, and turns an existing knowledge base into ten starter queue items. Migrates a vault from the older cairn layout after showing every change and getting a yes. Use when the user types /cairn:setup, says "set up cairn", "install cairn", "connect my brain", "upgrade my cairn vault", "cairn isn't working on this machine", or when another cairn skill finds no config.
---

# Setup

Read `${CLAUDE_PLUGIN_ROOT}/shared/rules.md` and `${CLAUDE_PLUGIN_ROOT}/shared/note-types.md` before
anything else.

Fifteen minutes, once per machine; check the time with `date +%H:%M` at the start and after each step
(Session state rule 5). The output is the machine file and the vault files named in rules.md "Config",
plus vaults the other skills can write to. The machine file is written after the first answer and
updated after every step, so it is this skill's output file (Session state rule 1) and the resume point:
the next run starts at the first step whose "Done when" does not hold.

Ask one question per turn. Never write into a folder the user did not name or agree to. The plugin's
scaffolding is in `${CLAUDE_PLUGIN_ROOT}/vault/`, every machine key is shown in
`${CLAUDE_PLUGIN_ROOT}/config.example.toml`, and every vault key in
`${CLAUDE_PLUGIN_ROOT}/vault/cairn.example.toml`.

What each new vault gets, read from note-types.md, never from a type's name:

- Templates: every note type whose Vault column can name this vault, plus `queue.md`, plus `map.md` in
  the company vault. With one vault the portable vault gets all five note templates and `queue.md`.
- Folders: the Folder column of those note types, plus `queue/` and `study/`; `interviews/` in the home
  vault; `maps/` in the company vault. Each gets an empty `.gitkeep` (Session state rule 6).

## Steps

1. **Check.** Read the machine file if it exists, then each listed vault's `cairn.toml`. For each step
   below, test its "Done when" against disk and report pass or fail in one line; continue at the first
   step that fails, and after it run only the steps that also fail. With no machine file, look for the
   older layout: a machine file holding `owner`, `company_name` or `[cadence] every`; a `.company` with
   `vault=` or `guard_terms=` lines; or a vault the user names that has `templates/concept.md` but no
   `cairn.toml`. Any of these sends the run to step 2. Check that `git` and `jq` are installed (the
   Claude Code source needs `jq`) and note `gh` if present. Done when the starting state is stated in
   one line per item.
2. **Import.** Older layout only. Read the old machine file, the old `.company`, and the old
   `cairn.toml` in the company vault (it may hold `owner`, the company name or cadence); where they
   disagree the machine file wins. Build the full list of changes, per vault, and show it before
   touching anything:
   - write the machine file in the new shape: `[vaults] portable`, one `[[vaults.company]]` with
     `archived = false` from the old `company`, `[sources.*]` kept, `[sources.granola] enabled` reduced
     to a bare `[sources.granola]`, the old file kept as `config.toml.bak` beside it;
   - write the portable vault's `cairn.toml` with `owner`, and the old `[cadence] every` and `slot` as
     that cadence with `enabled = true` and its smallest length; the other two cadences
     `enabled = false` until step 9 asks;
   - replace the company vault's `cairn.toml` with `company = "<company_name>"`;
   - `git mv` every file in `persons/` to `people/` (links resolve by filename, so none change), then
     remove `persons/`;
   - replace `README.md`, `CLAUDE.md` and `AGENTS.md` from the scaffolding, filling `{{owner}}` and
     `{{company}}`, and replace `.githooks/pre-commit` in the portable vault;
   - copy each template the vault should have and lacks, leaving existing ones untouched;
   - add a `.gitkeep` to each folder the vault should have, creating missing folders;
   - move the old `guard_terms=` file to `.portable-guard-terms` in the company vault when it lives
     elsewhere, and rewrite `.company` as `terms=` lines.
   Name each file in the list. Ask "Apply these changes?" and wait for a yes; anything else changes
   nothing and ends the run with the closing line. On a yes apply them in the order listed, writing the
   machine file first, then go to step 3 with the imported answers in place. Done when the list was
   shown and either applied or declined.
3. **Portable vault.** Ask whether they already have a cairn vault (a URL or a local path) or want a new
   one, and where it lives (default `~/brain`). As soon as the path is known, write the machine file
   with `[vaults] portable`. A folder with `cairn.toml` is a vault: clone or reuse it and read `owner`
   and the cadence from it; this is a second machine, so steps that only set those are skipped. A folder
   with `templates/concept.md` and no `cairn.toml` is the older layout: go to step 2. Any other notes
   folder is a knowledge base: never adopt it, offer to record it in step 6, and create a new vault.
   For a new vault: ask the name the notes should use for the owner ("Only Ada's sentences are prose");
   create the folder, copy `${CLAUDE_PLUGIN_ROOT}/vault/portable/` into it with hidden files, copy its
   templates from `${CLAUDE_PLUGIN_ROOT}/vault/templates/` into `templates/`, create its folders, fill
   `{{owner}}` in `README.md`, write `cairn.toml` with `owner`, and run `git init`. If `gh` is installed
   and logged in, offer `gh repo create <name> --private --source . --push`; otherwise say the vault has
   no remote yet. Ask which git email this vault commits as and set it with `git config user.email`
   inside the vault. Done when the portable vault is a git repo at a path in the machine file, with
   `cairn.toml` naming the owner and its email set.
4. **Company vault.** Ask: "Do you work for an employer whose systems, projects or people you'd write
   about?" No means one vault: add `systems/`, `projects/`, `people/` and `interviews/` with the matching
   templates to the portable vault if missing, and skip to step 6. Yes means the same existing-or-new
   choice as step 3. An existing folder with `cairn.toml` is reused and `company` read from it. For a
   new one, ask the employer's name, copy `${CLAUDE_PLUGIN_ROOT}/vault/company/` and its templates,
   create its folders, fill `{{owner}}` and `{{company}}` in `README.md`, write `cairn.toml` with
   `company`, and run `git init`. When the machine file already lists an active company vault for a
   different employer, ask whether that one is now archived; if yes set its `archived = true`. Add this
   vault to the machine file as `[[vaults.company]]` with `archived = false`. Symlink `general` in the
   company vault to the portable vault's path and make sure `general` is in its `.gitignore`. Ask the
   company vault's git email and set it inside that vault. Done when the active company vault is in the
   machine file, has `cairn.toml` with `company`, its `general/` resolves to the portable vault, and its
   email is set.
5. **Guard.** Company vault only. If its `.portable-guard-terms` lists no term, ask for the terms that
   must never appear in the portable vault: the employer's name, its internal product and system names,
   codenames. Write one per line; at least the employer's name. Write `.company` in the portable vault
   from the machine file, one `terms=<absolute company vault path>/.portable-guard-terms` line per listed
   company vault, archived included. In the portable vault run `git config core.hooksPath .githooks`.
   Prove the hook fires: if nothing is staged in the portable vault, write a scratch file containing the
   first guard term, stage it, run `.githooks/pre-commit`, expect it to fail, then unstage and delete the
   file; if something is already staged, skip the proof and say why. Done when the hook rejected the
   scratch file, or the skip is stated.
6. **Knowledge base.** Ask whether they have notes elsewhere for cairn to learn from: another Obsidian
   vault, a Notion or Evernote export, a folder of Markdown. Record each path under `[sources.kb] paths`
   in the machine file. Tell them cairn only reads it and its text never becomes note prose. Done when
   the paths are recorded or they have none.
7. **KB onboarding.** Skip when no KB is recorded, or when queue items tagged `in-your-kb` already exist.
   Read the KB once and list its topics. Rank them basics first: a topic that others depend on and that
   depends on nothing outside the list comes before the topics built on it. For each of the top ten,
   write a queue item from `templates/queue.md` in the vault the routing test picks, its question asking
   the owner to explain the topic in their own words, `tags: [in-your-kb]`, and the KB file's path
   under `## The question`. Write each item as soon as it is ranked. Show the ten titles in one
   list. Done when ten items exist, or as many as the KB has topics.
8. **Sources.** For each source in rules.md "Config", probe it now and record in the machine file only
   those that answer, updating the file after each. Report one line per source: found, with a count from
   the last 30 days, or skipped, with the reason. Replace `{start}` in a query with the date 30 days ago.
   - `claude_code`: list folders among `~/.claude`, `$CLAUDE_CONFIG_DIR` and `~/.config/claude*` that
     contain `projects/*.jsonl`; run `bash ${CLAUDE_PLUGIN_ROOT}/skills/sweep/scripts/sessions.sh 30 <folder>`
     on each and count the `===` lines. Record the ones they confirm under `profiles`.
   - `zoom_email`: when a Gmail tool is available, run the query from the example config. Record it if
     any come back.
   - `meet_notes`: when the `gws` CLI or a Google Drive tool is available, run the query from the example
     config.
   - `slack`: when a Slack tool is available, find the user's own user ID and search their messages.
   - `granola`: when Granola tools are available, list meetings from the last 30 days.
   - `folders`: ask whether they keep transcripts or chat exports as text files (Whisper output, exported
     WhatsApp chats). Record the folders.
   Done when every source has a line.
9. **Cadence.** Skip when the portable vault's `cairn.toml` already sets all three cadences. Ask one
   cadence per turn and write the answer to `cairn.toml` before the next question. Daily: 15 minutes or
   more, default first thing in the morning ("weekdays 08:30, or another time, or off?"). Weekly: 30 or
   60 minutes, and when ("Fri 10:00"). Monthly: 45 or 60 minutes, and when ("first Mon 10:00"). Refuse a
   length outside those sizes and ask again. When a calendar tool is available, offer one recurring event
   per enabled cadence, named "Cairn sweep (daily)" and so on, whose description says to run
   `/cairn:sweep`. Done when each cadence has `enabled`, `minutes` and `slot`, and each event exists or
   was declined.
10. **Commit.** In each vault changed in this run, commit and push as rules.md "Commit and push" says,
    with the message `setup: <date>`. Done when each changed vault has a commit and each push either
    succeeded or is reported.
11. **Verify.** Check, and show as a table of pass or fail:
    - the machine file parses and lists the portable vault;
    - each vault path exists, is a git repo, has `cairn.toml`, has `user.email` set, and has a remote or
      the user was told it has none;
    - the portable vault's `cairn.toml` names the owner and sets all three cadences;
    - each vault has its templates and folders, each folder has `.gitkeep`, and no `persons/` exists;
    - with a company vault: `general/` resolves to the portable vault, `.company` has one `terms=` line
      per listed company vault, each terms file lists at least one term, and `core.hooksPath` is
      `.githooks` in the portable vault;
    - each recorded source answered in step 8.
    Done when every row passes, or each failure is shown with what to run next.

End with one line: what was written and where, whether the guard is on ("guard on: N terms" or "guard
off: one vault"), any failed push, and the next command: `/cairn:sweep` at the next slot, or
`/cairn:study <topic>` now.

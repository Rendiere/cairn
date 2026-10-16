---
name: setup
description: First-run setup, repair and upgrade for cairn on this machine. Creates or connects the owner's vault, records their current employer, and on a change of employer lists the old employer's notes and asks whether to keep or delete them. Writes the machine config as it goes, so an interrupted run resumes where it stopped. On a second machine it reads owner, employer and cadence from the cloned vault and asks only for its path and the sources. Sets the daily, weekly and monthly review slots, probes the sources the sweep can read, and turns an existing knowledge base into ten starter queue items. Migrates an older cairn layout, including a separate company vault, after showing every change and getting a yes. Use when the user types /cairn:setup, says "set up cairn", "install cairn", "connect my brain", "upgrade my cairn vault", "I changed jobs", "cairn isn't working on this machine", or when another cairn skill finds no config.
---

# Setup

Read `${CLAUDE_PLUGIN_ROOT}/shared/rules.md` and `${CLAUDE_PLUGIN_ROOT}/shared/note-types.md` before
anything else.

Fifteen minutes, once per machine; check the time with `date +%H:%M` at the start and after each step
(Session state rule 5). The output is the machine file and the vault files named in rules.md "Config",
plus a vault the other skills can write to. The machine file is written after the first answer and
updated after every step, so it is this skill's output file (Session state rule 1) and the resume point:
the next run starts at the first step whose "Done when" does not hold.

Ask one question per turn. Never write into a folder the user did not name or agree to. The plugin's
scaffolding is in `${CLAUDE_PLUGIN_ROOT}/vault/`, every machine key is shown in
`${CLAUDE_PLUGIN_ROOT}/config.example.toml`, and every vault key in
`${CLAUDE_PLUGIN_ROOT}/vault/cairn.example.toml`.

The vault gets every template in `${CLAUDE_PLUGIN_ROOT}/vault/templates/`, and the Folder column of every
note type in note-types.md plus `queue/`, `study/`, `interviews/` and `maps/`, each with an empty
`.gitkeep` (Session state rule 6).

## Steps

1. **Check.** Read the machine file if it exists, then the vault's `cairn.toml`. For each step below,
   test its "Done when" against disk and report pass or fail in one line; continue at the first step that
   fails, and after it run only the steps that also fail. Look for an older layout: a machine file with
   `[vaults]` or `[[vaults.company]]`, or holding `owner`, `company_name` or `[cadence] every`; a `.company`
   file in a vault; a `.githooks/pre-commit` from cairn; or a folder the user names that has
   `templates/concept.md` but no `cairn.toml`. Any of these sends the run to step 2. Check that `git` and
   `jq` are installed (the Claude Code source needs `jq`) and note `gh` if present. Done when the starting
   state is stated in one line per item.
2. **Import.** Older layout only. Read the old machine file, any `.company`, and the `cairn.toml` of each
   old vault; where they disagree the machine file wins. The old portable vault (`[vaults] portable`, or
   the vault the old `.company` sat in) becomes the vault. Ask once about each old company vault: "Copy
   its notes into your vault tagged `company: <name>`, or leave that vault as it is, outside cairn?"
   Then build the full list of changes and show it before touching anything:
   - write the machine file in the new shape: `vault`, `[sources.*]` kept, `[sources.granola] enabled`
     reduced to a bare `[sources.granola]`, the old file kept as `config.toml.bak` beside it;
   - write the vault's `cairn.toml` with `owner`, `company` from the active company vault (omitted when
     there was none), and the cadence: kept when it is already in the new shape, else the old
     `[cadence] every` and `slot` as that cadence with `enabled = true` and its smallest length, the
     other two `enabled = false` until step 8 asks;
   - in the vault: `git config --unset core.hooksPath`, `git rm -r .githooks`, delete `.company`;
   - `git mv` every file in `persons/` to `people/` (links resolve by filename, so none change), then
     remove `persons/`;
   - for each company vault being copied: copy its note folders, `queue/`, `interviews/`, `study/` and
     `maps/` into the same folders in the vault (its `persons/` into `people/`), and set `company: <name>`
     in the frontmatter of every copied Markdown file, adding frontmatter where there is none; a file
     whose name already exists in the vault is not copied and is named in the list; the company vault
     itself is not changed;
   - replace `README.md`, `CLAUDE.md`, `AGENTS.md` and `.gitignore` from `vault/scaffold/`, filling
     `{{owner}}`, and replace every template from `vault/templates/`;
   - add a `.gitkeep` to each folder the vault should have, creating missing folders.
   Name each file, or each folder with its file count for copies. Ask "Apply these changes?" and wait for
   a yes; anything else changes nothing and ends the run with the closing line. On a yes apply them in
   the order listed, writing the machine file first, then go to step 3 with the imported answers in
   place. Done when the list was shown and either applied or declined.
3. **Vault.** Ask whether they already have a cairn vault (a URL or a local path) or want a new one, and
   where it lives (default `~/brain`). As soon as the path is known, write `vault` in the machine file. A
   folder with `cairn.toml` is the vault: clone or reuse it and read `owner`, `company` and the cadence
   from it; this is a second machine, so steps that only set those are skipped. A folder with
   `templates/concept.md` and no `cairn.toml` is the older layout: go to step 2. Any other notes folder is
   a knowledge base: never adopt it, offer to record it in step 5, and create a new vault. For a new
   vault: ask the name the notes should use for the owner ("Only Ada's sentences are prose"); create the
   folder, copy `${CLAUDE_PLUGIN_ROOT}/vault/scaffold/` into it with hidden files, copy the templates into
   `templates/`, create the folders, fill `{{owner}}` in `README.md`, write `cairn.toml` with `owner`, and
   run `git init`. If `gh` is installed and logged in, offer `gh repo create <name> --private --source .
   --push`; otherwise say the vault has no remote yet. Ask which git email the vault commits as and set
   it with `git config user.email` inside the vault. Done when the vault is a git repo at the path in the
   machine file, with `cairn.toml` naming the owner and its email set.
4. **Employer.** Skip on a second machine. Ask: "Do you work for an employer whose systems, projects or
   people you'd write about? If so, which?" Write the answer as `company` in `cairn.toml`, or remove
   `company` for none. When `cairn.toml` already names a different employer, the owner has changed jobs:
   list the files whose frontmatter has `company: <old>`, as a count per folder, and ask "Keep these, or
   delete them?" Delete means `git rm` on every listed file; keep changes nothing. Notes without the tag
   are never touched. Done when `cairn.toml` names the current employer or has none, and any old
   employer's files were kept or deleted as the owner said.
5. **Knowledge base.** Ask whether they have notes elsewhere for cairn to learn from: another Obsidian
   vault, a Notion or Evernote export, a folder of Markdown. Record each path under `[sources.kb] paths`
   in the machine file. Tell them cairn only reads it and its text never becomes note prose. Done when
   the paths are recorded or they have none.
6. **KB onboarding.** Skip when no KB is recorded, or when queue items tagged `in-your-kb` already exist.
   Read the KB once and list its topics. Rank them basics first: a topic that others depend on and that
   depends on nothing outside the list comes before the topics built on it. For each of the top ten,
   write a queue item from `templates/queue.md`, its question asking the owner to explain the topic in
   their own words, `tags: [in-your-kb]`, and the KB file's path under `## The question`. Write each item
   as soon as it is ranked. Show the ten titles in one list. Done when ten items exist, or as many as the
   KB has topics.
7. **Sources.** For each source in rules.md "Config", probe it now and record in the machine file only
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
8. **Cadence.** Skip when `cairn.toml` already sets all three cadences. Ask one cadence per turn and
   write the answer to `cairn.toml` before the next question. Daily: 15 minutes or more, default first
   thing in the morning ("weekdays 08:30, or another time, or off?"). Weekly: 30 or 60 minutes, and when
   ("Fri 10:00"). Monthly: 45 or 60 minutes, and when ("first Mon 10:00"). Refuse a length outside those
   sizes and ask again. When a calendar tool is available, offer one recurring event per enabled cadence,
   named "Cairn sweep (daily)" and so on, whose description says to run `/cairn:sweep`. Done when each
   cadence has `enabled`, `minutes` and `slot`, and each event exists or was declined.
9. **Commit.** When the vault changed in this run, commit and push as rules.md "Commit and push" says,
   with the message `setup: <date>`. Done when the vault has a commit and the push either succeeded or is
   reported.
10. **Verify.** Check, and show as a table of pass or fail:
    - the machine file parses and names the vault;
    - the vault path exists, is a git repo, has `cairn.toml`, has `user.email` set, and has a remote or
      the user was told it has none;
    - `cairn.toml` names the owner and sets all three cadences;
    - the vault has every template and folder, each folder has `.gitkeep`, and no `persons/`, `.company`
      or `.githooks/` exists;
    - each recorded source answered in step 7.
    Done when every row passes, or each failure is shown with what to run next.

End with one line: what was written and where, the employer notes are tagged for ("employer: Acme" or
"no employer"), any failed push, and the next command: `/cairn:sweep` at the next slot, or
`/cairn:study <topic>` now.

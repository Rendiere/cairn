---
name: setup
description: First-run setup and repair for cairn on this machine. Creates or connects the user's brain vaults (one portable vault, plus a company vault when they have an employer), switches on the employer-term guard hook, finds the information sources the sweep can read, records an existing knowledge base as a read-only source, and sets the review cadence, all in a per-machine config. Use when the user types /cairn:setup, says "set up cairn", "install cairn", "connect my brain", "cairn isn't working on this machine", or when another cairn skill finds no config.
---

# Setup

Fifteen minutes, once per machine. The output is `~/.config/cairn/config.toml` (or the path in
`$CAIRN_CONFIG`) and vaults that the other skills can write to. Running it again checks every piece and
repairs only what fails.

Ask one question per turn. Never write into a folder the user did not name or agree to. The plugin's
own files referred to below are relative to this file: `../../vault/` holds the vault scaffolding and
`../../config.example.toml` shows every config key.

## Steps

1. **Check.** Read the config if it exists. If it does, run step 10's checks, report each as pass or
   fail, and continue only with the steps whose checks failed. If it does not, look for an older layout
   to import: a `.company` file in a vault the user names, which points at a company vault holding
   `cairn.toml`. Import its vault paths and sources and say so. Check that `git` is installed, and `jq`
   (the Claude Code source needs it); note `gh` if present. Done when the starting state is stated in
   one line per item.
2. **Owner.** Ask the name the notes should use for the user ("Only Ada's sentences are prose"). Done
   when the name is recorded.
3. **Layout.** Ask: "Do you work for an employer whose systems, projects or people you'd write about?"
   Yes means two vaults: a portable vault for what stays true after they leave, and a company vault for
   the employer's own knowledge, which nests the portable one. No means one vault that holds every note
   type. For two vaults, ask the employer's name. Done when the layout is chosen.
4. **Portable vault.** Ask whether they already have a cairn brain repo (a URL or a local path) or want
   a new one. A repo counts as a cairn vault when it has `templates/concept.md` and a README with the
   rules. Any other notes repo is an existing knowledge base: never adopt it as a vault; offer to record
   it in step 6 and create a new vault.
   - Existing URL: clone it to a path they choose (default `~/brain`).
   - New: create the folder, copy `../../vault/portable/` into it (hidden files included), copy
     `../../vault/templates/concept.md`, `queue.md` and `synthesis.md` into `templates/`, and with one
     vault also `system.md`, `project.md` and `person.md`. Replace `{{owner}}` in `README.md`. Create
     `concepts/`, `queue/`, `study/`, `synthesis/`, and with one vault `systems/`, `projects/`,
     `people/`, `interviews/`. Run `git init`. If `gh` is installed and logged in, offer
     `gh repo create <name> --private --source . --push`; otherwise tell them the vault has no remote
     yet.
   Ask which git email this vault commits as, and set it with `git config user.email` inside the vault.
   Done when the vault is a git repo at a known path with its identity set.
5. **Company vault.** Two vaults only. Same choice as step 4, scaffolding from `../../vault/company/`
   and `system.md`, `project.md`, `person.md`, `queue.md`, `synthesis.md`, replacing `{{owner}}` and
   `{{company}}`, creating `systems/`, `projects/`, `people/`, `maps/`, `interviews/`, `queue/`,
   `synthesis/`, `study/`. Then wire the two vaults:
   - Symlink `general` in the company vault to the portable vault's path, and make sure `general` is in
     the company vault's `.gitignore`.
   - Ask for the terms that must never appear in the portable vault: the employer's name, its internal
     product and system names, codenames. Write one per line to `.portable-guard-terms` in the company
     vault. At least the employer's name.
   - Write `.company` in the portable vault with `vault=<company path>` and
     `guard_terms=<company path>/.portable-guard-terms`.
   - In the portable vault, run `git config core.hooksPath .githooks`.
   - Prove the hook fires. If the portable vault has nothing staged, write a scratch file containing the
     first guard term, stage it, run `.githooks/pre-commit`, and expect it to fail; then unstage and
     delete the file. If something is already staged, skip the proof and say why.
   Ask the company vault's git email and set it inside that vault. Done when the hook rejected the
   scratch file, or the skip is stated.
6. **Existing knowledge base.** Ask whether they have notes elsewhere they want cairn to learn from:
   another Obsidian vault, a Notion or Evernote export, a folder of markdown. Record each path under
   `[sources.kb] paths`. Tell them cairn only reads it, and that its text never becomes note prose:
   a topic from it enters the brain when they explain it again in an interview. Done when the paths are
   recorded or they have none.
7. **Sources.** For each source the sweep knows, probe it now and record only those that answer. Report
   one line per source: found, with a count from the last 30 days, or skipped, with the reason.
   - `claude_code`: list folders among `~/.claude`, `$CLAUDE_CONFIG_DIR` and `~/.config/claude*` that
     contain `projects/*.jsonl`; run `../sweep/scripts/sessions.sh 30 <folder>` on each and count the
     sessions. Record the ones they confirm under `profiles`.
   - `zoom_email`: when a Gmail tool is available, search for Zoom meeting summaries in the last 30
     days. Record the query from `../../config.example.toml` if any come back.
   - `meet_notes`: when the `gws` CLI or a Google Drive tool is available, list Gemini meeting notes from
     the last 30 days.
   - `slack`: when a Slack tool is available, find the user's own user ID and search their messages.
   - `granola`: when Granola tools are available, list meetings from the last 30 days.
   - `folders`: ask whether they keep transcripts or chat exports as text files (Whisper output,
     exported WhatsApp chats). Record the folders.
   Done when every source has a line.
8. **Cadence.** Ask how often they want to review: daily, weekly or monthly, and when (for example
   "Fri 10:00" or "weekdays 17:30"). When a calendar tool is available, offer to create a recurring
   event named "Brain sweep" whose description says to run `/cairn:sweep`. Done when the cadence is
   recorded and the event exists or was declined.
9. **Write.** Write the config with `owner`, `[vaults]` (`portable`, and `company` with
   `company_name` for two vaults), `[cadence]` and `[sources.*]`, using `~` for paths in the home
   directory. In each vault created in this run, `git add -A && git commit -m "setup: cairn vault"`, and
   push when it has a remote. Done when the config exists and each new vault has its first commit.
10. **Verify.** Check, and show as a table of pass or fail:
    - the config parses and names the owner;
    - each vault path exists, is a git repo, and has `user.email` set;
    - each vault has a remote, or the user was told it has none;
    - two vaults only: `general/` in the company vault resolves to the portable vault, `.company`
      exists, `core.hooksPath` is `.githooks` in the portable vault, and the guard terms file has at
      least one term;
    - each recorded source answered in step 7.
    Done when every row passes, or each failure is shown with what to run next.

End with one line: run `/cairn:sweep` at the next review slot, or `/cairn:study <topic>` now.

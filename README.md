# cairn

Agents produce output faster than you can understand it, so you end up owning systems and processes you
could not explain to a colleague without asking the agent again. cairn is a Claude Code plugin that helps
you understand your work well enough to explain it without notes. You study a topic, Claude interviews
you on it, and only your own answers go into the note. At a review slot you pick, you run a sweep that reads
your recent work and finds the topics you used but have no note on, basics first.

## Commands

| Command | What it does |
|---|---|
| `/cairn:setup` | Creates or connects your vault, records your employer, sets your review slots, finds the sources the sweep can read, and turns an existing knowledge base into ten starter questions. Saves after each step, so you can stop and run it again. Also repairs a broken setup and upgrades a vault from an older cairn layout, after showing every change. |
| `/cairn:study <topic>` | Teaches one topic in at most 20 minutes: three to five ranked sources and short hands-on steps you run yourself. Leaves a study pack of reading material in the vault. |
| `/cairn:interview <topic>` | Asks a fixed set of questions for the note's type (concept, system, project, synthesis, person), one at a time, and writes your answers with grammar fixes only. Afterwards reviews the answers against sources. `close <queue-item>` answers one open question. |
| `/cairn:sweep` | Your daily, weekly or monthly review. Reads the last 1, 7 or 30 days of Claude Code sessions, meeting notes, Slack and transcript folders, ranks uncovered topics by how many others build on them, and turns the top few into open questions, study sessions or interviews. Writes those questions, links between notes, and a dated record. |
| `/cairn:pane` | Opens a pane beside the chat. At the top, today's read-back quotes the oldest defensible note's one-sentence answer and asks whether it still sounds like you; "no" puts `/cairn:interview` for that note in your prompt. A practice interview on an open question shows how many questions are left and the minutes remaining, and takes an answer, a thinking-aloud note and a confidence rating for each question; its answers are not saved. Below that, a graph of the vault coloured by status, then the open questions and drafts, each with a `/cairn:study` button. The graph and the answer fields need the desktop app; the terminal shows a list. The pane only reads the vault. |

Every command but `/cairn:pane` writes as it goes: stop at any point and the next run picks up where you left off.

## Your vault

Your notes live in one private git repo you own, which Obsidian can open. Setup asks who you work for.
Notes about that employer's systems, projects and people carry `company: <employer>` in their
frontmatter; notes on tools, formats, ideas and the domain you work in carry no tag and never link to
tagged notes. When you change jobs, run `/cairn:setup` again: it lists the old employer's tagged notes and
asks whether to keep or delete them, and the rest of the vault is unaffected either way.

Setup writes two config files: `cairn.toml` in the vault (your name, your employer, your review slots),
and `~/.config/cairn/config.toml` for what is true of one machine (the vault's path and sources).
`vault/cairn.example.toml` and `config.example.toml` show every key. The rules every command follows are
in `shared/rules.md`.

## Install

```sh
claude plugin marketplace add Rendiere/cairn
claude plugin install cairn@cairn
```

Then run `/cairn:setup` in Claude Code. `git` is required, `jq` is needed to read Claude Code sessions,
and `gh` lets setup create a private GitHub repo for a new vault.

Cairn works in Claude Code only. Codex is not supported.

## Developing

Load a working copy with `claude --plugin-dir .` and run `/reload-plugins` after edits. Check manifests
and skill frontmatter with `claude plugin validate .`, and run `scripts/smoke.sh` before a release.

The maintainer's clone must never push an employer's information. In that clone,
`git config core.hooksPath .githooks` turns on a pre-push hook that runs `scripts/guard-scan.sh`. It
blocks a push when a commit's files, file names, message, author or committer hold a term listed in
`.git/info/guard-terms` (untracked, one term per line), and refuses every push while that file is empty.
`scripts/guard-scan.sh --all` checks the whole history. Contributors do not need the hook.

## Licence

MIT. See `LICENSE`.

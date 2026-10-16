# cairn

A Claude Code plugin that helps you understand your work well enough to explain it without notes. You
study a topic, Claude interviews you on it, and only your own answers go into the note. A scheduled sweep
reads your recent work and finds the topics you used but have no note on, basics first.

## Commands

| Command | What it does |
|---|---|
| `/cairn:setup` | Creates or connects your vaults, sets your review slots, finds the sources the sweep can read, and turns an existing knowledge base into ten starter questions. Saves after each step, so you can stop and run it again. Also repairs a broken setup and upgrades a vault from an older cairn layout, after showing every change. |
| `/cairn:study <topic>` | Teaches one topic in at most 20 minutes: three to five ranked sources and short hands-on steps you run yourself. Leaves a study pack of reading material in the vault. |
| `/cairn:interview <topic>` | Asks a fixed set of questions for the note's type (concept, system, project, synthesis, person), one at a time, and writes your answers with grammar fixes only. Afterwards reviews the answers against sources. `close <queue-item>` answers one open question. |
| `/cairn:sweep` | Your daily, weekly or monthly review. Reads the last 1, 7 or 30 days of Claude Code sessions, meeting notes, Slack and transcript folders, ranks uncovered topics by how many others build on them, and turns the top few into open questions, study sessions or interviews. Writes those questions, links between notes, and a dated record. |

Every command writes as it goes: stop at any point and the next run picks up where you left off.

## Vaults

Your notes live in git repos you own, which Obsidian can open:

- a **portable vault** for what would stay true at any employer: tools, formats, ideas;
- if you have an employer, a **company vault** for its systems, projects and people. It nests the
  portable vault at `general/`, so one Obsidian window shows both.

With a company vault, setup installs a git pre-commit hook in the portable vault that rejects any commit
containing one of the employer's names, as listed by you. It matches those names as plain text, case
insensitive, in file names and added lines. It does not catch a name you did not list, and
`git commit --no-verify` skips it.

Setup writes two config files: `cairn.toml` in each vault (your name and review slots; the company's
name), and `~/.config/cairn/config.toml` for what is true of one machine (vault paths and sources).
`vault/cairn.example.toml` and `config.example.toml` show every key. The rules every command follows are
in `shared/rules.md`.

## Install

```sh
claude plugin marketplace add Rendiere/cairn
claude plugin install cairn@cairn
```

The repo is private for now, so the first command needs your git credentials to have access to it.

Then run `/cairn:setup` in Claude Code. `git` is required, `jq` is needed to read Claude Code sessions,
and `gh` lets setup create private GitHub repos for new vaults.

Cairn works in Claude Code only. Codex is not supported.

## Developing

Load a working copy with `claude --plugin-dir .` and run `/reload-plugins` after edits. Check manifests
and skill frontmatter with `claude plugin validate .`, and run `scripts/smoke.sh` before a release.

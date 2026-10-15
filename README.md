# cairn

A Claude Code plugin for a second brain built fundamentals first. Each topic is learnt, then written down
in the owner's own words, and a periodic sweep finds what recent work touched that the brain does not
yet cover.

## Skills

| Command | What it does |
|---|---|
| `/cairn:setup` | Run once per machine. Creates or connects your vaults, switches on the employer-term guard, finds the sources the sweep can read, records an existing knowledge base as read-only, and sets your review cadence. Run again to check and repair. |
| `/cairn:study <topic>` | Teaches one topic interactively: canonical sources, small hands-on steps, check questions. Leaves a study pack in the vault. |
| `/cairn:interview <topic>` | Asks a fixed set of questions and writes the answers, grammar-fixed only, into a note. Reviews the answers against sources afterwards. Also closes queue items and writes synthesis notes on how topics combine. |
| `/cairn:sweep` | Reads recent Claude Code sessions, meeting notes, Slack and transcript folders, finds uncovered topics, ranks them by how many other topics build on them, and turns the top few into queue items, study sessions or interviews. |

## Vaults

Your notes live in Obsidian-compatible git repos that you own:

- a portable vault for anything true at any employer;
- when you have an employer, a company vault for its systems, projects and people. It nests the portable
  vault at `general/`, and a pre-commit hook in the portable vault rejects the employer's terms.

`/cairn:setup` builds both from the scaffolding in `vault/` and writes the per-machine config to
`~/.config/cairn/config.toml`. `config.example.toml` shows every key.

## Install

```sh
claude plugin marketplace add Rendiere/cairn
claude plugin install cairn@cairn
```

Then run `/cairn:setup` in Claude Code. `git` is required, `jq` is needed to read Claude Code sessions,
and `gh` lets setup create private GitHub repos for new vaults.

Codex is not supported yet; see `BACKLOG.md`.

After editing a skill: `claude plugin marketplace update cairn && claude plugin update cairn@cairn`.

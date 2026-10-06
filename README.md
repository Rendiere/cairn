# cairn

A Claude Code plugin for a second brain built fundamentals first. Each topic is learnt, then written down
in the owner's own words, and a weekly review finds what the week's work touched that the brain does not
yet cover.

## Skills

| Command | What it does |
|---|---|
| `/cairn:study <topic>` | Teaches one topic interactively: canonical sources, small hands-on steps, check questions. Leaves a study pack in the vault. |
| `/cairn:interview <topic>` | Asks a fixed set of questions and writes the answers, grammar-fixed only, into a note. Reviews the answers against sources afterwards. Also closes queue items and writes synthesis notes on how topics combine. |
| `/cairn:sweep` | Reads the week's Claude Code sessions, meeting notes and Slack, finds uncovered topics, ranks them by how many other topics build on them, and turns the top few into queue items, study sessions or interviews. |

## Vaults

The skills assume two Obsidian-compatible git repos:

- a portable vault for anything true at any employer, with a pre-commit hook that rejects the employer's
  terms;
- a company vault for the employer's systems, projects and people, which nests the portable vault at
  `general/` and holds `cairn.toml`, the list of sources the sweep reads.

## Install

```sh
claude plugin marketplace add ~/dev/personal/cairn
claude plugin install cairn@cairn
```

After editing a skill: `claude plugin marketplace update cairn && claude plugin update cairn@cairn`.

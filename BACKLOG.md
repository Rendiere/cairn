# Backlog

Goal: anyone can install cairn in Claude Code or Codex on a new machine, run `/cairn:setup`, and have
working vaults, sources and a review cadence without editing a file by hand.

Status is one of `doing`, `todo`, `blocked`, `parked`, `done`.

| # | Item | Status |
|---|---|---|
| 1 | Per-machine config and `/cairn:setup` | done |
| 2 | Vault scaffolding shipped in the plugin | done |
| 3 | Skills read the config instead of hardcoded names and paths | done |
| 4 | Install from GitHub instead of a local path | doing |
| 5 | Codex support | parked |
| 6 | Existing knowledge base as a read-only source | done |
| 7 | Review cadence: daily, weekly or monthly | done |
| 8 | Lock-in rules that stop the interview loop | done |
| 9 | More source types | todo |
| 10 | Fresh-machine smoke test | done |
| 11 | Public release | todo |

## 1. Per-machine config and `/cairn:setup`

`/cairn:setup` writes `~/.config/cairn/config.toml` (or `$CAIRN_CONFIG`), and running it again checks
and repairs the setup. It imports older layouts after showing every change.

Decided (2026-10-15): the config splits so a second machine does not re-ask everything. Facts about the
owner travel through git in the vault's `cairn.toml`: owner name, current employer, cadence.
`~/.config/cairn/config.toml` holds only what is true of one machine: the vault's path and which sources
it has. Setup on a second machine asks where the vault is cloned and which sources exist.

Decided (2026-10-16): one vault, with employer notes tagged. Each owner has a single private vault.
Notes about the current employer's systems, projects and people carry `company: <employer>` in their
frontmatter, and general notes never link to them. On a change of job, setup lists the old employer's
tagged files and the owner keeps or deletes them. This beat the 0.3.0 design of a portable vault plus
one company vault per employer, nested at `general/` and protected by a pre-commit hook that rejected
the employer's names: that split was a third of setup and the shared rules, and it guarded against
something a private vault holding only the owner's own words does not need. The cost is that a
company's notes now live in the owner's personal repo until the owner deletes them.

## 2. Vault scaffolding shipped in the plugin

A new user has no vault to copy. The plugin ships `vault/scaffold/` and `vault/templates/`, which setup
copies into a new vault and fills with the owner's name.

Decided (2026-10-15): the note-writing rules live once in the plugin, and every skill reads them there.
A vault does not carry a copy. Its `README.md` says what the vault holds, and its `CLAUDE.md` and
`AGENTS.md` say only that notes are written through cairn's skills, for agents that open the vault
without cairn. Done in 0.3.0: the rules are in `shared/rules.md`.

## 3. Skills read the config

The skills named the owner and his paths, and the study skill named an employer's internal tool. Each
skill now reads the config for the owner's name, the employer, the vault and the sources.

## 4. Install from GitHub

`claude plugin marketplace add Rendiere/cairn` replaces the local-path marketplace. While the repo is
private this needs GitHub access to it.

## 5. Codex support

Decided (2026-10-15): Claude Code and Codex are both fully supported from the same skill files.
Parked (2026-10-16): cairn targets Claude Code only for now. The skills keep to standard frontmatter
(`name`, `description`) so this stays open. Facts gathered for it: Codex loads `SKILL.md` skills from
`~/.agents/skills` and `~/.codex/skills`, has no plugin-root path variable, and writes sessions to
`~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` (compressed to `.jsonl.zst` after 7 days).

- Install path: Codex reads `SKILL.md` skills from its own skills directory; document or script linking
  `skills/*` there, and confirm the directory against current Codex docs.
- `scripts/sessions.sh` reads Claude Code transcripts only. Add Codex session logs under
  `~/.codex/sessions/` as a `codex` source, which has a different JSONL schema.
- The skills hand commands over as `! <command>`, which is Claude Code syntax. Say "run this in your
  terminal" in a host-neutral way.
- Run each skill once under Codex and fix what breaks.

## 6. Existing knowledge base as a read-only source

Setup records `[sources.kb] paths`. No skill ever writes there. KB text never becomes note prose; the
user re-says it in an interview.

Decided (2026-10-15): `/cairn:study` lists the user's own KB notes on the topic as a source, and the
sweep marks a gap topic "in your KB". Setup also reads the KB once, ranks its topics with the basics
first, and puts the top ten in the queue. The KB is not a gap signal on every sweep: the same hundreds
of old topics would surface each time.

## 7. Review cadence

Setup records `[cadence] every` (daily, weekly, monthly) and a slot, and offers to create a recurring
calendar event when a calendar tool is available. The sweep uses the cadence for its default window.
Sweep records carry the time (`YYYY-MM-DD-HHMM-sweep.md`), so two sweeps in one day keep separate records.

Decided (2026-10-15): the session's size matches the cadence. The user picks each slot at setup.

| Cadence | Length | Default slot | Session |
|---|---|---|---|
| Daily | 15 min | first thing in the morning | top 2 gaps parked, plus one queue item closed or one 5-minute read-back |
| Weekly | 30 min, or 60 | user's choice | full sweep plus one study or interview |
| Monthly | 45 min, or 60 | user's choice | full sweep, three read-backs, and a check across the month's notes |

## 8. Lock-in rules

- A note becomes `defensible` only when its type's required headings are answered and every review
  error has a re-answer. An error parked as a queue item keeps the note `draft`. The required headings,
  decided 2026-10-15 because question 5 differs by type and a person note has no question 5:
  - concept: one sentence, why it exists, my position
  - system: one sentence, why we have it, built from
  - project: one sentence, what I am asked to do
  - synthesis: the question, how it works, what I would do
  - person: role and what they own
- An interview raises at most two "Going deeper" queue items.
- Queue items are never worked on their own; they surface only when a sweep's material touches them.
- The sweep's read-back is the retention check. A failed read-back sets the note to `draft` and
  re-interviews only the heading that no longer sounds like the user.

## 9. More source types

Setup's `folders` source covers exported text (Whisper transcripts, WhatsApp chat exports). Still
missing: Outlook and Teams, Notion, Apple Notes, Otter, Fireflies.

## 10. Fresh-machine smoke test

`scripts/smoke.sh` runs setup headless in throwaway folders (with `$CAIRN_CONFIG` pointing there) for an
owner without and with an employer and checks the result: config written, `cairn.toml` naming the owner
and the employer, every template and `.gitkeep` present, no leftover files from older layouts. It does not cover study, interview or sweep, which need an owner answering.

## 11. Public release

The repo stays at `Rendiere/cairn`, so it links to its author. No IP release is needed, because cairn
holds only the plugin and never any employer's information. Before making it public: scan the full git
history for employer names, add a local pre-push hook in this repo that runs the same scan,
add a licence, and write the README for strangers.

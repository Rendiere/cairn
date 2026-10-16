# Scope

Audited: the cairn Claude Code plugin at commit `09e540c` (repo `Rendiere/cairn`), as a user meets it.
Surfaces: the four skills (`skills/setup`, `skills/study`, `skills/interview`, `skills/sweep`), the vault
scaffolding a new user gets (`vault/portable`, `vault/company`, `vault/templates`), `config.example.toml`,
and `README.md`.

Cairn has no graphical interface. Its interface is the conversation each skill runs, the files it writes,
and the commands the user types. Principles that the skill's rubric measures with web metrics (bundle
size, contrast, focus rings) are scored against their equivalents here: session length, steps and prompts
per task, consistency of note and file formats, and handling of empty, missing and failed states.

Primary user: a knowledge worker who runs Claude Code or Codex and wants to understand their work's
concepts and systems well enough to explain them without notes.

Primary task: turn the week's material (meetings, email, chat, agent sessions) into notes written in the
user's own words, by finding gaps (sweep), reading up (study) and being questioned (interview), at a
fixed cadence.

Constraints: plugin is plain Markdown skills plus small shell scripts; no server; must work in Claude Code
and Codex; employer names must never reach the portable vault.

Not audited as shipped design: decisions recorded in `BACKLOG.md` on 2026-10-15 that the code does not
yet implement (config split, per-type required headings, cadence sizes, KB onboarding). They are noted
where they bear on a score.

Reference designs: none named.

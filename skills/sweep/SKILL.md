---
name: sweep
description: Periodic review of the user's second brain against their recent real work. Reads the sources in the cairn config (Claude Code sessions, meeting notes, Slack, transcript folders) for the window since the last sweep, finds the topics they worked on that the brain does not cover, ranks them fundamentals first, and runs a short discussion that turns the top few into queue items, study sessions or interviews. Use when they type /sweep or /cairn:sweep, say "weekly review", "daily review", "brain review", "what did I miss this week", or at their "Brain sweep" calendar slot.
---

# Sweep

Thirty minutes at each review slot (daily, weekly or monthly, per the config's `cadence`). The output is a short discussion and a dated sweep record; no note is written
here. Notes come from `/cairn:study` and `/cairn:interview`, which the discussion hands off to.

## Setup

Read, in order: the interview skill in this plugin (`../interview/SKILL.md`) for the config, the vaults,
the home vault and the routing test; the cairn config, whose `[sources]` lists the sources and their
settings; the portable vault's `README.md`; the company vault's `README.md` when there is one. A source
missing from the config is skipped. With no config, offer `/cairn:setup` and stop.

## Steps

1. **Window.** The window starts at the date of the newest `interviews/*-sweep.md` in the home vault, or
   one cadence ago if there is none (1 day daily, 7 weekly, 30 monthly; 7 when no cadence is set), and
   ends now. Done when both dates are stated.
2. **Gather.** Read every source in the config for the window. Report one line per source: how many
   sessions, meetings or threads were read, or why the source was skipped (not authorised, no results,
   tool missing). Never stop because one source failed.
   - `claude_code`: `scripts/sessions.sh <days> <profile>...`. Each block is a session title, its working
     directory and the user's own messages.
   - `zoom_email`: search Gmail with the configured query, then read each summary with `get_message` in
     `PLAIN_TEXT`.
   - `meet_notes`: list Drive docs with the configured query through `gws drive files list`, then export
     each as text.
   - `slack`: search with `from:<@user_id>` and the window dates, then read the threads they replied in.
   - `granola`: the Granola MCP's meeting list for the window, then each meeting's notes. When the tools
     are not authorised, say so and skip.
   - `folders`: text and markdown files under each configured path modified in the window, one file per
     item.
   - `kb` is not gathered: it is read only in step 5.
   Done when every configured source has its line.
3. **Extract.** List the topics the material touches: tools, formats, techniques, systems, projects and
   recurring questions. Skip personal admin and anything outside their work and learning. For each topic,
   count the distinct sessions, meetings and threads it appears in; the count is its signal. Keep a pointer
   to where each came up (session title, meeting title, channel). Never copy wording from meetings,
   Slack or transcript files: those are other people's words, and only topic names leave this step. Done when every topic has
   a signal and pointers.
4. **Route.** Apply the routing test to each topic: portable if it stays true after the user leaves the employer,
   company otherwise. A topic that is a general idea applied to a company system splits in two, the
   general idea portable and the application company. With one vault, every topic is portable. Done when
   each topic has one vault.
5. **Subtract.** Drop a topic when its note exists with `status: defensible`, or when an open queue item
   or a study pack already names it and was touched in the window. Keep a topic whose note is `draft`; it
   counts as partly covered. Check filenames and titles in both vaults' `concepts/`, `systems/`,
   `projects/`, `people/`, `synthesis/`, `queue/` and `study/`. Then check filenames and headings under each
   `[sources.kb]` path: a match never drops the topic, since that text is not an interview answer, but
   mark it "in your KB" with the file path so `/cairn:study` can use it as a source. Done when every
   remaining topic is a gap or a partial.
6. **Graph.** For each remaining topic, list what it is built on, using the `depends:` frontmatter of
   existing notes and queue items, and your own judgement where none exists. Every link you guessed is
   marked as a proposal. Then, per topic: its dependents are the other topics, remaining or existing, that
   depend on it; its depth is the longest chain of `depends` beneath it. Done when every topic has
   dependents and depth.
7. **Rank.** Within each vault, order by: dependents, most first; then depth, shallowest first; then
   signal, highest first. A topic the user skipped in the previous sweep drops below every topic they did not.
   Done when each vault's list is ordered.
8. **Synthesis check.** A topic that names how ideas combine in a specific setting ("deletion requests on
   a Paimon lake") is a synthesis candidate. List its parts. If every part has a note, it is ready for
   `/cairn:interview` as a synthesis; otherwise name the missing parts, which join the ranking as
   prerequisites. Done when every synthesis candidate is ready or gated.
9. **Discuss.** Open with one message in this shape, two topics per vault, each with where it came up:
   "Since the last sweep you touched on some fundamental topics the brain does not cover: X (3 sessions) and Y (a
   meeting and a Slack thread). Company topics that came up with no entry yet: Z and W." With one vault, show four topics in one list. Add one line per
   synthesis candidate, ready or gated. Then ask which to take on, and for each pick, how: a queue item
   now, `/cairn:study` next, or `/cairn:interview` now. Also show each proposed `depends` link once and
   ask them to confirm or correct it. Done when every presented topic is picked or skipped and every
   proposed link is confirmed or dropped.
10. **Act.** Write a queue item from `templates/queue.md` for each pick that is not taken on today, with
    `depends:` set to the confirmed links. Write confirmed links into the `depends:` frontmatter of
    existing notes. Run at most one study or interview now; the rest become queue items. Done when every
    pick has a file or has run.
11. **Read-back.** Pick one `status: defensible` note, quote its "In one sentence" and ask whether it is
    still them. Apply their edit, if any. Done when they answer.
12. **Record.** Write `interviews/YYYY-MM-DD-sweep.md` in the home vault: the window, the per-source
    lines from step 2, both ranked lists with signal, dependents and depth, the synthesis candidates,
    what they picked and how, what they skipped, the confirmed links, and the read-back result. Topic names
    and source titles only, no quotes. Commit each changed vault as `sweep: YYYY-MM-DD` and push each
    vault that has a remote. Done when every changed vault is committed.

## Why fundamentals first

A topic many others are built on makes every later note shorter and more accurate, because those notes
can link to it instead of re-explaining it. The ranking still requires a signal from the period's work, so
the brain grows from what the user actually used rather than from a syllabus.

---
name: sweep
description: Scheduled review of the owner's recent work against their notes. Runs the daily, weekly or monthly flow set in the portable vault's cairn.toml, reads the configured sources (Claude Code sessions, meeting notes, Slack, transcript folders) for at most the last 1, 7 or 30 days, finds topics with no note, ranks them fundamentals first, and discusses the top few. A sweep writes queue items, confirmed depends links into existing notes, read-back edits, and a sweep record in the home vault's interviews/. The daily flow parks two gaps and hands off one queue item or runs one read-back; the weekly flow may run one /cairn:study or /cairn:interview; the monthly flow adds three read-backs and a check of the month's notes for contradictions and missing links. Use when they type /cairn:sweep, optionally with daily, weekly or monthly, say "weekly review", "daily review", "brain review", "what did I miss this week", or at their sweep slot.
---

# Sweep

Read `${CLAUDE_PLUGIN_ROOT}/shared/rules.md` and `${CLAUDE_PLUGIN_ROOT}/shared/note-types.md` before
anything else.

A sweep turns the owner's recent work into a short discussion and a dated record. It writes queue items,
confirmed `depends:` links into existing notes, and any read-back edits; the notes themselves come from
`/cairn:study` and `/cairn:interview`.

## Flows

Each flow's time limit is its cadence's `minutes` in the portable vault's `cairn.toml`.

| Flow | Window | Steps run | What it ends with |
|---|---|---|---|
| daily | 1 day | 1–7, 9–12 | the top two gaps parked as queue items, then one queue item handed to `/cairn:interview close` or one 5-minute read-back; never starts a study or interview |
| weekly | 7 days | 1–12 | picks discussed, at most one `/cairn:study` or `/cairn:interview` run now, one read-back |
| monthly | 30 days | 1–12 | picks discussed as queue items, three read-backs, and the month check in step 11 |

Most items read per source, per flow. When a source has more, read the most recent up to the cap and say
how many were left out.

| Source | Item | daily | weekly | monthly |
|---|---|---|---|---|
| `claude_code` | session | 20 | 50 | 100 |
| `zoom_email`, `meet_notes`, `granola` | meeting | 10 | 25 | 50 |
| `slack` | thread | 20 | 50 | 100 |
| `folders` | file | 20 | 50 | 100 |

## Steps

1. **Open.** Run `date +%H:%M`. Read the machine file and each vault's `cairn.toml`. Pick the flow: the
   one the owner named, else the one cadence with `enabled = true`; when several are enabled, ask once
   which; when none is, use weekly at 30 minutes. State the flow and its time limit. The window ends now
   and starts at the later of two times: the newest file in the home vault's `interviews/` whose name
   parses as `YYYY-MM-DD-HHMM-sweep.md`, and now minus the flow's window, so a missed sweep never widens
   it. Then create `interviews/YYYY-MM-DD-HHMM-sweep.md` in the home vault holding the flow and the
   window. With no `[sources.*]` other than `kb`, append "no sources", commit, and end with the line "No
   sources configured, nothing to sweep; record at <path>. Run /cairn:setup to add one, or say read-back
   for a 5-minute read-back." Otherwise create the resume item `queue/resume-sweep-YYYY-MM-DD-HHMM.md`
   from `templates/queue.md` listing the steps left; after each later step, take that step off the list.
   An open resume item from an earlier sweep is closed now, and its picks not yet acted on join this
   sweep's step 9. Done when the record and resume item exist, or the no-sources line is said.
2. **Gather.** Read every configured source for the window, replacing `{start}` in its query with the
   window's start date, up to the flow's cap. Append one line per source to the record: how many items
   were read and left out, or why the source was skipped (not authorised, no results, tool missing). Never
   stop because one source failed.
   - `claude_code`: `${CLAUDE_PLUGIN_ROOT}/skills/sweep/scripts/sessions.sh <days> <profile>...`, with
     `<days>` the window's length in whole days, rounded up. Each block is a session title, its working
     directory and the owner's own messages. A non-zero exit skips the source with the script's message.
   - `zoom_email`: search Gmail with the query, then read each summary with `get_message` in
     `PLAIN_TEXT`.
   - `meet_notes`: list Drive docs with the query through `gws drive files list`, then export each as
     text.
   - `slack`: search with `from:<@user_id>` and the window dates, then read the threads they replied in.
   - `granola`: the Granola MCP's meeting list for the window, then each meeting's notes.
   - `folders`: text and Markdown files under each path modified in the window, one file per item.
   - `kb` is not gathered; step 5 reads it.
   Done when every configured source has its line in the record.
3. **Extract.** List the topics the material touches: tools, formats, techniques, systems, projects,
   people and recurring questions. Skip personal admin and anything outside work and learning. A topic's
   signal is the number of distinct sessions, meetings, threads and files it appears in; keep a pointer to
   each (session title, meeting title, channel, file name). Never copy wording from meetings, Slack or
   transcript files: those are other people's words, and only topic names leave this step. Append the
   topics with signal to the record. Done when every topic has a signal and pointers.
4. **Route.** Give each topic a vault and a note type by the routing test and the vault rules. Done when
   each topic has one vault and one type.
5. **Subtract.** In both vaults, check filenames and titles in every folder listed in `note-types.md`,
   plus `queue/` and `study/`. Drop a topic whose note is `defensible`, or whose open queue item or study
   pack was changed in the window. Keep a `draft` note's topic as a partial. Then check filenames and
   headings under each `[sources.kb]` path: a match never drops a topic; tag it "in your KB" with the file
   path. Note any open queue item whose topic the material touched. Append the remaining topics to the
   record. With none left, append "no gaps", close the resume item, commit, and end with the line "No gaps
   since <window start>; record at <path>. Say read-back for a 5-minute read-back, or run /cairn:interview
   close <item> on an open queue item." Done when every remaining topic is a gap or a partial, or the
   no-gaps line is said.
6. **Graph.** For each topic, list what it is built on, from the `depends:` frontmatter of existing notes
   and queue items, and your own judgement where none exists; every guessed link is a proposal. Its
   dependents are the other topics, remaining or existing, that depend on it; its depth is the longest
   chain of `depends` beneath it. Done when every topic has dependents and depth.
7. **Rank.** Within each vault, order by dependents, most first; then depth, shallowest first; then
   signal, highest first. A topic listed as skipped in the previous sweep record drops below every topic
   that was not. Append each ranked list with signal, dependents and depth to the record. Done when each
   vault's list is ordered.
8. **Synthesis check.** Weekly and monthly only. A topic that names how ideas combine in a specific
   setting is a synthesis candidate. List its parts. If every part has a note, it is ready for
   `/cairn:interview`; otherwise its missing parts join the ranking as prerequisites. Append the candidates
   to the record. Done when every candidate is ready or gated.
9. **Discuss.** Daily: show the top two topics across both vaults, each with where it came up and any "in
   your KB" tag, and their proposed links, and ask whether to park both as queue items. Weekly and
   monthly: show two topics per vault (four with one vault), each with where it came up and any "in your
   KB" tag, plus one line per synthesis candidate. Ask which to take on; then, one pick per turn, how: a
   queue item, or (weekly only, one pick at most) a `/cairn:study` or `/cairn:interview` run now. Then
   show every proposed link once and ask which to keep. Append each answer to the record as it comes. Done
   when every shown topic is picked or skipped and every proposed link is kept or dropped.
10. **Act.** Write a queue item `learn-<topic-slug>` from `templates/queue.md` for each pick not run now,
    in the vault the Queue rules name, with `depends:` set to its kept links, and add a link to it under
    "Going deeper" in each existing note it touches. Write kept links into the `depends:` frontmatter of
    existing notes. Weekly: run at most one study or interview now. Daily and monthly never start one.
    Append each file written to the record. Done when every pick has a file or has run.
11. **Read-back.** Daily: offer one choice, one question: close an open queue item noted in step 5 (end
    by naming `/cairn:interview close <item>`, do not start it) or a 5-minute read-back. Weekly: one
    read-back. Monthly: three read-backs, then the month check: read the notes changed in either vault in
    the window and list pairs that contradict each other and notes that name a topic with a note but do
    not link to it; each contradiction becomes a queue item touching both notes, and each missing link is
    proposed as a `depends:` link and written if the owner keeps it. A read-back picks a `defensible`
    note, quotes its "In one sentence" (or its first required heading), and asks "does this still sound
    like you?"; apply their edit, or on a no set the note to `draft` and name the heading in
    `queue/resume-interview-<slug>.md`, creating it from `templates/queue.md` if needed. Append each
    result to the record. Done when every read-back has an answer and, monthly, the check is in the record.
12. **Record.** Append what was picked and how, a `## Skipped` list of skipped topics, and the next
    command, and close the resume item. Topic names and source titles only, no quotes. Commit and push
    each changed vault as "Commit and push" says, with message `sweep: YYYY-MM-DD`. End with the line
    Session state rule 3 asks for. Done when every changed vault is committed and the line is said.

Run `date +%H:%M` after every step. When the flow's time limit is reached, finish the current step,
commit with the resume item still open, and end with the closing line, naming `/cairn:sweep` to pick up.

## Why fundamentals first

A topic many others are built on makes every later note shorter and more accurate, because those notes
can link to it instead of re-explaining it. The ranking still requires a signal from the period's work, so
the brain grows from what the owner actually used rather than from a syllabus.

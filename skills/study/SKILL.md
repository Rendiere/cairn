---
name: study
description: Teach the owner one topic hands-on in at most 20 minutes before they are interviewed on it, writing a study pack (sources, walkthrough, outputs) to study/<slug>/ in their vault as the session runs. Lists matching notes from their existing knowledge base as "your earlier notes", read only. May create or extend a runnable lab under labs/. Keeps a "resume study" queue item open until the scope is taught, so a session stopped early resumes where it left off. Ends by handing off to /cairn:interview. Use when they type /cairn:study <topic> or /cairn:study <queue-item>, say "teach me X", "help me learn X", "I want to understand X before the interview", or when /cairn:interview offers a study session because no study pack exists yet.
---

# Study

Read `${CLAUDE_PLUGIN_ROOT}/shared/rules.md` and `${CLAUDE_PLUGIN_ROOT}/shared/note-types.md` before
anything else.

One topic, taught hands-on in at most 20 minutes, ending in a reading list and a hand-off to
`/cairn:interview`. This is the session where Claude teaches; the interview is where it only asks.

## What it produces

- `study/<slug>/README.md`: the study pack, created at step 1 and appended after every step.
- `study/<slug>/outputs/`: what the owner's commands produced: query results, rendered diagrams,
  screenshots.
- `labs/<lab>/`, only when a step needs a lab built or extended. Study creates `labs/` on first use.

A general topic uses public sources only. A company topic may also draw on the employer's internal ones,
and its pack's `README.md` carries the company tag.

## Steps

1. **Open.** Run `date +%H:%M` and state the 20-minute limit with its end time. Read the machine file
   and `cairn.toml`. Name the slug, the same one the note will take, and whether it is a company topic
   ("Company topics" in `rules.md`). If the argument is a queue item, its question is the whole scope. If
   `queue/resume-study-<slug>.md` is open, the scope is what it lists as left. If `study/<slug>/` exists,
   this is a refresher: read the pack and ask what to revisit. Create `study/<slug>/README.md`, or append
   a dated section to the existing one, holding the date and the scope, and `study/<slug>/outputs/` with a
   `.gitkeep`. Unless it is already open, create `queue/resume-study-<slug>.md` from `templates/queue.md`,
   titled "resume study: <slug>", listing what is left. Done when the pack holds the date and scope and
   the resume item is open.
2. **Probe.** Ask one question: "What do you think it is, and what do you think it's for?" Do not correct
   yet; the answer names the misconceptions to teach against. Append it to the pack, quoted. Done when
   the answer is in the pack.
3. **Sources.** Find three to five canonical sources and check every URL resolves. Rank them: the spec
   or original paper; the project's own documentation; one authoritative talk or post; for company
   topics, the internal design doc. When a `[sources.kb]` path has notes on the topic, list them as "your
   earlier notes", read only. For each source, name the sections worth reading and a reading time.
   Append the list to the pack. Done when the list is in the pack.
4. **Teach.** Build the topic up in steps of one idea each, in dependency order, so nothing is used
   before it is introduced. Each step is a few sentences of explanation, with a table or diagram where it
   beats prose; then something the owner runs themselves, handed over as `! <command>` or a file path;
   then one check question, where a wrong answer gets a direct correction and one more question. Claude
   may run setup (building mock data, installing a tool) but never the discovery command. When a step
   needs a lab, build or extend `labs/<lab>/`, creating `labs/` with a `.gitkeep` if it does not exist.
   Teach against the probe's misconceptions by name. After each step, save its output to `outputs/`,
   append the step to the pack (the explanation, the command, the output, the lab used), take the idea
   off the resume item, and run `date +%H:%M`. At the limit, stop after the current step and go to step
   5; the ideas not yet taught stay in the resume item. Done when every idea in scope has its step in the
   pack, or the limit is reached.
5. **Hand-off.** Show the reading list again, in order, and say to run `/cairn:interview <slug>` once
   they have read it and feel ready, or `/cairn:study <slug>` first when the resume item still lists
   ideas. Close the resume item when it lists nothing. Append the hand-off to the pack. Done when the
   list is shown.
6. **Commit.** Commit and push the vault as "Commit and push" says, with message
   `study: <slug>`, and end with the line Session state rule 3 asks for. Done when the commit lands and
   the line is said.

## Style

Lead with the answer; one idea per step; show before tell. Plain words over jargon, and every term
defined at first use. Mock data should look like the domain it stands in for, so the numbers mean
something.

---
name: study
description: Teach Renier one topic interactively before he is interviewed on it, and leave behind a study pack of sources and walkthrough in his second brain. Use when he types /study <topic>, /cairn:study or /study <queue-item>, says "teach me X", "help me learn X", "I want to understand X before the interview", or when /interview offers a study session because no study pack exists yet.
---

# Study

One topic, taught hands-on, ending in a reading list and a hand-off to `/cairn:interview`. This is the step
where Claude teaches; `/cairn:interview` is the step where it only asks.

The vaults and the routing test (would this still be true after Renier leaves the company?) are defined
in the interview skill of this plugin, `../interview/SKILL.md`. Read its "The two vaults"
section and the portable vault's `README.md` before starting.

## What it produces

- `study/<slug>/README.md`: the study pack. Sources, the walkthrough as taught, and the outputs that came
  out of it. Claude writes it, so it is material Renier read, never a note.
- Captured outputs under `study/<slug>/outputs/`: query results, rendered diagrams, screenshots.
- Lab changes under `labs/<lab>/`, only when a lab needs building or extending. A lab is a reusable,
  runnable environment on mock data, named for what it contains (`duckdb-lakehouse`), not for one topic,
  so several study packs can drive the same lab.

A portable topic's pack and labs go in the portable vault and use public sources only. A company topic's
pack goes in the company vault and may draw on internal sources.

## Steps

1. **Open.** Name the slug; it is the same slug the note will take. If `study/<slug>/` exists, this is a
   refresher: read the pack and ask what to revisit. If the argument is a queue item, the item's question
   is the whole scope. Done when the slug and scope are named.
2. **Probe.** One question: "What do you think it is, and what do you think it's for?" Do not correct yet.
   His answer tells you which misconceptions to teach against. Done when he has answered.
3. **Sources.** Find three to five canonical sources and check every URL resolves. Rank them: the spec or
   original paper; the project's own documentation; one authoritative talk or post; for company topics,
   the internal design doc or internal Q&A answer. For each, name the sections worth reading and a reading time.
   Done when the list is written into the pack.
4. **Teach.** Build the topic up in steps of one idea each, in dependency order, so nothing is used
   before it is introduced. Each step is:
   - a few sentences of explanation, with a visual where it beats prose (tree, table, diagram);
   - something Renier runs himself: a lab command or a read-only query against the real system, handed
     over as `! <command>` or a file path. Claude may run setup (building mock data, installing a tool)
     but never the step's discovery command;
   - one check question. A wrong answer gets a direct correction and one more question, then move on.
   Teach against the misconceptions from step 2 by name. Save each output he generates into
   `outputs/`. Done when every idea in scope has had its step.
5. **Hand-off.** Show the reading list again, in order, and say `/cairn:interview <slug>` when he has read it and
   feels ready. Done when the list is shown.
6. **Write the pack.** `study/<slug>/README.md` holds: the date; the scope; the probe answer, quoted; the
   sources with sections and times; the walkthrough as taught, one section per step, each with its
   command and output; the labs it used. Mark nothing `[claude]`: everything in a pack is Claude's. Done
   when a reader who missed the session can follow the pack from start to end.
7. **Commit.** In the vault that holds the pack, `git add -A && git commit -m "study: <slug>"`, then push.
   The portable vault's pre-commit hook rejects company terms; when it fires, the pack belongs in the
   company vault or the term comes out. Done when the push succeeds.

## Style

Lead with the answer; one idea per step; show before tell. Plain words over jargon, and every term
defined at first use. Mock data should look like the domain it stands in for, so the numbers mean
something.

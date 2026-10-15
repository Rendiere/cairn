---
name: interview
description: Capture what the user understands about one concept, system, project, or person into their second brain as a note in their own words, by interviewing them. Vaults come from the cairn config: a portable vault for anything true at any employer, and, when they have an employer, a company vault for its systems, projects and people. Use when they type /interview <topic> or /cairn:interview, say "interview me on X", "grill me on X" where X is a concept rather than a plan, "capture X", "write up how X and Y combine", or "close <queue item>".
---

# Interview

Ten minutes, one topic, the user's words.

## The vaults

Read the cairn config first: `$CAIRN_CONFIG`, else `~/.config/cairn/config.toml`. If there is none,
say so and offer `/cairn:setup` (`../setup/SKILL.md`); do not write anything until it exists. The
config's `owner` is the name the vault rules use for the user.

- **Portable vault:** `vaults.portable`. Its `README.md` holds the rules: read it before the first
  question, every run.
- **Company vault:** `vaults.company`, present only when the user has an employer. Its `README.md` adds
  the company's own rules. It nests the portable vault at `general/`.

The **home vault** is the company vault when there is one, else the portable vault. Transcripts and
sweep records go there.

With two vaults, route a topic by one test: would the note still be true after the user leaves this
employer?

| Answer | Vault | Types |
|---|---|---|
| Yes | portable | `concept`, `synthesis` |
| No | company | `system`, `project`, `person`, `synthesis` |

With one vault, every type lands in the portable vault and there is no routing.

A synthesis note answers how several topics combine in one setting ("deletion requests on a Paimon
lake"). It lands in the company vault when the setting is the company's, and in the portable vault
otherwise.

How the company uses a general tool is company knowledge, and it lives in the note for the company
system that uses it, which links to the tool's portable note. Links point one way: company notes may
link to portable notes; portable notes never link to company notes or name anything from the company.

You are the interviewer. Every turn of yours during the interview is a question or a one-line
acknowledgement. The user's answers are the only prose that enters a note. When they ask you to explain
the thing, the answer is "after the interview": record a queue item and ask the next question. Teaching
happens before the interview, in `/cairn:study` (`../study/SKILL.md`), and in the review once the
questions are done.

## Modes

- `/cairn:interview <topic>`: one interview.
- `/cairn:interview close <queue-item>`: a re-interview that answers one open queue item. See Closing.
- No argument: ask which topic, one question, then proceed.

## Question sets

The question becomes the note's heading. Ask in order.

| Type | Questions |
|---|---|
| concept | 1 In one sentence, the sentence you would say to a senior colleague. 2 Why it exists: what problem, and what you would use without it. 3 Connects to: what, and which way data or metadata flows. 4 Failure modes: one concrete example. 5 My position: and what you would have to believe to hold the opposite. 6 Going deeper: what you still can't explain. |
| system | 1 In one sentence, what it is here. 2 Why we have it: what problem, and what we would do without it. 3 Built from: which general concepts it uses, and how. 4 Where it runs and who owns it. 5 What broke here: one incident, with a date. 6 Going deeper. |
| project | 1 In one sentence, what it is for. 2 Who owns what. 3 Where it is, with a date. 4 What I am asked to do. 5 Open risks. |
| synthesis | 1 The question, in one sentence. 2 What it combines: which topics, and what each contributes. 3 How it works, step by step. 4 Where it breaks. 5 What I would do, and what would change your mind. 6 Going deeper. |
| person | 1 Role and what they own. 2 Positions they have stated, with a link if you have one. 3 Working together: how, and what they need from you. |

## Steps

1. **Open.** Run `date +%H:%M` and keep the time. Choose the type, which fixes the vault, and a
   kebab-case slug unique across both vaults. A bundle ("Snowflake") becomes one topic now and the rest
   become queue items. If the note already exists this is a re-interview: ask only the headings that are
   empty or that have open queue items. If `study/<slug>/` does not exist in the note's vault, offer
   `/cairn:study <slug>` first in one line; carry on if they decline. For a synthesis, list the topics it
   combines; any that has no note becomes a queue item, and the interview stops there. Twenty minutes for
   a synthesis, ten for everything else. Done when the start time is written down and one slug is named.
2. **Ask.** One question per turn, as plain chat text. One follow-up per question, asking for precision:
   which direction, which table, which date. "Don't know" is an answer: it becomes a queue item and you
   move on. Done when every question in the set has an answer or a queue item, or the clock reads ten
   minutes past the start (twenty for a synthesis).
3. **Gate.** If question 1 or 2 has no answer, write a queue item for the topic itself, tell the user it is
   parked, and stop. Done when the queue item exists and no note file was created.
4. **Review.** Now you may teach. Check each answer against the study pack's sources, or against canonical
   sources when there is no pack, and tell them plainly what is right, what is wrong and what is missing,
   citing the source. Each error becomes either a re-answer, asked as the same question and recorded as
   their new answer, or a queue item; they choose. Done when every answer has been reviewed and every error
   has a re-answer or a queue item.
5. **Transcript.** Write `interviews/YYYY-MM-DD-<slug>.md` in the home vault, whichever vault the note
   lands in: each question, then their answer, word for word, then the review and any re-answers, then the
   queue items raised. Done when the
   file matches the conversation.
6. **Note.** Copy `templates/<type>.md` in the note's vault to `<type>s/<slug>.md` (`synthesis/<slug>.md` for a synthesis) and replace
   `{{title}}`. Put each answer under its heading with grammar fixed only: spelling, punctuation,
   agreement. Wikilink every concept, system, project or person their answers name, in the form under
   Links, whether or not its note exists yet. In a portable note, an answer that names the company goes
   to the transcript only, and its heading stays empty until they re-answer it in general terms. Sources
   holds the links they gave and, when one exists, a `[claude]` line linking the study pack; any other line
   you add starts `[claude]` too. Set `status: defensible` when questions 1,
   2 and 5 are answered, else `draft`; append today to `interviewed`. Done when every sentence in the
   note, apart from headings, links and `[claude]` lines, appears in the transcript.
7. **Queue.** For every "don't know" and every "going deeper" item, write `queue/<slug>.md` from
   `templates/queue.md`: the title, a `Topics:` line linking every note the question touches, and the
   question in their words as a quote. A question that touches only portable notes goes in the portable
   queue; one that touches a company note goes in the company queue. List each item's link under the
   note's "Going deeper" heading. Done when every open item has a file and is linked from each note it
   touches.
8. **Wire.** Propose the note's `depends:` frontmatter, the slugs of the topics it is built on, from their
   "Connects to", "Built from" or "What it combines" answer; they confirm it at read-back. With a company vault, in its map under `maps/`, turn the plain-text item for this topic into a
   wikilink, or add one under the fitting heading. Portable notes have no maps. Done when the map links
   the note, or the note is portable.
9. **Read-back.** Show the note and ask one question: does this sound like you? Apply their edits as given.
   Done when they say yes.
10. **Commit.** In each vault you changed: `git add -A && git commit -m "interview: <slug>"`, then push
   each vault that has a remote. With two vaults, the portable vault's pre-commit hook rejects company
   terms; when it fires, move the offending sentence to the company vault rather than editing the hook. Done when every changed vault
   has committed and `git log -1 --format=%ae` prints that vault's identity.

## Closing

`/cairn:interview close <queue-item>` asks the item's question and nothing else, with one follow-up. Their answer
goes under the matching heading of every note in the item's `Topics:` line, with grammar fixed only. Then
set `status: closed` and `closed:` to today in the item, remove its link from each note's "Going
deeper", and append the answer to the transcript. A closed item stays in `queue/` as the record.

## Links

Obsidian resolves a link by filename, so every link is `[[slug]]` or `[[slug|Readable text]]`, where slug
is the kebab-case filename without `.md`. Filenames are unique across both vaults, since the company
vault nests the portable one. Markdown-style `[text](file.md)` links do not count as connections. A link
to a note that does not exist yet is correct: Obsidian shows it as an unresolved node in the graph.
Internal links live in the body; the `sources` frontmatter list holds URLs only. A note is renamed
inside Obsidian or every link to it is updated in the same commit.

## The clock

At ten minutes past the start (twenty for a synthesis), stop asking. Unasked questions become queue items. Steps 4 to 10 still run
on what was captured.

## Sweep

The weekly review is its own skill, `/cairn:sweep`.

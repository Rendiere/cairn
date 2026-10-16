---
name: interview
description: Capture what the owner understands about one concept, system, project, synthesis or person as a note in their own words, by asking that type's fixed questions one at a time. Writes a transcript as it goes, reviews the answers against sources, files open questions as queue items, and leaves a resume item if stopped early. Use when they type /cairn:interview <topic>, /cairn:interview <slug> to finish an existing note, or /cairn:interview close <queue-item>, or say "interview me on X", "grill me on X" where X is a concept rather than a plan, "capture X", "write up how X and Y combine", or "close <queue item>".
---

# Interview

Read `${CLAUDE_PLUGIN_ROOT}/shared/rules.md` and `${CLAUDE_PLUGIN_ROOT}/shared/note-types.md` before anything else.

One topic, the owner's words, inside the interview limit for its type. Claude conducts the questions under
"Interview conduct" in `rules.md`, and every note sentence follows "Note prose".

## Modes

- `/cairn:interview <topic>`: one interview. When `<topic>` is the slug of an existing note, it is a
  re-interview: ask only headings that are empty, headings with an open queue item touching the note,
  and headings a rejected read-back flagged in the note's resume item. With none of those, go straight to
  read-back.
- `/cairn:interview close <queue-item>`: answer one open queue item. See Closing.
- No argument: ask which topic, in one question, then proceed.

## Steps

1. **Open.** Read the config as `rules.md` "Config" says, then run `date +%H:%M` and keep the start time.
   Choose the type from `note-types.md`, which fixes the folder, template, question set, interview limit
   and whether the note carries the company tag, and a kebab-case slug unique in the vault. A bundle
   ("Snowflake") becomes one topic now and the rest become queue items. For a synthesis, list the topics
   it combines; each one without a note becomes a queue item, and the interview stops there with the
   closing line. If `study/<slug>/` does not exist, offer `/cairn:study <slug>` in one
   line and carry on if they decline. Then create the transcript `interviews/YYYY-MM-DD-HHMM-<slug>.md`,
   with the company tag in its frontmatter for a company topic, holding the topic, type and start time, and, unless it is already open, the queue
   item `queue/resume-interview-<slug>.md` from `templates/queue.md`, titled "resume interview: <slug>",
   linking the note and listing every heading still to ask. Done when both files exist and the start time
   is in the transcript.
2. **Ask.** One question per turn, as plain chat text, in the order `note-types.md` gives. One follow-up
   per question, asking for precision: which direction, which table, which date. "Don't know" is an
   answer: it becomes a queue item and you move on. For "Going deeper", keep at most two items as
   "Queue and lock-in" in `rules.md` says. After every answer, append the question and the answer word
   for word to the transcript, remove that heading from the resume item, and check `date +%H:%M`. When the interview
   limit is reached, stop asking: the unasked headings stay listed in the resume item. Done when every
   question has an answer or a queue item, or the limit is reached.
3. **Gate.** When Note prose rule 6 applies, write the queue item `learn-<slug>` for the topic itself
   (Queue and lock-in), close the resume item, append both
   to the transcript, tell the owner the topic is parked, and go to Commit. Done when the topic's queue
   item exists and no note file was created.
4. **Review.** Now you may teach. Check each answer against the study pack's sources, or canonical sources
   when there is no pack, and tell them plainly what is right, what is wrong and what is missing, citing
   the source. Each error becomes a re-answer, asked as the same question and recorded as their new
   answer, or a queue item; they choose. Append the review and every re-answer to the transcript as they
   happen. Done when every answer has been reviewed and every error has a re-answer or a queue item.
5. **Note.** Copy the type's template into the type's folder from `note-types.md`
   as `<slug>.md`, or open the existing note on a re-interview, replace `{{title}}`, and fill `company:`
   for a company topic. Put each answer
   under its heading as Note prose says, with every concept, system, project or person they name
   wikilinked as "Links" says. Sources holds the links they gave and, when a study pack exists, a
   `[claude]` line linking it. Leave `status: draft` and append today to `interviewed`. Done when every
   sentence in the note, apart from headings, links and `[claude]` lines, appears in a transcript.
6. **Queue.** For every queue item raised, write `queue/<item-slug>.md` from `templates/queue.md`, with
   the company tag when it touches a company note ("Company topics" in `rules.md`): the title, the `Topics:` line, and the question in their words as a
   quote under "The question". List each item's link under the "Going deeper" heading of every note it
   touches, and append the list to the transcript. Done when every open item has a file and is linked
   from each note it touches.
7. **Wire.** Propose the note's `depends:` list, the slugs of the topics it is built on, from the answer
   `note-types.md` names as feeding `depends:`; the owner confirms it at read-back. For a company note,
   in the fitting map under `maps/`, turn the plain-text item for this topic into a wikilink or add one
   under the fitting heading; when no map fits, create `maps/<area>.md` from `templates/map.md` with the
   company tag and the link. General notes have no maps. Done when a map links the note, or the note is
   general.
8. **Read-back.** Show the note and the proposed `depends:` list, and ask one question: does this sound
   like you? Apply their edits as given and write the confirmed `depends:`. On "not yet", the note stays
   `draft`, "read-back" is added to the resume item, and the step ends. A heading they say no longer
   sounds like them is named in the resume item and keeps the note `draft`. On yes, set `status` by the
   defensible rule in `note-types.md`, and close the resume item when it lists nothing. Append the
   outcome to the transcript. Done when they have said yes or "not yet".
9. **Commit.** Commit and push the vault as "Commit and push" in `rules.md` says, with message
   `interview: <slug>`. End with one line: the note's path, its status, and the next command:
   `/cairn:interview <slug>` while the resume item is open, `/cairn:interview close <item>` when a parked
   review error keeps it `draft`, else `/cairn:sweep`. Done when the vault has committed and the line is
   shown.

## Closing

`/cairn:interview close <queue-item>` creates the transcript `interviews/YYYY-MM-DD-HHMM-<item-slug>.md`,
with the item's company tag if it has one, then asks the item's question and nothing else, with one follow-up, appending both to
the transcript. Review the answer as in step 4. The answer goes under the matching heading of every note
in the item's `Topics:` line, as Note prose says. Then set `status: closed` and `closed:` to today in the
item, remove its link from each note's "Going deeper", and read back the changed headings as in step 8.
A closed item stays in `queue/` as the record. Commit and end as in step 9, with message
`interview: close <item-slug>`.

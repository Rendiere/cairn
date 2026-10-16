# Cairn rules

Every cairn skill reads this file and `note-types.md` beside it before doing anything else. A rule here
is stated nowhere else; skills and vault files point here instead of repeating it.

## Glossary

- **Owner:** the person whose notes these are. Their name is `owner` in the vault's `cairn.toml`.
- **Vault:** the owner's private git repo of Markdown notes, which Obsidian can open. There is one. A
  folder is the cairn vault when it has `cairn.toml` at its root.
- **Employer:** the company the owner works for now, `company` in `cairn.toml`. Absent when they have none.
- **Company topic:** a topic whose note would stop being true once the owner leaves the employer: its
  systems, projects and people, and a synthesis set there. A topic that would stay true at any employer
  (a tool, a format, an idea, the domain the company works in) is general.
- **Company tag:** `company: <employer>` in a file's frontmatter. Every file cairn writes about a company
  topic carries it, so the owner can find, keep or delete one employer's files when they leave.
- **Note:** one topic written in the owner's words. Its **note type** (concept, system, project,
  synthesis, person) fixes its folder, template and questions; see `note-types.md`.
- **Synthesis:** a note on how several topics combine in one setting ("deletion requests on a lakehouse").
- **Interview:** the session in which Claude asks a note type's questions and writes only the owner's
  answers into the note.
- **Transcript:** the verbatim record of an interview, in `interviews/`.
- **Study pack:** `study/<slug>/README.md` and its `outputs/`: the sources and walkthrough from a study
  session. Claude writes it, so it is reading material, never a note.
- **Lab:** a reusable, runnable environment on mock data under `labs/<lab>/`, named for what it contains
  (`duckdb-lakehouse`), so several study packs can share it.
- **Queue item:** one open question, a file in `queue/`, linked from every note it touches. It is closed
  by an interview.
- **Going deeper:** the heading in a note that lists links to the open queue items touching it. The
  owner's answers to the "Going deeper" question become those queue items; the heading holds only links.
- **Status:** a note is `draft` until its required headings are answered (see `note-types.md`), no
  review error is parked as a queue item, and the owner said yes at its last read-back; then it is
  `defensible`: the owner can explain and defend it.
- **Read-back:** showing the owner something they wrote and asking whether it still sounds like them.
- **Sweep:** the scheduled review that reads recent work, finds topics with no note, and hands the top
  few to study or interview.
- **Cadence:** how often the sweep runs (daily, weekly, monthly). Each cadence has a **slot**, the time
  the owner set aside, and a length in minutes.
- **Knowledge base (KB):** notes the owner already had before cairn. Cairn reads them and never writes
  to them; their text never becomes note prose.

## Config

Two files, so a second machine only needs paths and sources.

**Vault file `cairn.toml`,** at the vault's root and committed with it:

```toml
owner = "Ada"
company = "Acme"        # the current employer; omit when there is none

[cadence.daily]
enabled = true
minutes = 15            # 15 or more
slot = "weekdays 08:30" # default: first thing in the morning

[cadence.weekly]
enabled = true
minutes = 30            # 30 or 60
slot = "Fri 10:00"

[cadence.monthly]
enabled = true
minutes = 45            # 45 or 60
slot = "first Mon 10:00"
```

**Machine file,** `$CAIRN_CONFIG`, else `~/.config/cairn/config.toml`. Never committed.

```toml
vault = "~/brain"

[sources.claude_code]
profiles = ["~/.claude"]

[sources.zoom_email]
query = 'from:no-reply@zoom.us subject:"Meeting assets" after:{start}'

[sources.meet_notes]
query = "name contains 'Notes' and mimeType = 'application/vnd.google-apps.document' and modifiedTime > '{start}T00:00:00Z'"

[sources.slack]
user_id = "U00000000"

[sources.granola]           # present means enabled

[sources.folders]
paths = ["~/transcripts"]

[sources.kb]
paths = ["~/Documents/Obsidian/Old notes"]
```

- A source missing from `[sources]` is skipped. `{start}` in a query is replaced with the window's start
  date, `YYYY-MM-DD`.
- Paths under the home directory are written with `~`.

Every skill starts by reading the machine file, then the vault's `cairn.toml`. If either is missing, say
which and offer `/cairn:setup`; write nothing until setup has run.

## Company topics

- Every note type, transcript, study pack and sweep record goes in the one vault, in the folder
  `note-types.md` names.
- With an employer set, decide for each topic whether it is a company topic. System, project and person
  notes always are; a concept never is; a synthesis is when its setting is the employer's.
- A file about a company topic carries the company tag: its note, its transcript, its study pack's
  `README.md`, every queue item that touches a company note, and every map. A sweep record carries it
  whenever an employer is set.
- A general idea applied to a company system splits in two: the idea is a concept note, and how the
  company uses it lives in the system's note, which links to the concept.
- Links point one way. A company note may link to a general note. A general note never links to a company
  note and never names anything from the employer, so deleting one employer's files leaves the rest whole.
- People notes hold professional facts only: role, what they own, positions they have stated, how you
  work together.
- The vault holds no source code, credentials, customer data, or personal details about colleagues.

## Note prose

1. Only the owner's sentences are prose.
2. Claude writes structure: frontmatter, headings, wikilinks, and verbatim quotes with source links.
3. Any other sentence Claude adds starts with `[claude]`, or it does not go in.
4. The owner's answers get grammar fixes only: spelling, punctuation, agreement. Never rephrasing.
5. No summaries of documents. Insights from documents, in the owner's words.
6. A topic is a queue item, not a note, when any required heading among its first two questions has no
   answer (required headings are in `note-types.md`).
7. In a general note, an answer that names the employer goes to the transcript only; the heading stays
   empty until the owner re-answers in general terms.
8. Study packs are Claude's writing and are never notes. Nothing in a pack is marked `[claude]`.

## Interview conduct

During an interview's questions, Claude only asks. Every turn is a question or a one-line
acknowledgement. When the owner asks for an explanation, the answer is "after the interview": record a
queue item and ask the next question. Teaching happens in `/cairn:study` beforehand and in the review
after the questions.

## Links

- Obsidian resolves links by filename, so every link is `[[slug]]` or `[[slug|Readable text]]`, where the
  slug is the kebab-case filename without `.md`.
- Slugs are unique across the vault. The slug `sweep` is reserved.
- Markdown links `[text](file.md)` do not count as connections. A link to a note that does not exist yet
  is correct.
- Internal links live in the body; the `sources` frontmatter holds URLs only.
- A renamed note has every link to it updated in the same commit.

## Queue and lock-in

- Answers to the "Going deeper" question become at most two queue items per interview; further ones are
  dropped. "Don't know" answers and parked review errors are not capped.
- A queue item's slug names its question, is unique like every slug, and never equals a
  note's slug. A topic parked at the gate is `learn-<topic-slug>`; a resume item is
  `resume-<skill>-<slug>`.
- Queue items are never worked through on their own. One comes back only when a sweep's material touches
  it, or when the owner asks to close it.
- A review error parked as a queue item keeps the note `draft`.
- A read-back the owner rejects sets the note to `draft` and names the heading that no longer sounds like
  them in `resume-interview-<slug>`; the next interview on it asks only the headings that item lists.

## Session state

1. Every skill creates its output file at its first step and appends to it after every answer or step, so
   stopping at any turn loses nothing already said.
2. A skill that can be left half-done creates a queue item `resume-<skill>-<slug>` at its first step,
   listing what is left, updates it after every step, and closes it at its end. The owner can walk away
   at any turn and the next run picks up from that item. Closing a resume item deletes its file: it is
   bookkeeping, not a question, and the session's own output file is the record.
3. Every skill ends with one line: what was written, where, and the next command to run.
4. Every error the owner sees says what to run next.
5. Each skill states its time limit and checks it with `date +%H:%M` at the start and after each step.
6. Every folder a skill creates gets an empty `.gitkeep`, so it survives a clone.

## Commit and push

- At the end of a session: `git add -A && git commit -m "<skill>: <slug or date>"` in the vault, then
  `git push` when it has a remote.
- A failed push is reported in the closing line and left for the next run; never retry in a loop.
- After committing, `git log -1 --format=%ae` must print the email set for the vault; if not, say so.

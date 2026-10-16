# Cairn rules

Every cairn skill reads this file and `note-types.md` beside it before doing anything else. A rule here
is stated nowhere else; skills and vault files point here instead of repeating it.

## Glossary

- **Owner:** the person whose notes these are. Their name is `owner` in the portable vault's `cairn.toml`.
- **Vault:** a git repo of Markdown notes that Obsidian can open. A folder is a cairn vault when it has
  `cairn.toml` at its root.
- **Portable vault:** the vault for what would stay true if the owner left their employer: tools,
  formats, ideas. Every owner has one.
- **Company vault:** the vault for one employer's systems, projects and people. It exists only when the
  owner has an employer, and nests the portable vault at `general/`. One company vault is active at a
  time; a former employer's vault is archived.
- **Home vault:** where transcripts and sweep records go: the active company vault when there is one,
  else the portable vault.
- **Routing test:** the question that picks a vault for a topic: would the note still be true after the
  owner leaves this employer? Yes means portable, no means company.
- **Guard terms:** names that must never appear in the portable vault: an employer's name, its internal
  products and systems, codenames. Each company vault lists its own in `.portable-guard-terms`.
- **Guard:** the portable vault's git pre-commit hook. It rejects a commit whose file names or added lines
  contain a guard term from any listed company vault, archived ones included.
- **Note:** one topic written in the owner's words. Its **note type** (concept, system, project,
  synthesis, person) fixes its vault, folder, template and questions; see `note-types.md`.
- **Synthesis:** a note on how several topics combine in one setting ("deletion requests on a lakehouse").
- **Interview:** the session in which Claude asks a note type's questions and writes only the owner's
  answers into the note.
- **Transcript:** the verbatim record of an interview, in the home vault's `interviews/`.
- **Study pack:** `study/<slug>/README.md` and its `outputs/`: the sources and walkthrough from a study
  session. Claude writes it, so it is reading material, never a note.
- **Lab:** a reusable, runnable environment on mock data under `labs/<lab>/`, named for what it contains
  (`duckdb-lakehouse`), so several study packs can share it.
- **Queue item:** one open question, a file in `queue/`, linked from every note it touches. It is closed
  by an interview.
- **Going deeper:** the heading in a note that lists the open queue items touching it.
- **Status:** a note is `draft` until its required headings are answered (see `note-types.md`) and no
  review error is left open; then it is `defensible`: the owner can explain and defend it.
- **Read-back:** showing the owner something they wrote and asking whether it still sounds like them.
- **Sweep:** the scheduled review that reads recent work, finds topics with no note, and hands the top
  few to study or interview.
- **Cadence:** how often the sweep runs (daily, weekly, monthly). Each cadence has a **slot**, the time
  the owner set aside, and a length in minutes.
- **Knowledge base (KB):** notes the owner already had before cairn. Cairn reads them and never writes
  to them; their text never becomes note prose.

## Config

Two files, so a second machine only needs paths and sources.

**Vault file `cairn.toml`,** at each vault's root and committed with it.

Portable vault:

```toml
owner = "Ada"

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

Company vault:

```toml
company = "Acme"
```

The company name lives only in the company vault, so it never enters the portable vault's history.

**Machine file,** `$CAIRN_CONFIG`, else `~/.config/cairn/config.toml`. Never committed.

```toml
[vaults]
portable = "~/brain"

[[vaults.company]]          # zero or more; at most one with archived = false
path = "~/work/brain"
archived = false

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
- The **active company vault** is the `[[vaults.company]]` entry with `archived = false`.
- `.company`, in the portable vault's root and gitignored, is generated by `/cairn:setup` from the
  machine file: one line `terms=<company vault path>/.portable-guard-terms` per listed company vault,
  archived included. The guard reads only this file.

Every skill starts by reading the machine file, then each vault's `cairn.toml`. If either is missing,
say which and offer `/cairn:setup`; write nothing until setup has run.

## Vaults and routing

- With one vault, every note type, transcript, study pack and sweep record goes in the portable vault,
  and there is no routing and no guard.
- With a company vault, route each topic by the routing test. Types and vaults are in `note-types.md`.
  A synthesis goes to the company vault when its setting is the company's, else portable.
- A general idea applied to a company system splits in two: the idea is a portable note, and how the
  company uses it lives in the company system's note, which links to the portable one.
- Links point one way. A company note may link to a portable note. A portable note never links to a
  company note and never names anything from the company.
- Company people notes hold professional facts only: role, what they own, positions they have stated,
  how you work together.
- Company vaults hold no source code, credentials, customer data, or personal details about colleagues.
- Archived company vaults are read-only. Nothing is written to them; the guard still reads their terms.

## Note prose

1. Only the owner's sentences are prose.
2. Claude writes structure: frontmatter, headings, wikilinks, and verbatim quotes with source links.
3. Any other sentence Claude adds starts with `[claude]`, or it does not go in.
4. The owner's answers get grammar fixes only: spelling, punctuation, agreement. Never rephrasing.
5. No summaries of documents. Insights from documents, in the owner's words.
6. A topic whose first two questions are unanswered is a queue item, not a note.
7. In a portable note, an answer that names the company goes to the transcript only; the heading stays
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
- Slugs are unique across all vaults, since the company vault nests the portable one. The slug `sweep` is
  reserved.
- Markdown links `[text](file.md)` do not count as connections. A link to a note that does not exist yet
  is correct.
- Internal links live in the body; the `sources` frontmatter holds URLs only.
- A renamed note has every link to it updated in the same commit.

## Queue and lock-in

- A queue item goes in the portable vault's `queue/` when every note it touches is portable, else in the
  active company vault's `queue/`.
- An interview raises at most two "Going deeper" items. Further ones are dropped, not queued.
- Queue items are never worked through on their own. One comes back only when a sweep's material touches
  it, or when the owner asks to close it.
- A review error parked as a queue item keeps the note `draft`.
- A read-back the owner rejects sets the note to `draft`; the next interview on it asks only the heading
  that no longer sounds like them.

## Session state

1. Every skill creates its output file at its first step and appends to it after every answer or step, so
   stopping at any turn loses nothing already said.
2. A skill stopped before its end leaves a queue item `resume <skill>: <slug>` naming what is left, unless
   the output file already says so.
3. Every skill ends with one line: what was written, where, and the next command to run.
4. Every error the owner sees says what to run next.
5. Each skill states its time limit and checks it with `date +%H:%M` at the start and after each step.
6. Every folder a skill creates gets an empty `.gitkeep`, so it survives a clone.

## Commit and push

- At the end of a session, in each vault it changed: `git add -A && git commit -m "<skill>: <slug or date>"`,
  then `git push` when the vault has a remote.
- A failed push is reported in the closing line and left for the next run; never retry in a loop.
- When the guard rejects a commit, move the sentence to the company vault or take the term out. Never
  edit, bypass or disable the hook.
- After committing, `git log -1 --format=%ae` must print the email set for that vault; if not, say so.

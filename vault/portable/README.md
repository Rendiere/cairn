# Brain

{{owner}}'s portable second brain: what {{owner}} understands about tools, formats and ideas that would be
true at any employer. Written by interview with the cairn plugin's skills (`/cairn:study`,
`/cairn:interview`, `/cairn:sweep`), read when writing for other people.

## Vaults

This vault travels with its owner. When there is an employer, a company vault holds that employer's
systems, projects and people, and nests this vault at `general/` (a symlink, gitignored there), so one
Obsidian window resolves wikilinks across both.

Links point one way: a company note may link to a note here, and a note here never links to a company
note. That rule is what keeps this vault portable.

A topic belongs here when the note would still be true after {{owner}} leaves the employer. How an
employer uses a tool belongs in the company vault, in the note for the system that uses it.

With no company vault, every note type, every interview transcript and every sweep record lives here,
and there is no guard hook.

## Rules

1. Only {{owner}}'s sentences are prose.
2. Claude writes structure: frontmatter, headings, wikilinks, and verbatim quotes with source links.
3. Any sentence Claude composes is marked `[claude]` or does not land.
4. {{owner}}'s answers get grammar fixes, never rephrasing.
5. No summaries of documents. Insights from documents.
6. A note whose first two questions are unanswered is a queue item, not a note.
7. During an interview's questions Claude asks. It never teaches and never fills a gap with its own
   knowledge; teaching happens in `/cairn:study` beforehand and in the review afterwards.

## Boundary

With a company vault: no employer names, systems, data, code, credentials or people. The pre-commit
hook in `.githooks/` rejects a commit containing any term from the employer's guard list, whose path is
set in `.company` (untracked, written by `/cairn:setup`).

## Layout

- `concepts/` one note each, kebab-case filenames
- `queue/` the learning queue: one file per open question, linked to every topic it touches
- `study/<topic>/` study packs written by `/cairn:study`: sources, walkthrough and outputs, never notes
- `labs/<lab>/` reusable runnable environments on mock data, named for what they contain
- `synthesis/` notes on how several topics combine in one setting
- `templates/` one per note type

## Learning queue

A note's "Going deeper" section lists the open queue items that touch it. Closing an item takes an
interview; what is learnt goes into every note the item links, the item's status becomes `closed`, and
it leaves those "Going deeper" lists.

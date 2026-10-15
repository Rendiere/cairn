# Brain ({{company}})

{{owner}}'s company vault for {{company}}: its systems, projects and people. Written by interview, read
when writing for other people.

## Two vaults

General knowledge, true at any employer, lives in the portable vault, nested here as `general/` (a
symlink, gitignored). One Obsidian window opened on this folder resolves wikilinks across both.

Links point one way: a note here may link to a note in `general/`, and a note in `general/` never links
here or names anything from {{company}}. How {{company}} uses a general tool lives in the note for the
{{company}} system that uses it, which links to the tool's general note.

The rules live in `general/README.md`. This file adds what is specific to a company vault.

## Rules added here

1. People notes hold professional facts only: role, what they own, positions they have stated, how you
   work together.
2. Interview transcripts and sweep records land here, whichever vault the note goes to, because they
   quote work sessions verbatim.

## Boundary

Concepts, positions, working relationships. No source code, credentials, customer data, or personal
details about colleagues.

`.portable-guard-terms` lists the {{company}} terms the portable vault's pre-commit hook rejects. Add a
term when something company-specific could plausibly be written into a general note.

## Layout

- `systems/`, `projects/`, `people/` one note each, kebab-case filenames
- `maps/` front doors; plain items are notes not yet written, links are notes that exist
- `interviews/` dated verbatim transcripts and sweep records
- `queue/` learning queue items that touch at least one company note
- `synthesis/` notes on how general topics combine in a {{company}} setting
- `study/<topic>/` study packs for company topics, which may cite internal sources
- `templates/` one per note type
- `general/` the portable vault

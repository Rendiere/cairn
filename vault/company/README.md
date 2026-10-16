# Brain ({{company}})

{{owner}}'s company vault for {{company}}: its systems, projects and people. Notes are written only
through the cairn plugin (`/cairn:study`, `/cairn:interview`, `/cairn:sweep`), which holds the rules.

The portable vault is nested here as `general/` (a symlink, gitignored), so one Obsidian window opened on
this folder resolves links across both. Notes here may link into `general/`; nothing there links here.

## Layout

- `systems/`, `projects/`, `people/`, `synthesis/`: notes, one per topic, kebab-case filenames
- `maps/`: index pages; plain items are notes not written yet, links are notes that exist
- `interviews/`: dated interview transcripts and sweep records
- `queue/`: open questions that touch at least one company note
- `study/<topic>/`: study packs for company topics, which may cite internal sources
- `templates/`: one per note type
- `.portable-guard-terms`: {{company}} terms the portable vault must never contain
- `cairn.toml`: the company's name
- `general/`: the portable vault

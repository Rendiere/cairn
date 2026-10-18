# PROTOTYPE: vault layout in Obsidian

Throwaway. Question: what should a cairn vault look like in Obsidian once it holds a few notes, given
that every referenced topic gets an entry (no unresolved links) and the owner reviews their notes in
Obsidian itself?

`python3 build.py [vault]` reads a cairn vault (default `~/dev/personal/brain`, never written to) and
writes three layouts of the same content to `out/`, which is gitignored because it holds the owner's
notes. Open each folder in Obsidian with "Open folder as vault".

| Variant | Folders | Where you review |
|---|---|---|
| `A-type-folders` | One folder per note type, as cairn has now | `Home.md`, four table views from `Review.base` |
| `B-lifecycle` | The folder is the status: `1 To learn`, `2 Drafts`, `3 Defensible` | `Home.md`, one board grouped by folder from `_cairn/Board.base` |
| `C-flat-maps` | All notes flat in `notes/`, reached through topic maps; cairn's files under `_cairn/` | `Home.md` lists areas; `Review.md` holds today's read-back and the views |

Common to all three:

- Every link target that has no note gets a stub: the type's template with `status: stub` and empty
  headings. A stub is a company system when every note linking to it carries the company tag,
  otherwise a general concept.
- `depends:` holds wikilinks taken from the note's "Connects to" (or "Built from", "What it combines")
  heading, so Properties and the graph show them.
- Defensible notes get `reviewed:`, the date of their last read-back, which orders the read-back queue.
- Graph colours: grey stub, orange draft, green defensible, blue open question. Backlinks show under
  each note, so a stub shows where it was mentioned.
- A queue item whose slug equals a topic's slug is renamed `what-is-<slug>`, and study packs are
  `study-<slug>.md` so their slugs are unique.

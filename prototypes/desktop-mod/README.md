# PROTOTYPE: cairn as a Claude Code Desktop side pane

Throwaway, for issue #7. Question: is a side pane in Claude Code Desktop the right interface for cairn?

`cairn-pane/` is a Mod (a Claude Code plugin of function hooks). `/cairn-pane` opens one pane over the
vault named in `~/.config/cairn/config.toml`, top to bottom:

- Now: today's read-back, with "still mine" or "re-interview" per heading, and a button that starts a stub
  interview on an open queue item. The interview shows step N of 5, minutes left of 20, an answer field,
  a thinking-aloud field, a confidence picker, and a two-sentence reading of each answer from Haiku.
- Map: the vault as an SVG graph coloured by status, or a text list where the surface draws no SVG.
- Queue: the next sweep slot, open queue items and drafts; selecting one shows its question and a button
  that puts `/cairn:study <slug>` in the prompt.

The pane never writes to the vault, and answers and read-back marks last only for the session.

Install (the repo's marketplace lists it from this branch):

```sh
claude plugin marketplace add Rendiere/cairn
claude plugin install cairn-pane@cairn
```

In the desktop app: + next to the prompt box, Plugins, Add marketplace `Rendiere/cairn`, then Add plugin.

Test: `claude plugin test prototypes/desktop-mod/cairn-pane`.

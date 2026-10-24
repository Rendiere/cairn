---
name: pane
description: Opens the cairn side pane beside the chat, showing today's read-back or a practice interview, a graph of the vault, and the open queue. Use when the owner types /cairn:pane.
disable-model-invocation: true
---

# Pane

cairn's hooks module answers `/cairn:pane` itself and opens the pane, so this text runs only when that
module did not load. Tell the owner in one line that the pane did not open because cairn's hooks are not
loaded in this session, and that the pane needs a Claude Code session on their own machine with the cairn
plugin enabled. Do nothing else.

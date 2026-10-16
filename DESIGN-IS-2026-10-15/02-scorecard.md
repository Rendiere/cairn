# Scorecard

Scored by the orchestrator against the design-is anchors, worst instance, lower score on a tie.
Anchors in parentheses refer to `01-evidence.md`.

1. Good design is innovative — Score: 2/3
   Evidence: learn-then-be-interviewed loop with the user's words as the only prose, gaps ranked by
   dependents from work material, a guard between employer and personal vaults (E1.1, E1.3).
   Justification: a clear improvement on second-brain and spaced-review patterns, but each piece has
   precedent, so not 3.

2. Good design makes a product useful — Score: 1/3
   Evidence: person notes land in `persons/` while setup makes `people/` (E2.1) and can never become
   defensible (E2.2); existing company vaults fail setup's test (E2.9).
   Justification: the concept path works, but the worst instance (a person note) needs a detour to be
   found and never completes, which is below 2.

3. Good design is aesthetic — Score: 1/3
   Evidence: project and person templates lack fields the skills write (E2.5); queue placeholders never
   filled (E1.5); one type's folder name breaks the plural pattern (E2.1).
   Justification: three to five inconsistencies in the note and file formats; the "Done when" step format
   is consistent, which keeps it above 0.

4. Good design makes a product understandable — Score: 1/3
   Evidence: eleven terms used before definition, starting in the README's first lines (E2.10); hook errors
   with no next step (E2.11).
   Justification: the commands are identifiable, but more than three core labels are unclear on first use.

5. Good design is unobtrusive — Score: 2/3
   Evidence: one question per turn and an optional calendar event (E2.13, E3.6), against 9 to 17 setup
   questions and a read-back with no exit (E1.2, E2.12).
   Justification: the process serves the notes and stays quiet between sessions, but the ceremony is
   visible, so not 3.

6. Good design is honest — Score: 1/3
   Evidence: sweep says it writes no note and edits notes (E2.3); guard "switched on" and "rejects" claims
   overstate it (E2.6); unenforced time promises (E2.8); wrong trigger names (E2.7).
   Justification: two or more inflations, no deceptive flow (E2.13), so 1 and not 0.

7. Good design is long-lasting — Score: 2/3
   Evidence: plain Markdown in git, readable in any editor; ties to Claude Code `!` syntax and a hardcoded
   claude-mem skip in `sessions.sh` (E3.5, `BACKLOG.md:74-75`).
   Justification: the storage format will age well; one host-specific marker keeps it from 3.

8. Good design is thorough down to the last detail — Score: 0/3
   Evidence: no interrupted-run handling in any of the four skills, no empty state for sweep, no success
   message for interview or sweep, no push-failure handling anywhere, same-day collisions (E3.4).
   Justification: four or more states missing.

9. Good design is environmentally friendly — Score: 1/3
   Evidence: sweep loads all material in the window with no cap and the window grows with every missed
   slot (E3.2); study has no time limit and can chain from a sweep (E3.3).
   Justification: attention and context cost is unbounded on the main recurring task; the 300-character
   cap and single calendar event keep it above 0.

10. Good design is as little design as possible — Score: 1/3
    Evidence: rules restated across up to nine locations and duplicate `AGENTS.md`/`CLAUDE.md` (E1.4);
    five or more written-but-unread config keys and placeholders (E1.5).
    Justification: three to five classes of removable element; the four commands themselves each earn
    their place, which keeps it above 0.

Total: 12/30

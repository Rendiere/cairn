# Verdict: REDESIGN

Cairn scores 12/30 with a 0 on thoroughness, so the rule gives REDESIGN: the study, interview and sweep
loop is worth keeping, but the skills, vault files and config around it need rebuilding from the
primary task, with every rule stated once, every state handled and every claim matching behaviour.

The rule beat REFINE on two counts: the total is below 20, and principle 8 scored 0. Most failures trace
to two structural choices rather than isolated bugs. The rules live in prose copied across eleven files
(E1.4), so they drift apart (E2.1 to E2.5). Each skill writes its outputs only at its last step (E3.4), so
every interruption loses the session.

## Highest-leverage moves

1. #8 thorough: give every skill an interrupted, empty, error and success state; write the interview
   transcript and the sweep record as the session runs, not at the end. Evidence: E3.4,
   `skills/interview/SKILL.md:86`, `skills/sweep/SKILL.md:81`, `skills/study/SKILL.md:50`.
2. #10 as little design, #4 understandable: hold the rules and the glossary once, in the plugin, and
   have skills and vault files point to them; drop unread config keys. Evidence: E1.4, E1.5, E2.10.
3. #2 useful, #3 aesthetic: one note-type table drives folder names, templates, question sets and the
   per-type required headings, so person notes get `people/`, `depends:` and a reachable defensible state.
   Evidence: E2.1, E2.2, E2.5, `skills/interview/SKILL.md:58-64,90,96-97`.
4. #6 honest: make every claim match behaviour (sweep edits notes, the guard is two-vault only and a
   substring match, `/cairn:*` triggers, session lengths). Evidence: E2.3, E2.6, E2.7, E2.8.
5. #9 environmentally friendly: size the sweep's input to the session length per cadence, with a cap per
   source and a maximum window. Evidence: E3.2, E3.3, `BACKLOG.md:94-100`.

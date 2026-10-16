# Note types

Read with `rules.md`. This table is the only place that fixes a note type's folder, template, company tag,
questions and the headings it needs to become `defensible`. Skills read folder names from here; they never
derive them from the type's name.

| Type | Company tag (with an employer set) | Folder | Template | Interview limit | Required for defensible |
|---|---|---|---|---|---|
| concept | never | `concepts/` | `templates/concept.md` | 10 min | In one sentence; Why it exists; My position |
| system | always | `systems/` | `templates/system.md` | 10 min | In one sentence; Why we have it; Built from |
| project | always | `projects/` | `templates/project.md` | 10 min | In one sentence; What I am asked to do |
| synthesis | when the setting is the employer's | `synthesis/` | `templates/synthesis.md` | 20 min | The question; How it works; What I would do |
| person | always | `people/` | `templates/person.md` | 10 min | Role and what they own |

A template's `company:` line is left empty when the note carries no company tag.

A note is `defensible` when every required heading has an answer, no review error is parked as a queue
item, and the owner said yes at its last read-back. Otherwise it is `draft`.

## Questions

Each question is asked in order, and its heading name is the note's heading. Every note template also
ends with a `Sources` heading, which is not a question.

**concept**
1. In one sentence: the sentence you would say to a senior colleague.
2. Why it exists: what problem, and what you would use without it.
3. Connects to: what, and which way data or metadata flows.
4. Failure modes: one concrete example.
5. My position: and what you would have to believe to hold the opposite.
6. Going deeper: what you still can't explain.

**system**
1. In one sentence: what it is here.
2. Why we have it: what problem, and what we would do without it.
3. Built from: which general concepts it uses, and how.
4. Where it runs and who owns it.
5. What broke here: one incident, with a date.
6. Going deeper: what you still can't explain.

**project**
1. In one sentence: what it is for.
2. Who owns what.
3. Where it is: with a date.
4. What I am asked to do.
5. Open risks.
6. Going deeper: what you still can't explain.

**synthesis**
1. The question: in one sentence.
2. What it combines: which topics, and what each contributes.
3. How it works: step by step.
4. Where it breaks.
5. What I would do: and what would change your mind.
6. Going deeper: what you still can't explain.

**person**
1. Role and what they own.
2. Positions they have stated: with a link if you have one.
3. Working together: how, and what they need from you.
4. Going deeper: what you still can't explain.

The answers that name the topics a note is built on are "Connects to" (concept), "Built from" (system)
and "What it combines" (synthesis). They feed the note's `depends:` list.

## Other templates

| File | Lives in | Written by |
|---|---|---|
| `templates/queue.md` | `queue/<slug>.md` | interview, sweep, setup (KB onboarding) |
| `templates/map.md` | `maps/<area>.md`, for company notes only | interview, when no map fits the topic |

## Placeholders

| Placeholder | Used in | Filled with |
|---|---|---|
| `{{title}}` | every template | the topic's readable name |
| `{{date}}` | `queue.md` | today, `YYYY-MM-DD` |
| `{{links}}` | `queue.md` | wikilinks to every note the question touches, comma-separated |
| `{{owner}}` | the vault's `README.md` | `owner` from `cairn.toml` (setup only) |

A queue item's `tags:` frontmatter holds `in-your-kb` when the owner's knowledge base covers the topic.

## Other files in a vault

| Path | Written by |
|---|---|
| `interviews/YYYY-MM-DD-HHMM-<slug>.md` | interview (transcript) |
| `interviews/YYYY-MM-DD-HHMM-sweep.md` | sweep (record) |
| `study/<slug>/README.md`, `study/<slug>/outputs/` | study |
| `labs/<lab>/` | study, created on first use |

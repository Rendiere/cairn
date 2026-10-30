# Cairn

Cairn is where a person steps away from their usual work to learn a topic and prove they can explain it. This glossary fixes the words used for that learning, the record it leaves, and what brings the person back.

## The Knowledge Graph

**Knowledge Graph**:
Everything a person has learned or plans to learn, as topics joined by directed prerequisite links. It is computed from their notes and has no separate copy.
_Avoid_: Vault, brain, knowledge base, map

**Topic**:
One thing a person can learn and be tested on, and one node in the Knowledge Graph.
_Avoid_: Stone, concept, node, item

**Note**:
The written record of one topic, built up during its lesson and carrying its visuals and references. Each topic has at most one.
_Avoid_: Page, document, article

**Prerequisite**:
A topic that another topic directly builds on. The link has a direction: Parquet is a prerequisite of Iceberg snapshots, and never the reverse.
_Avoid_: Dependency, parent, upstream

**Related link**:
A connection between two topics that says nothing about what either builds on, and so never affects status.
_Avoid_: Wikilink, reference

## Status

**Solid**:
The status of a topic that was passed or self-marked, has not failed since, and whose prerequisites are all solid.
_Avoid_: Defensible, verified, mastered, known

**Loose**:
The status of any topic that is not solid.
_Avoid_: Not defensible, unverified, untested, blocked

**Resting on**:
What a loose topic shows when it was passed or self-marked and only its prerequisites keep it from being solid, as in "resting on Parquet". Nothing is ever locked by it.
_Avoid_: Blocked by, gap in

**Self-marked**:
A label on a topic the person marked solid by hand, with no passed test behind it.
_Avoid_: Manual, unverified, assumed

**Retest due**:
A flag on a solid topic whose retest date has passed. The topic stays solid.
_Avoid_: Expired, lapsed, overdue

## Learning

**Session**:
One sitting in which a person works on a topic, away from their usual work.
_Avoid_: Chat, conversation, study

**Probe**:
The part of a session that finds where the person's understanding of the topic ends.
_Avoid_: Assessment, quiz, placement

**Lesson**:
The teaching in a session that starts from what the probe found, favouring visuals and animation over writing.
_Avoid_: Interview, study, tutorial

**Demo**:
A self-contained interactive page that shows how something works, and can serve several topics.
_Avoid_: Artifact, widget, simulation

**Lab**:
A set of real files and tools the person works through by hand, and can serve several topics.
_Avoid_: Exercise, sandbox, workshop

## Testing

**Test**:
New written questions on one topic, answered with the note hidden, each with the person's thinking and confidence.
_Avoid_: Interview, quiz, exam, read-back

**Grader**:
The agent that marks a test and took no part in the session. Its verdict stands.
_Avoid_: Reviewer, teacher

**Pass**:
A grader's verdict that a person can explain the topic.
_Avoid_: Score, completion

**Retest**:
A later test on a topic that has already passed.
_Avoid_: Review, refresh, read-back

**Spot check**:
A two-question test offered when a person self-marks a topic, which they can skip.
_Avoid_: Quick test, verification

## Bringing work in

**Sweep**:
The unattended reading of a person's recent work to find topics missing from their Knowledge Graph.
_Avoid_: Scan, review

**Source**:
A place the sweep may read, such as meeting notes or a chat workspace.
_Avoid_: Connector, feed, integration

**Reference**:
Material a note cites to back up what it says.
_Avoid_: Source, citation

**Proposal**:
A topic the sweep suggests, with its reason and where it was found. It joins the Knowledge Graph only when the person accepts it.
_Avoid_: Gap, suggestion, queue item

**Imported vault**:
A frozen copy of notes a person had before Cairn, kept unchanged, from which new topics are built.
_Avoid_: Knowledge base, KB, source

## Privacy

**Private**:
Readable only with the person's key, including the name of whatever is private. Employer data is private by default.
_Avoid_: Secret, hidden, encrypted

**Privacy rule**:
A pattern Cairn proposes for what counts as employer data, which the person accepts or edits.
_Avoid_: Filter, company tag

## Coming back

**Block**:
Recurring time in a person's calendar set aside for Cairn.
_Avoid_: Slot, cadence, appointment

**Helper**:
The part of Cairn that keeps working while the app is closed, sweeping before a block and sending nudges.
_Avoid_: Daemon, agent, background job

**Nudge**:
A message that brings a person back to Cairn: the block's calendar link, the alert just before a block, or the weekly digest.
_Avoid_: Reminder, notification

**Digest**:
A weekly email to the person listing retests due, new proposals and recent results.
_Avoid_: Summary, newsletter

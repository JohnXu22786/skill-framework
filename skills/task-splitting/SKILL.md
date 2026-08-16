---
name: task-splitting
description: Use when work can be done by several agents in parallel — split it into independent units with explicit contracts, dispatch them, and integrate the results with a single owner.
metadata:
  version: "1.0"
  group: collaboration
---
# Task Splitting

## Core Principle

Parallel work pays only when the pieces are independent. Split by contract, not by file: each unit must be completable and verifiable without talking to any other unit, and the seams between them must be decided before the splitting starts.

## When to Use

- A body of work with several clearly separable areas: independent features, independent modules, independent experiments.
- Investigation tasks: multiple hypotheses to check, several code paths to trace — these parallelize beautifully because they only produce reports.
- Time is the constraint and the coordination cost is smaller than the serial work.

Do **not** split when the pieces share mutable state, when one piece's output is the other's unexamined input, or when the integration effort would exceed the work saved. Splitting a task that is secretly one task just adds a merge problem.

## Steps

1. **Decide the seams first.** Identify the boundaries between units: interfaces, data formats, file ownership, conventions. The seams must be fixed before dispatch — two agents cannot design a contract by parallel negotiation.
2. **Cut along the seams.** Each unit must be:
   - **Independent:** no shared files being edited, no shared state mutated, no ordering requirement between units.
   - **Completely specified:** goal, constraints, inputs and outputs, the files it owns, the definition of done, and how to verify — written down, not explained.
   - **Bounded:** sized so a single agent can finish it without needing a checkpoint conversation.
3. **Write one spec per unit.** Use the task template from praxis:implementation-blueprint, plus: what the unit must NOT touch (the other units' files and interfaces), and what it should do if its assumptions turn out false (report back, do not improvise across the seam).
4. **Dispatch and collect.** Send each unit to one agent with its spec. Collect results as they land; check each against its spec, not against your memory of it.
5. **Integrate with one owner.** One agent (or you) owns the integration: assembling the units, running the whole suite, and resolving cross-unit issues that only appear at the seams. The integration owner is the only one allowed to change the seams after dispatch.
6. **Fail loudly per unit.** If a unit comes back wrong, reject it with the spec in hand — the rejection message is the diff between the unit's output and its contract. Do not quietly repair units; the next unit will repeat the same misunderstanding.

## Sizing Guidance

- A unit that takes longer than a focused session is too big: split it further.
- A unit whose spec is shorter than its possible ambiguity is a gamble: expand the spec, then dispatch.
- Investigation units are always worth parallelizing; they are the cheapest parallel win because their failure mode is "inconclusive report", not "broken merge".

## Checklist

- [ ] Seams (interfaces, formats, file ownership) fixed before dispatch
- [ ] Units independent: no shared files, state, or ordering
- [ ] Each unit has a written spec with goal, constraints, done, verification
- [ ] Specs state what units must not touch
- [ ] Results checked against specs; failures rejected with the diff
- [ ] One integration owner assembles and runs the whole suite

## Cross-References

- Writing the unit specs: **REQUIRED SUB-SKILL:** praxis:implementation-blueprint
- Full delegation workflow with review: **REQUIRED SUB-SKILL:** praxis:delegated-build
- Verifying the integrated result: **REQUIRED SUB-SKILL:** praxis:completion-proof

---
name: implementation-blueprint
description: Use when a design has been agreed and it is time to write the step-by-step implementation plan — each task with files, tests, and a definition of done — before any code is written.
metadata:
  version: "1.0"
  group: planning
---
# Implementation Blueprint

## Core Principle

A plan is a contract between you and the work: every task is small enough to verify, ordered so that each step can be tested, and written so that someone (or some agent) without your context can execute it.

## When to Use

- Directly after a design has been agreed, for any change larger than a one-liner.
- When a task is too big to hold in your head at once.
- When the work will be delegated or executed later (by you, or by another agent).

Do **not** plan the trivial: if the change is a single obvious edit, planning it is overhead. Write the plan file only when it earns its keep.

## Steps

1. **Collect the inputs.** The agreed design (from praxis:design-conversation if one happened), the list of files involved, the test command of the project, and the definition of "done" that the user will accept.
2. **Decompose into tasks.** Break the work into ordered tasks, each one:
   - Small enough that its success is observable in minutes, not hours.
   - A single coherent change: "add endpoint", "wire storage", "handle empty input".
   - Owns its test cases: what behavior must be verified, and with what input.
   - Names the files it touches.
3. **Order by dependency, then by risk.** A task that unblocks others goes first; risky or unfamiliar work goes early while there is still budget to recover; test-infrastructure work precedes the code that needs it.
4. **Define the checkpoints.** After which tasks must the project still build and test green? Mark them explicitly — these are the gates the executor runs before continuing.
5. **List the risks.** For each: what could go wrong, how you would notice, what the fallback is. Risks without a detection method are wishes.
6. **Write the plan to a file.** Use a checklist per task with concrete verification steps. Keep it in the workspace so it survives context loss and can be shared with delegated workers.

## Task Template

```markdown
### Task N: <verb> <thing>

**Goal:** <one sentence — what success looks like>
**Files:** <paths this task creates or changes>
**Behavior to verify:**
- [ ] <specific observable behavior with concrete input>
- [ ] <edge case: empty input, error path, boundary>
**Tests to run:** <command or test names>
**Done when:** <the observable state that ends this task>
```

## Sizing Rule

If a task needs more than a paragraph to describe, it is too big — split it. If a task has no observable behavior of its own, merge it into a neighbor. Tasks that cannot be tested in isolation are a design smell, not a plan.

## Scope Discipline

- Every task must trace back to the agreed design. If a task serves a feature nobody agreed to, cut it or ask.
- Defer speculative work: anything "we might need later" gets a note, not a task.
- YAGNI applies to plans too — the cheapest way to build nothing extra is to never plan it.

## Checklist

- [ ] Plan written to a file, not kept in memory
- [ ] Each task has a goal, files, verification steps, and done-when
- [ ] Tasks ordered by dependency, risky work early
- [ ] Checkpoints marked where the build and tests must be green
- [ ] Risks listed with detection methods
- [ ] Scope matches the agreed design, nothing speculative

## Cross-References

- Agreeing the design first: **REQUIRED SUB-SKILL:** praxis:design-conversation
- Executing the plan: **REQUIRED SUB-SKILL:** praxis:blueprint-execution
- Writing the tests the plan relies on: **REQUIRED SUB-SKILL:** praxis:test-first-cycle

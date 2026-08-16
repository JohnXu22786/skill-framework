---
name: blueprint-execution
description: Use when executing a written implementation plan — work through its tasks in order, run the checkpoints, and stop and report on any deviation instead of improvising silently.
metadata:
  version: "1.0"
  group: planning
---
# Blueprint Execution

## Core Principle

The plan is the contract; the checkpoints are the gates. Execute in order, verify at every gate, and when reality disagrees with the plan, stop and renegotiate — never drift.

## When to Use

- You have a written plan (yours or someone else's) with ordered tasks and you are about to implement it.
- You were handed a task list by another agent or a user and told to work through it.
- After a checkpoint fails, or the plan and reality diverge.

## Steps

1. **Read the whole plan first.** Know the final goal, the checkpoints, and the risks before touching the first task. If parts of the plan are unclear, ask before starting — do not interpret ambiguities in the direction of least work.
2. **Work tasks in order.** One task at a time, top to bottom. Do not skip ahead to the interesting task; the order encodes dependencies.
3. **Follow the task contract.** For each task: implement the goal, then run its verification steps, then run its tests. A task is only complete when its done-when is true — not when the code looks right.
4. **Run the checkpoints.** At every marked gate, run the project's build and test commands. Green means proceed; red means stop at step 5.
5. **On deviation, stop and report.** If a task turns out harder, larger, or different than planned: stop working on it, state what the plan predicted vs what happened, propose an adjustment (revise the task, split it, or revise the plan), and let the user decide. Continue only after the adjustment is agreed.
6. **Track progress in the plan file.** Tick off completed tasks as you go. The plan file is the shared record for you, the user, and any delegated workers.
7. **Finish with a full verification pass.** After the last task: run the complete relevant test suite, re-read the diff against the plan, and confirm nothing was added that the plan did not call for.

## Rules

- **No silent improvisation.** A small detail left unspecified by the plan may be decided sensibly and noted in the plan file. A structural deviation — different files, different behavior, extra work — is always reported.
- **No task-skipping.** An unskippable-looking task that turns out unnecessary is a plan bug: report it, and get the plan amended rather than quietly dropping it.
- **Honor the sizing.** If a task drags past the effort the plan implied, that is signal for step 5, not an invitation to push on.
- **Write down the why.** When you make any judgment call during execution, record it next to the task. Future readers (including future you) need the reasoning, not just the outcome.

## Checklist

- [ ] Whole plan read and understood before starting
- [ ] Tasks executed in order; each verified against its done-when
- [ ] All checkpoints run, build and tests green at each gate
- [ ] Any deviation reported before continuing
- [ ] Progress tracked in the plan file
- [ ] Final full verification pass: tests, diff vs plan, no unplanned additions

## Cross-References

- The plan comes from: **REQUIRED SUB-SKILL:** praxis:implementation-blueprint
- Writing tests while implementing: **REQUIRED SUB-SKILL:** praxis:test-first-cycle
- When a test fails mysteriously: **REQUIRED SUB-SKILL:** praxis:fault-isolation
- Claiming the work is done: **REQUIRED SUB-SKILL:** praxis:completion-proof

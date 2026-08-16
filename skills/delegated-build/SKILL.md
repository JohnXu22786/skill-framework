---
name: delegated-build
description: "Use when a plan will be executed by subagents rather than yourself — hand each unit to a delegated worker with a precise spec, then review the result in two passes: spec compliance first, code quality second."
metadata:
  version: "1.0"
  group: collaboration
---
# Delegated Build

## Core Principle

Delegation moves the work, not the thinking. The delegator decides what, why, and how good; the delegate executes within the spec. Quality is enforced by review, and review happens in two passes so that style problems never hide contract violations.

## When to Use

- A plan (praxis:implementation-blueprint) is ready and its tasks can be executed by separate agents.
- Long execution runs where you need checkpointed progress per unit.
- Your context budget or attention is the bottleneck, and the units are well specified.

Do **not** delegate design. If the task requires making decisions the spec does not cover, the spec is not ready — finish the spec (that is a planning task) before delegating.

## Steps

1. **Prepare the units.** Take the plan and split it into delegate-able units per praxis:task-splitting. Each unit spec must state: goal, constraints, owned files, tests to run, definition of done, and the explicit instruction to report back — not improvise — when an assumption fails.
2. **Dispatch one delegate per unit.** A delegate executes a unit exactly as specified. Give the delegate the spec, the workspace access it needs, and nothing ambiguous to interpret.
3. **Review pass one — spec compliance.** When a unit returns, check only one thing first: does the result do what the spec asked, no more and no less? Check the behavior against the spec's done-when, run its tests. If compliance fails, return the unit with the specific gap; do not proceed to quality review of a unit that is not even the right work.
4. **Review pass two — code quality.** Once the unit is compliant, review it as you would any code: structure, naming, edge cases, test quality (see praxis:review-preflight's self-review pass). Quality issues are fixable by the delegate in a second round, or by you if trivial — but keep the two passes separate so a beautiful wrong solution is never approved for its beauty.
5. **Iterate on failed units.** Each rejection returns the unit with a precise, evidence-based gap statement. Expect two or three rounds on average; a unit that never converges is a spec problem — stop, rewrite the spec, and re-dispatch rather than grinding.
6. **Integrate.** Assemble the approved units yourself (or with one integration owner): run the whole suite, resolve seam issues, and verify the integrated result per praxis:completion-proof.

## Two-Pass Review Rule

- Pass one asks: **is it the right thing?** — spec compliance only. No style comments, no refactoring suggestions, no nitpicks. Passing this pass means the unit is the agreed work.
- Pass two asks: **is it good?** — quality only. A unit in pass two is already correct; improvements here are polish, and polish should never block the merge of correct work unless it affects maintenance.

## Rules

- **The delegate never designs.** If the delegate proposes a different approach, that is a report back to you, not an authorization to build it.
- **Rejections are diffs, not feelings.** Every rejection names the gap between spec and result. "This doesn't work" is not actionable; "the done-when requires X, and the unit returns Y" is.
- **Trust but verify.** Delegates are not adversaries, and they are also not the reviewer. Every unit gets both passes regardless of who the delegate is.
- **Keep the loop small.** Prefer many small units to few large ones: small units fail cheaply and converge faster.

## Checklist

- [ ] Unit specs complete: goal, constraints, files, tests, done-when, report-back rule
- [ ] One delegate per unit; spec handed over verbatim
- [ ] Pass one: spec compliance checked with evidence, before any quality talk
- [ ] Pass two: quality review only after compliance
- [ ] Failed units returned with precise gap statements
- [ ] Integration done by one owner, whole suite run
- [ ] Final result verified per completion-proof

## Cross-References

- Splitting the plan into units: **REQUIRED SUB-SKILL:** praxis:task-splitting
- The plan being executed: **REQUIRED SUB-SKILL:** praxis:implementation-blueprint
- The quality lens of pass two: **REQUIRED SUB-SKILL:** praxis:review-preflight
- Proving the integrated result: **REQUIRED SUB-SKILL:** praxis:completion-proof

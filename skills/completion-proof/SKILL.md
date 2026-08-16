---
name: completion-proof
description: Use before reporting any work as done — define done as observable evidence, run the tests and the original scenario, check edges and neighbors, and report what was verified.
metadata:
  version: "1.0"
  group: debugging
---
# Completion Proof

## Core Principle

"Done" is a claim, and claims need evidence. A task is complete when you can point at the verification, not when you feel good about the code.

## When to Use

- Before telling a user, a reviewer, or another agent that work is finished.
- After a bug fix, a feature implementation, or a refactor — especially when the fix was small and the "it obviously works" feeling is strongest.
- Before requesting a review (the review will check these anyway — pass it yourself first).

## Steps

1. **State what "done" means for this work.** Usually: the behavior the user asked for, working under the conditions they specified, without breaking what already worked. Write it down in one or two sentences.
2. **Run the relevant tests.** The full suite for the area — not just the one new test. The new test proves the behavior was added; the surrounding suite proves nothing was broken.
3. **Re-run the original scenario.** Whatever triggered the work — the bug repro, the user's example, the acceptance example — run it end to end. Tests and reality can disagree; the original scenario is the tiebreaker.
4. **Check the edges.** Empty input, missing data, error paths, the largest plausible input, concurrent access if relevant. Edge cases are where "it works" becomes "it works, actually".
5. **Check the neighbors.** Read the callers and dependents of the changed code: do the new assumptions hold for them? If the change altered behavior at a boundary (return values, exceptions, schema), verify the other side of the boundary.
6. **Review your own diff.** Read the change as a reviewer: does every line serve the stated goal? Is there dead code, debug output, or an unplanned change? If you would flag it as a reviewer, fix it now.
7. **Report the evidence.** In the final message, list: what was changed, what was run (commands), what passed, and what was deliberately not verified and why. A "done" message without commands is a rumor.

## Rules

- **No verification, no completion.** If you cannot run the tests (missing environment, no suite), say so explicitly instead of claiming done — the user can then decide.
- **The suite is not the goal.** A green suite plus a broken original scenario means the suite is wrong, not the work. Always re-run the human-facing scenario.
- **Fixes are changes too.** When you fixed a failing test by changing code, run the full area again — the fix may have moved the failure.
- **Scope honesty.** If you did something the task did not ask for, or skipped something it did, say both. The user's review starts from your report; an inaccurate report is a second bug.

## Checklist

- [ ] "Done" defined in observable terms
- [ ] Relevant test suite run and green
- [ ] Original scenario re-run end to end
- [ ] Edge cases exercised: empty, error, boundary
- [ ] Neighbors of the change checked
- [ ] Own diff reviewed as a reviewer would
- [ ] Report includes commands run and anything not verified

## Cross-References

- Writing the tests the proof depends on: **REQUIRED SUB-SKILL:** praxis:test-first-cycle
- When verification surfaces a new failure: **REQUIRED SUB-SKILL:** praxis:fault-isolation
- Asking a human to check your work: **REQUIRED SUB-SKILL:** praxis:review-preflight

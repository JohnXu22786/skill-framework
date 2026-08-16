---
name: review-preflight
description: Use before asking anyone to review your code — do the self-review pass, make the build and tests pass, and write the review request with context and focus points.
metadata:
  version: "1.0"
  group: review
---
# Review Preflight

## Core Principle

A review request is a professional request: the reviewer's time is spent best on design and correctness, not on catching what you could have caught yourself. Your diff should arrive review-ready.

## When to Use

- Before opening a pull request or asking a colleague, another agent, or the user to review your changes.
- Before merging anything that took real work — the self-review pass is the cheapest review that will ever happen.

## Steps

1. **Run the checks.** Build, tests, and any project lint/format gates. A review request that fails its own checks wastes the first review cycle on noise.
2. **Read your own diff, top to bottom.** Read it as if someone else wrote it: 
   - Does each change have a reason traceable to the task?
   - Would the names and structure make sense without your memory of the work?
   - Any dead code, debug output, commented-out lines, or accidental whitespace churn?
   - Any unrelated change smuggled in? Cut it, or split it out.
3. **Check the edges you would review for.** Error paths, empty inputs, concurrency, resource cleanup. The reviewer will look there; find the holes first.
4. **Re-check the tests.** Do they test behavior, not implementation? Is there a test for the fix/feature itself? Would the suite catch the bug you just fixed if someone reverted the fix?
5. **Write the review request.** Keep it short and specific:
   - What changed, and why (the goal, not the history).
   - What was verified, with commands.
   - What you want the reviewer to focus on — the risky decisions, the design choices, the places you are unsure about.
   - What is out of scope or known-limitations.
6. **Send it with the diff.** Reviewers judge the diff plus context; providing context is your job, not their archaeology.

## What to Ask For

Ask for the review you need, not a generic "please review":
- "Check the error-handling path in X" — targeted.
- "Is this interface the right seam?" — design.
- "Look for anything I missed" — open, but only after steps 1–4.

## Checklist

- [ ] Build, tests, and lint pass locally
- [ ] Own diff read as a stranger's, line by line
- [ ] No dead code, debug output, or unrelated changes
- [ ] Edge cases self-checked: errors, empty, cleanup
- [ ] Tests would catch a revert of this change
- [ ] Review request written: goal, verification, focus points

## Cross-References

- Proof the work is done before sending: **REQUIRED SUB-SKILL:** praxis:completion-proof
- Handling the answers: **REQUIRED SUB-SKILL:** praxis:feedback-assimilation
- The branch finishing flow: **REQUIRED SUB-SKILL:** praxis:branch-conclusion

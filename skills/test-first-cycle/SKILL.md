---
name: test-first-cycle
description: Use when writing or changing code that has any testable behavior — write the failing test first, implement the minimum to make it pass, then refactor under a green suite.
metadata:
  version: "1.0"
  group: testing
---
# Test-First Cycle

## Core Principle

Test first, code second, refactor third: a failing test is the only honest specification of the next behavior, and the green suite is the only safe floor to refactor on.

## When to Use

- Implementing any new behavior: a function, an endpoint, a parser, a transformation, an error path.
- Fixing a bug — the failing test that reproduces it comes first, then the fix.
- Refactoring: the existing tests are the safety net; if they are missing, add them before restructuring.

Do **not** force this on pure plumbing — wiring, renaming, and mechanical moves where the tests would only re-assert what the file already shows. Use judgment; when unsure, prefer the cycle.

## The Cycle

### RED — Write a failing test

1. Pick the smallest next behavior from the plan.
2. Write one test that asserts that behavior with concrete input and a specific expected output. Name the test for the behavior, not the mechanism.
3. Run it. The test must fail for the **right reason** — an assertion about missing behavior, not a syntax error, not a timeout, not an unrelated failure. If it fails for the wrong reason, fix the test first.

### GREEN — Make it pass with the minimum code

4. Write the smallest implementation that turns the test green. No extra cases, no speculative generality, no "while I'm here" fixes.
5. Run the test again; then run the test suite around it to confirm nothing else broke.

### REFACTOR — Improve under green

6. Now, and only now, clean up: rename, extract, simplify. The suite stays green after every step; run it after each refactor move, not at the end of a long chain.
7. Repeat from step 1 until the behavior is complete.

## Anti-Patterns

- **Testing the implementation, not the behavior.** Assert on outputs and observable state; asserting on internal calls makes tests break whenever the code is improved.
- **No-assertion tests.** A test that runs code and checks nothing will go green forever and catch nothing.
- **Brittle coupling.** Tests that depend on unrelated details (order, timing, exact strings of error messages) fail for the wrong reasons and get deleted out of frustration.
- **Over-fitting the test.** The implementation passes the test but does not actually work — e.g. hardcoded returns. If you cannot think of a second input that would fail, the test is too narrow; add the edge case (empty input, error path, boundary).
- **Green-washing.** Deleting, disabling, or weakening a failing test to make the suite pass is never acceptable.

## References

- A catalog of common test mistakes and how to spot each: see `references/testing-anti-patterns.md` in this skill's directory.
- When a green test hides a real bug: **REQUIRED SUB-SKILL:** praxis:fault-isolation

## Checklist

- [ ] Test written first and seen to fail for the right reason
- [ ] Minimal implementation written to reach green
- [ ] Refactor done only under a green suite, verified step by step
- [ ] Edge cases covered: empty input, error path, boundaries
- [ ] No tests deleted, disabled, or weakened to pass

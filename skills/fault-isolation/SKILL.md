---
name: fault-isolation
description: Use when something misbehaves — a bug report, a failing test, an error, a crash, flaky behavior — to find the root cause through evidence instead of guessing, then fix it and verify.
metadata:
  version: "1.0"
  group: debugging
---
# Fault Isolation

## Core Principle

A bug is a discrepancy between intent and behavior. You find it by reproducing it reliably, tracing the discrepancy to a single cause with evidence, and fixing that cause — not by guessing at the most convenient explanation.

## When to Use

- Any unexpected behavior: wrong output, crash, failing test, error message, performance regression.
- Before "fixing" anything by adding checks, retries, or workarounds — a workaround without a root cause is a debt with interest.
- Flaky or timing-dependent failures, where the first repro attempt often "doesn't reproduce".

## Steps

### 1. Reproduce

- Get the failure to happen on demand before touching anything. Capture: exact command or input, environment, and the full error output.
- If it is intermittent, run the trigger repeatedly to measure the failure rate; a rate is data, "sometimes" is not.
- If you cannot reproduce, say so — you are not debugging yet, you are collecting.

### 2. Investigate

- Read the error message as evidence, not as a description: what does it actually claim, and where in the code does that claim get made?
- Follow the data flow from input to output, reading the code along the path. Identify where the observed value first diverges from the expected value.
- Form hypotheses ranked by evidence, then test the strongest one with the cheapest decisive experiment: a log line, a breakpoint, a reduced input, a variant of the code.

### 3. Isolate the root cause

- Prove the cause before fixing it: change one thing, observe the effect, revert. A hypothesis is confirmed only when the experiment distinguishes it from its rivals.
- Keep changing one variable at a time. Changing three things and getting a different result tells you nothing.
- Distinguish root cause from trigger: the root cause is the condition that, left alone, will reproduce the failure; the trigger is just the input that exposed it.
- When the failure is timing-related, look for condition-based assumptions: code that assumes an event happened, a resource is ready, or an order was preserved. Find the condition that is not guaranteed, not just the spot that crashed.

### 4. Fix and verify

- Write the regression test first: it reproduces the original failure, and it **must fail before your fix** and pass after. If you cannot write a test that fails, you have not isolated the cause yet.
- Apply the smallest fix that addresses the root cause. Do not bolt on extra guards the evidence does not support.
- Re-run the original failing scenario end to end, plus the tests around the changed code.
- Consider defense in depth: if the root cause is "caller can pass an invalid state", the fix at the source may be enough; decide consciously whether a second check at the boundary is warranted, and do not add it out of habit.

### 5. Record

- Note the root cause, the evidence trail, and the fix in the change description. "Fixed it" is not a record; "the sort comparator returned inconsistent results for equal keys, proven by reducing input to two identical rows" is.

## Rules

- **One experiment at a time.** Every simultaneous change poisons the evidence.
- **No fix by resemblance.** "This looks like a bug I saw once" is a hypothesis, not a diagnosis — test it like one.
- **No shotgun debugging.** Adding prints everywhere is not investigation; each probe should target the strongest hypothesis.
- **Resist the tempting fix.** The fix that addresses the symptom (retry, timeout bump, extra validation) and the fix that addresses the cause often look similar in the diff. Only the cause-fix survives contact with the real world.

## Checklist

- [ ] Failure reproduced reliably, with captured command, input, and output
- [ ] Data flow traced from input to first divergence
- [ ] Root cause proven by an experiment, not assumed
- [ ] Smallest cause-level fix applied
- [ ] Regression test added; fails before fix, passes after
- [ ] Original scenario re-run; surrounding tests green
- [ ] Root cause and evidence recorded in the change description

## Cross-References

- The regression test uses: **REQUIRED SUB-SKILL:** praxis:test-first-cycle
- Proving the fix actually held: **REQUIRED SUB-SKILL:** praxis:completion-proof
- When debugging stalls, dispatching independent investigation units in parallel (see praxis:task-splitting) can narrow the search faster than one agent chasing hypotheses serially.

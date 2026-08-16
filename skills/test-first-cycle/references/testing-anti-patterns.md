# Testing Anti-Patterns

This reference catalogs the ways tests go wrong. When a test feels useless, annoying, or scary, find the pattern here — the fix is usually to test the behavior more directly, not to delete the test.

## The Assertion that Asserts Nothing

**Symptoms:** the test runs, passes, and would pass even if you deleted the code under test. Common forms: a `try` block that swallows the failure, a callback never awaited, an assertion on a variable that was never populated.

**Fix:** run the test against a deliberately broken implementation once — if it still passes, the test is not testing anything. Add a concrete assertion on the actual output.

## Testing Implementation Details

**Symptoms:** the test breaks every time the code is refactored, even though the behavior is unchanged. Signs: assertions on private state, on the order of internal calls, on which helper was invoked, on exact error message strings.

**Fix:** assert on the observable contract — inputs in, outputs and effects out. If a behavior is only observable through internals, that is a design problem worth fixing, not a test problem.

## The Brittle Fixture

**Symptoms:** the test passes on one machine and fails on another, or fails intermittently. Signs: absolute paths, current-time dependence, locale-dependent formatting, network access, relying on global state that other tests mutate, unordered collection comparisons.

**Fix:** make the fixture deterministic — relative paths, injected clocks, sorted comparisons, isolated state per test.

## Golden-Lock

**Symptoms:** a snapshot-style assertion that everyone updates by running the update command and then approves whatever it produced. The test becomes a change log, not a guard.

**Fix:** keep snapshots only for outputs that are large and structured (serialization, rendering). For everything else, assert the few properties that actually matter.

## The Test That Needs the Implementation to Be Wrong

**Symptoms:** the test passes only because the implementation coincidentally aligns with the test's assumptions, and you cannot name a second input that would fail.

**Fix:** add boundary tests: empty input, maximum input, malformed input, the error path. A test suite that only covers the happy path is a report of intent, not a guard.

## The Flaky Gate

**Symptoms:** the suite fails at random: races, timeouts, ordering dependencies, port conflicts. The team reacts by re-running until green.

**Fix:** reproduce with the failing conditions (repeat runs, `--repeat`, stress), then fix the root cause — usually missing synchronization or shared mutable state. Re-running is not a fix; the test runner is not a slot machine.

## Suite Slow-Down

**Symptoms:** the suite takes so long that nobody runs it, or it runs only in CI. The suite's coverage decays because feedback comes hours after the change.

**Fix:** keep the fast path fast: unit tests with no I/O first, integration tests behind tags, and measure. A suite nobody runs is a suite nobody trusts.

## The Vanishing Test

**Symptoms:** a test that covered a bug gets deleted during refactoring because it "looked redundant", and the bug silently returns.

**Fix:** before deleting a test, answer: what regression does it prevent? If the answer is "nothing anymore, because the behavior is gone", delete it and say so in the change description. Otherwise keep it.

## The Fixed Test

**Symptoms:** a test that failed, and someone "fixed" it by loosening the assertion or adding a special case in the test itself.

**Fix:** never weaken an assertion to make a test pass. If the assertion was wrong, that is a code change in the test — review it like any other change. If the assertion was right, the implementation is wrong: fix the implementation.

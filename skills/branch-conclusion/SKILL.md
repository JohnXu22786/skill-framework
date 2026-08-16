---
name: branch-conclusion
description: Use when a development branch is finished and it is time to merge it — run the pre-merge checks, choose the merge style, write the summary, merge, and verify the trunk afterward.
metadata:
  version: "1.0"
  group: delivery
---
# Branch Conclusion

## Core Principle

Finishing a branch is a ceremony with a purpose: the checks make sure the merge cannot break the trunk, and the summary makes sure the history explains itself. Do the ceremony in order; the order is the point.

## When to Use

- A branch has passed its review and is ready to merge.
- A lane's work is complete and its branch is being joined back (see praxis:lane-isolation).
- After merging, to verify the trunk still stands and clean up.

## Steps

### Before merging

1. **Run the full pre-merge checks.** On the branch, from a clean checkout: build, complete test suite, and the project's lint/format gates. Same checks the trunk would run on the merged result.
2. **Update the branch against the trunk.** Bring the latest trunk into the branch (rebase preferred when the project favors linear history; merge the trunk when it does not). Re-run the checks after updating — the merge target changed, so the verification changed.
3. **Read the final diff.** Branch vs trunk: does it contain exactly the agreed work, nothing else? Review the summary of the changes, not just the files.
4. **Write the summary.** A short document: what changed, why, how it was verified (commands), and any follow-ups deferred. The summary is the history's memory; vague summaries are the most common cause of "who wrote this and why" archaeology.

### Choosing the merge style

- **Squash merge** when the branch is a single logical change and its internal commit noise has no value — the common default for one-feature branches.
- **Rebase merge (linear history)** when the project keeps a strictly linear trunk and the branch's commits each stand on their own.
- **Merge commit** when the branch's history is meaningful (long-lived branch, multi-author work) or the project convention requires it.

Match the project's convention. A project with a documented style is not the place to express your preference.

### Merging

5. **Merge.** The branch is merged onto the trunk through the project's normal mechanism — pull request, merge button, or direct merge — per the project's rules.
6. **Verify the trunk.** After the merge: confirm the trunk build and tests pass on the merged state. A merge that fails its own post-checks is a problem caught early only if you look.
7. **Clean up.** Delete the merged branch and its lane workspace (see praxis:lane-isolation). If a follow-up was deferred in the summary, create the issue or task now, not "later".
8. **Report.** Tell the stakeholders: what merged, the verification evidence, and what comes next. One line each is enough.

## Rules

- **No merging broken.** The branch merges only when its checks pass on the updated branch. "CI will catch it" is how trunks break.
- **No summary, no merge.** If you cannot write the summary in two minutes, you do not understand what the branch does — resolve that before merging, not after.
- **Never force the trunk.** A failed merge is reverted or fixed, never papered over with a forced update.

## Checklist

- [ ] Pre-merge checks run from a clean checkout: build, tests, lint
- [ ] Branch updated against the trunk; checks re-run after
- [ ] Final diff reviewed against the agreed scope
- [ ] Summary written: what, why, how verified, follow-ups
- [ ] Merge style matches project convention
- [ ] Trunk verified after the merge
- [ ] Branch and lane cleaned up; deferred follow-ups tracked
- [ ] Stakeholders told what merged, with the verification evidence

## Cross-References

- The review that precedes the merge: **REQUIRED SUB-SKILL:** praxis:review-preflight
- Answering review comments before merging: **REQUIRED SUB-SKILL:** praxis:feedback-assimilation
- Parallel branches being concluded: **REQUIRED SUB-SKILL:** praxis:lane-isolation

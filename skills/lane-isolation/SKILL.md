---
name: lane-isolation
description: Use when several pieces of work must proceed in parallel on the same repository — run each in its own isolated working tree so branches do not interfere, and keep the lanes synchronized with the trunk.
metadata:
  version: "1.0"
  group: delivery
---
# Lane Isolation

## Core Principle

Parallel development needs parallel workspaces. An isolated working tree per branch gives each line of work its own checkout — no stashing, no checkout ping-pong, no half-finished trees colliding — while the repository history stays a normal branch set.

## When to Use

- Two or more changes are in flight on the same repository and you need to switch between them, or you want each in a clean checkout.
- A long-running branch needs to keep building and testing while other work happens on the trunk.
- Reviewing someone else's branch without disturbing your own working tree.

Do **not** use this for small changes that will merge within minutes — the setup cost outweighs the isolation. Do not use it when the branches are not actually independent; the isolation will not fix the coupling, it will just hide it until merge.

## Steps

1. **Create one lane per in-flight branch.** Each lane is a new working directory bound to its branch, created from the current repository. Name lanes after the work, not after yourself.
2. **Treat lanes as disposable.** The lane is a workspace, not a record: the branch is the record. If a lane's state is corrupt or confusing, recreate it from the branch instead of repairing it in place.
3. **Keep each lane's branch in sync with the trunk.** Regularly bring the trunk's latest commits into the lane branch (rebase onto the trunk, or merge the trunk into it). The longer a lane drifts, the more painful the eventual join — sync on a schedule, not on merge day.
4. **Verify in the lane.** Build and run tests inside the lane's own checkout before merging from it. A lane that was never tested there was never tested.
5. **Merge through the normal flow.** When a lane's work is done, merge its branch the way you would merge any branch (see praxis:branch-conclusion) — the lane directory itself is deleted afterward, never merged.
6. **Remove finished lanes.** After a merge, delete the lane directory and its branch. Unused lanes accumulate like unlabeled boxes in a garage; a lane with no branch is a workspace with no purpose.

## Rules

- **One lane, one branch.** Do not run multiple branches in one lane by switching; that is what lanes exist to avoid.
- **Never hand-edit across lanes.** A change belongs in exactly one lane. If work must span branches, that is a seam problem (see praxis:task-splitting), not a lane problem.
- **The trunk is the source of truth.** Lanes diverge by design, but every divergence must be a mergeable, rebaseable diff against the trunk — never a private divergence that cannot rejoin it.
- **Symmetry with the plan.** If the plan says the work splits into independent units (praxis:task-splitting), each unit is a natural lane.

## Checklist

- [ ] One lane per in-flight branch, named after the work
- [ ] Lanes recreated from branches when state goes bad, not repaired
- [ ] Each lane synced with trunk on a schedule
- [ ] Build and tests run inside each lane before merge
- [ ] Finished lanes removed with their branches

## Cross-References

- Splitting work into independent units: **REQUIRED SUB-SKILL:** praxis:task-splitting
- Finishing a lane's branch: **REQUIRED SUB-SKILL:** praxis:branch-conclusion
- Verifying before merging from a lane: **REQUIRED SUB-SKILL:** praxis:completion-proof

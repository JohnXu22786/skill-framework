---
name: method-compass
description: Use when starting any task or conversation to learn how the skill library works, which skill to open first, and the rules for chaining skills together before doing any work.
metadata:
  version: "1.0"
  group: meta
---
# Method Compass

## Core Principle

This library turns senior engineering routines into loadable skills: when a routine matches what you are about to do, open its skill and follow it exactly — do not improvise a process the library already encodes.

## When to Use

- At the start of any nontrivial task: build something new, fix a bug, refactor, review, plan, or hand work to another agent.
- Whenever you notice yourself "winging it" through a familiar workflow.
- Before writing any code, before editing any file, and before answering with a plan — the matching skill may change what you do.

Do **not** open this skill when you were dispatched as a subordinate agent with one explicit, already-specified task. Follow the task.

## How the Library Works

- Each skill is a markdown document with a `name` and a trigger-first `description`. The description tells you **when** to load the skill, not what it contains.
- Skills are discovered and loaded by the harness; when you decide a skill applies, load it and read it in full.
- Skills reference each other with explicit markers, e.g. `**REQUIRED SUB-SKILL:** praxis:design-conversation`. Treat a REQUIRED marker as mandatory: load that skill too before proceeding.

## Choosing a Skill

Match what you are about to do against the catalog:

| Situation | Skill |
| --- | --- |
| New feature, unclear design, "build me X" | praxis:design-conversation |
| Design agreed, need an execution plan | praxis:implementation-blueprint |
| Plan in hand, executing it | praxis:blueprint-execution |
| Writing code with tests | praxis:test-first-cycle |
| Something misbehaves | praxis:fault-isolation |
| About to claim "done" | praxis:completion-proof |
| Parallel work to split up | praxis:task-splitting |
| About to ask someone to review code | praxis:review-preflight |
| Someone reviewed your code | praxis:feedback-assimilation |
| Long-lived parallel branches | praxis:lane-isolation |
| Finishing a branch | praxis:branch-conclusion |
| Delegate tasks to subagents | praxis:delegated-build |
| Write a new skill | praxis:skill-authoring |

## Priority Rules

1. **Process skills first.** If both a process skill and an implementation skill apply, load the process skill first — it sets the approach, and the implementation follows it.
2. **One skill at a time.** Finish the current skill's process before loading the next; do not stack half-read skills.
3. **User instructions win.** Explicit human instructions override any skill. Skills define the default way of working; a direct user request is the exception.
4. **Loading is cheap, guessing is expensive.** If you think there is even a small chance a skill applies, open it before acting. If it turns out not to fit, you lose nothing — but never decide it does not fit before reading it.
5. **Say what you are doing.** Tell the user which skill you loaded and why, in one sentence. It makes your process inspectable, and it lets the user redirect you early if the match is wrong.

## Checklist

- [ ] I identified the routine that matches the upcoming work
- [ ] I loaded the matching skill (and any REQUIRED sub-skills) before acting
- [ ] I will follow the skill exactly, not approximately
- [ ] I will tell the user which skill I am using and why

## Cross-References

- Creating new skills: **REQUIRED SUB-SKILL:** praxis:skill-authoring
- Refining a vague request: **REQUIRED SUB-SKILL:** praxis:design-conversation

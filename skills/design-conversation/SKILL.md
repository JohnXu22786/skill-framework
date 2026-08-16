---
name: design-conversation
description: Use when asked to build or change something and the requirements are vague, multiple approaches exist, or nobody has agreed on the design yet — before planning or coding.
metadata:
  version: "1.0"
  group: planning
---
# Design Conversation

## Core Principle

A design is not ready until the questions that would change the implementation have been asked and answered. Talk the design to completion before a single line is written.

## When to Use

- The user says "build X", "add support for Y", "make it faster", or anything where the outcome is under-specified.
- You have several reasonable ways to solve a problem and no reason to prefer one.
- The user proposes a design; you see a simpler one.
- Before writing a plan, when the plan would be guesswork.

Do **not** use this for bug fixes with an obvious cause, trivial one-line changes, or tasks where the user already specified the design and just wants it executed.

## Steps

1. **Restate the goal in your own words.** One or two sentences: what outcome does the user want, for whom, and by when. Confirm the restatement before going further.
2. **Ask the questions whose answers would change the design.** Each question must have a reason — if the answer cannot change what you build, it is noise. Typical high-value questions:
   - Who uses this, and what is their worst-case scenario?
   - What constraints are hard (performance, budget, deadline, existing API, deployment target)?
   - What happens on failure — partial results, crashes, silent corruption?
   - What is explicitly out of scope?
3. **Propose two or three candidate approaches, not one.** Briefly: mechanism, cost, risk. Force the choice into the open instead of silently picking.
4. **Compare tradeoffs in a table.** Rows = approaches, columns = effort, risk, maintenance, fit with constraints. Ask the user to choose; if they say "you decide", decide and state the reasons.
5. **Write down the outcome.** Record: the agreed design, the rejected alternatives and why, the open questions deferred. This record is the input to the next skill.

## Rules of the Conversation

- Ask one question at a time, or a small grouped set — never a wall of questions.
- If a question embeds an assumption, say the assumption out loud: "I assume X — correct me if not."
- If the user proposes something with a simpler alternative, say so plainly with the tradeoff; do not silently build their way or yours.
- Stop when the design is concrete enough to plan: you can name the files, the interfaces, and the test cases. More discussion after that is gold-plating.

## Anti-Patterns

- **Jumping to code.** The first draft in your head is rarely the cheapest solution; the conversation exists to find the cheaper one.
- **Designing in the implementation.** Sketching the architecture while writing files means the user never saw the tradeoffs.
- **Analysis paralysis.** If the remaining questions only affect cosmetic details, converge — pick the least-risky option and note it.
- **Ignoring constraints.** A constraint the user stated is a requirement; argue only if it is technically impossible, then propose the closest feasible alternative.

## Checklist

- [ ] Goal restated and confirmed
- [ ] All questions that could change the design asked
- [ ] At least two approaches compared with explicit tradeoffs
- [ ] Decision made and recorded, including rejected alternatives
- [ ] Design concrete enough that planning needs no guesswork

## Cross-References

- Turning the agreed design into tasks: **REQUIRED SUB-SKILL:** praxis:implementation-blueprint
- Refining a vague bug report: **REQUIRED SUB-SKILL:** praxis:fault-isolation

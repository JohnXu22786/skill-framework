---
name: feedback-assimilation
description: Use when someone has reviewed your code or work and you must respond — understand each comment, fix or explain it, and answer point by point without ego or defensiveness.
metadata:
  version: "1.0"
  group: review
---
# Feedback Assimilation

## Core Principle

Review feedback is information about the work, not a verdict on you. The goal is to extract every useful fact from the comments — whether you accept or reject each one is a technical decision, made calmly and point by point.

## When to Use

- A review comment thread, a review document, or a user's critique of work you produced.
- After a rejected pull request or a failing acceptance round.

## Steps

1. **Read everything before reacting.** Read the full review once, without drafting replies. Emotional first drafts are written to win, not to fix.
2. **Classify each comment:**
   - **Correct** — the comment identifies a real problem. Fix it.
   - **Ambiguous** — you do not understand the concern. Ask a specific question about it; do not guess at the meaning of a comment you might fix wrongly.
   - **Debatable** — a tradeoff call. Respond with the tradeoff and your reasoning; change your mind when the reasoning is better than yours.
   - **Mistaken** — the comment misreads the code or the requirement. Explain the misunderstanding briefly and factually, with evidence. No apology needed, no lecture either.
3. **Verify before promising.** For every accepted comment, confirm you actually understand the fix before saying "will do". A fix that misses the comment's intent costs another round trip.
4. **Fix, then verify each.** Implement the accepted changes, run the tests, and confirm the original concern is gone. A comment marked "fixed" must be provably fixed.
5. **Reply point by point.** Structure the response as one entry per comment: what was asked, what you did (with evidence: command output, diff excerpt), or why you did not. One clear list beats a paragraph of prose.
6. **Thank the reviewer, specifically.** "Good catch on X" is not flattery; it is accurate bookkeeping — it also tells future reviewers their effort lands.
7. **Extract the pattern.** If the same class of comment recurs across reviews (missed edge cases, unclear naming), that is feedback about your process. Note it and adjust the process — e.g. add the check to praxis:review-preflight.

## Rules

- **No silent acceptance, no silent rejection.** Every comment gets an answer; "addressed" or "disagree, because" — both are answers.
- **Do not argue in the comments.** If a disagreement grows past two exchanges, move it to a direct conversation and settle it there, then post the outcome.
- **Push back only with evidence.** Disagreeing is allowed and sometimes necessary; disagreeing without evidence is noise.
- **Never take it personally, never make it personal.** The code is the subject; comments about the code are about the code.

## Checklist

- [ ] Full review read before replying
- [ ] Every comment classified and answered point by point
- [ ] Accepted fixes implemented and verified (tests run, concern gone)
- [ ] Ambiguities asked about, not guessed
- [ ] Disagreements stated with evidence
- [ ] Specific thanks given
- [ ] Recurring comment class noted, and the process adjusted to prevent it

## Cross-References

- Preparing work that needs fewer comments next time: **REQUIRED SUB-SKILL:** praxis:review-preflight
- The fix may need a test first: **REQUIRED SUB-SKILL:** praxis:test-first-cycle
- Finishing after the review round: **REQUIRED SUB-SKILL:** praxis:branch-conclusion

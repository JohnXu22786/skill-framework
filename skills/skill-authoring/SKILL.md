---
name: skill-authoring
description: Use when creating a new skill, editing an existing one, or checking that a skill will actually fire when its trigger situation occurs — before publishing or distributing it.
metadata:
  version: "1.0"
  group: meta
---
# Skill Authoring

## Core Principle

A skill is a procedure with a trigger. Its whole value lives in two places: the description, which decides whether the skill is ever loaded, and the body, which decides whether loading it was worth it. Write both deliberately.

## When to Use

- You catch yourself following the same multi-step routine for the third time.
- A procedure exists in prose (a doc, a runbook, a README) but nobody's agent reliably follows it.
- An existing skill misfires (loaded for the wrong situations) or under-fires (never loaded when it should be).

Do **not** write a skill for a one-off task, for content that is really just reference material without a procedure, or to wrap a single command — the skill is the process, not the command.

## Anatomy of a Skill

```
skill-name/
  SKILL.md          # frontmatter + procedure (required)
  references/       # heavy reference material, loaded on demand
  scripts/          # executable helpers
  assets/           # templates and other resources
```

The frontmatter carries the metadata:

```yaml
---
name: skill-name
description: Use when ... — triggers only, no process summary.
metadata:
  version: "1.0"
  group: <category>
---
```

`metadata.version` and `metadata.group` are library conventions: version tracks the skill's own revision, and group places it in the catalog's category table (planning, testing, debugging, collaboration, review, delivery, meta).

## Writing the Description (the trigger)

- Start with "Use when" (or "Use before"/"Use after"/"Use to" when timing is the trigger) and describe the **situation** that should load the skill: symptoms, contexts, keywords. This is the only text the agent sees before deciding to load.
- Where a meaningful negative exists, say when the skill does NOT apply ("do not use for X") — a negative clause doubles the precision of the trigger. If the skill applies broadly, do not invent an exclusion.
- **Never** summarize the process in the description. "Describes how to run the deployment" is a summary; "Use when a deployment fails mid-flight and the rollback decision must be made" is a trigger.
- Name the skill by its behavior, not its domain: a verb-and-object name ("fault-isolation") beats a topic name ("debugging").

## Writing the Body (the procedure)

- Lead with the **core principle** in one sentence — the rule that explains why the steps exist. Agents follow steps better when the reasoning is visible.
- Use numbered steps with a single action per step. Each step must be executable: "Run X and observe Y" beats "be careful about X".
- End with a **checklist** that compresses the whole procedure into verifiable items.
- Include one excellent example, not several mediocre ones.
- Keep the body scannable: headings, short paragraphs, tables for choices. An agent mid-task reads structure, not prose.
- Move heavy reference material (APIs, formats, catalogs) into `references/` files and link them from the body — the skill body should load fast and the reference loads only when needed.

## Rules

- **Describe triggers with symptoms, not tools.** "Use when behavior is inconsistent across runs" fires correctly for every technology; "use when setTimeout misbehaves" fires only for one symptom of the same class.
- **Cross-reference with markers.** When the body needs another skill, write `**REQUIRED SUB-SKILL:** praxis:design-conversation` — explicit and mandatory-looking markers beat bare mentions.
- **Frontmatter hygiene.** `name` must be lowercase kebab-case and match its directory; `description` must be under 1024 characters. Both fields are required.
- **No process in the description, no philosophy in the steps.** Steps act; the core principle explains; nothing else earns its tokens.

## Testing a Skill

A skill is code; test it like code:

1. **Fire test:** read the description cold. Does it clearly match the situations that should load it? Would a keyword search for its topic find it?
2. **Baseline:** run the target scenario without the skill. Confirm the failure you are fixing actually happens.
3. **Compliance:** run the scenario with the skill loaded. Confirm the agent follows the procedure, not just the goal.
4. **Edge probes:** vary the trigger situation — slightly different wording, different tooling, adjacent problems. Does the skill still fire when it should, and stay quiet when it should not?
5. **Refactor loop:** tighten the description and steps against whatever the probes reveal, then re-run. Skills drift; the probes are the drift detector.

## Checklist

- [ ] Name is kebab-case and matches the directory
- [ ] Description starts with "Use when" (or a timing variant such as "Use before"), lists triggers (and exclusions where they exist), is under 1024 characters
- [ ] Description describes when to use, never the process
- [ ] Body has a core principle, executable steps, and a final checklist
- [ ] Frontmatter carries metadata.version and metadata.group
- [ ] Heavy reference material moved to references/
- [ ] Fire test and baseline scenario run; compliance verified
- [ ] Edge probes run; trigger precision confirmed

## Cross-References

- Where new skills live and how they load: **REQUIRED SUB-SKILL:** praxis:method-compass
- The testing discipline for skill behavior: **REQUIRED SUB-SKILL:** praxis:test-first-cycle

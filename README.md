[简体中文](README.zh.md)

# dsh-praxis

**Praxis** is an engineering-methodology skill library plugin for DeepSeek Harness (dsh): it hardens senior engineer workflows (design conversations, writing plans, executing plans, test-first, system debugging, completion verification, parallel division of labor, code review, branch conclusion, etc.) into a set of `SKILL.md` skills conforming to the Agent Skills open standard, wired into dsh's skill system as a self-contained plugin.

- Plugin form: dsh bundle (`dsh.bundle` declaration in `package.json` + `cordis.patch.yml` patch line)
- Capability interface: Cordis plugin → `ctx.skills` skill provider → the platform's built-in `dsh-tool-skill` consumer → model-visible skill catalog and `skill` loading tool
- Skill format: Agent Skills standard (`SKILL.md` + YAML frontmatter), fully compatible with dsh's local skill discoverer (`dsh-skill-filesystem`)

## Skills

| Skill | Trigger scenario | Group |
| --- | --- | --- |
| `method-compass` | Starting any task: understand the skill library, pick the first skill | meta |
| `design-conversation` | Requirements are vague, multiple options, design undecided—converse before coding | planning |
| `implementation-blueprint` | Design is settled, write an executable step-by-step plan | planning |
| `blueprint-execution` | Execute the plan: sequential steps, checkpoint validation, deviation reporting | planning |
| `test-first-cycle` | Writing any code with testable behavior: red, green, then refactor | testing |
| `fault-isolation` | Any abnormal behavior: find the root cause with evidence, not guesses | debugging |
| `completion-proof` | Before claiming "done": prove it with observable evidence | debugging |
| `task-splitting` | Parallel division of labor: split by contract, dispatch, integrate | collaboration |
| `delegated-build` | Hand a plan to a sub-agent: two rounds of review gatekeeping | collaboration |
| `review-preflight` | Before requesting review: self-check, self-test, write a good review request | review |
| `feedback-assimilation` | After receiving review feedback: digest, fix, and respond item by item | review |
| `lane-isolation` | Parallel development in the same repo: each branch has an independent working area | delivery |
| `branch-conclusion` | Full wrap-up flow before a branch completes and merges into the trunk | delivery |
| `skill-authoring` | Writing, modifying, or validating new skills | meta |

## Environment requirements

- DeepSeek Harness `dsh` ≥ 0.1.0-rc.6 (the skill capability family is enabled in the standard profile, i.e., `dsh-skill` and `dsh-tool-skill` are mounted)
- Node.js ≥ 22 (required by dsh itself; this plugin runs as pure ESM JavaScript at runtime)

## Installation

### Installing in DSH

```sh
dsh plugin --profile demo add github:JohnXu22786/skill-framework
```

### Option A: Install from a local package (recommended)

```sh
# 1. Install dependencies and build in the plugin directory
npm install
npm run build

# 2. Pack (output includes lib/, skills/, cordis.patch.yml)
npm pack

# 3. Install into a dsh profile
dsh plugin --profile web add ./dsh-praxis-0.1.0.tgz
```

### Option B: Install from a local directory (development)

```sh
dsh plugin --profile web add /absolute/path/to/dsh-praxis
```

When installing from a directory, the profile must authorize local builds per the dsh docs.

### Option C: Development mode (source mounted directly, with a Harness source environment)

```sh
# 1. In examples/dev.patch.yml, set the value of name to the absolute path of this plugin's src/index.ts
# 2. Start (defaults to the web profile; `dsh --profile <name>` selects another profile)
dsh web --patch ./examples/dev.patch.yml
```

### Option D: Zero-code integration (without this plugin's loader)

The `skills/` directory in this repo is itself a standard Agent Skills collection; it can be dropped directly into one of dsh's local skill root directories:

```sh
# User level (applies to all projects)
cp -r skills/* ~/.dsh/skills/

# Or project level
mkdir -p .dsh/skills && cp -r skills/* .dsh/skills/
```

This path is loaded by dsh's built-in `dsh-skill-filesystem` discoverer; no need to install this plugin. The skill content is identical across both integration approaches.

## Usage

No manual configuration is needed after installation: when the model encounters a trigger scenario from the skill catalog during a session, it loads the matching skill automatically. You can also specify directly in conversation, for example:

> First give me an implementation plan (implementation-blueprint), then execute it (blueprint-execution).

When troubleshooting, the model prioritizes the `fault-isolation` workflow; before claiming completion, it provides verification evidence per `completion-proof`. Skills explicitly mark dependencies between each other via `**REQUIRED SUB-SKILL:** praxis:xxx`.

## Integration notes: how the plugin is loaded by dsh

```
dsh startup
 └─ profile composes the plugin tree by layer
     └─ bundle layer: reads dsh.bundle.patch in package.json → cordis.patch.yml
         └─ patch inserts a plugin config line:
              - id: praxis
                name: dsh-praxis          # resolved by npm package name → main → lib/index.js
             └─ dsh loads the module's named exports { name, inject, apply }
                 └─ apply(ctx) calls ctx.skills.registerProvider(...)
                     └─ PraxisSkillProvider registered in the skill registry (rank 600, source: bundled)
                         └─ dsh-tool-skill consumer generates the skill catalog and skill loading tool
                             └─ model-visible: catalog entries (name + description) + skill body
```

Key points:

1. **manifest**: the `"dsh": { "bundle": { "patch": "./cordis.patch.yml" } }` field in `package.json` declares this package as a bundle; `dsh plugin --profile <name> add <package>` activates it through that.
2. **entry file**: `lib/index.js` (build output, pointed to by `main`) exports the three Cordis plugin elements—`name` (line id: `praxis`), `inject` (service dependencies: `['skills']`), and `apply(ctx, config)` (registers the provider). Source entry is `src/index.ts`.
3. **skill interface**: the provider implements `list()` (returns the candidate catalog with name, description, invocation policy, resource base) and `get()` (returns the full skill body for a candidate). The registry handles merging, deduplication, and validation; plugin unload automatically removes registration effects with no residual state.
4. **events**: this plugin is a static library and neither listens to nor emits events; registration and deregistration trigger the registry's `skills/change` invalidation notification, and consumers refresh the catalog accordingly.

## Plugin configuration

The plugin line supports two optional config fields (written in the profile's `cordis.patch.yml` or a `--patch` overlay):

```yaml
- insert:
    - id: praxis
      name: dsh-praxis
      config:
        providerName: praxis-bundled   # provider name registered on ctx.skills (default)
        skillsDir: ./skills            # skill root directory; relative paths resolve against package root; array accepted
```

- `providerName`: a non-empty string; must be unique within the same scope (duplicate registrations are rejected by the registry).
- `skillsDir`: one or more skill root directories. Default is `<package root>/skills` (registered with `bundled` source at rank 600; explicitly configured directories register with `custom` source at rank 300, consistent with the platform's custom-directory semantics). Two standard layouts are accepted within a directory: `<name>/SKILL.md` directory bundles, or flat `<name>.md` files; the frontmatter `name` must match the directory/file name, otherwise the entry is skipped with a warning.

## Exported interfaces (programmatic use)

Besides the three plugin elements, `lib/index.js` exports:

| Export | Description |
| --- | --- |
| `PraxisSkillProvider` | Provider class: constructed with `{ providerName, roots }`; `list()` / `get()` follow the platform `SkillProvider` contract |
| `resolveSettings(config)` | Config validation and resolution (defaults, relative path resolution, argument validation) |
| `scanLibrary(root)` | Scans a skill root directory, returning entries and warnings |
| `parseSkillDocument(raw)` / `splitFrontmatter(raw)` | Skill document parsing and frontmatter splitting (with field validation) |
| `SkillDocumentError`、`MAX_DESCRIPTION_LENGTH` | Parse error type and description length cap (1024) |
| `CUSTOM_SKILL_RANK` | Registration priority constant for custom skill directories (300, matching platform docs) |
| `PACKAGE_ROOT` | Absolute path of the plugin package root (resolved at runtime) |

## Local development

```sh
npm install
npm run build       # tsc → lib/
npm run typecheck   # full type check of src + tests
npm test            # all tests: parser, catalog scan, provider, library integrity, real Cordis integration
```

Test notes:

- `tests/frontmatter.test.js` / `catalog.test.js` / `provider.test.js`: unit tests for parsing and discovery logic.
- `tests/library.test.js`: integrity checks on `skills/`—the skill set is fixed at 14, frontmatter is valid, directory names match `name`, and all cross-references resolve. **This file will block you when adding or renaming skills.**
- `tests/integration.test.js`: mounts a real `@deepseek-ai/cordis` + `@deepseek-ai/dsh-skill` to verify catalog, loading, snapshots, and duplicate-registration rejection—i.e., the runtime path by which dsh actually loads this plugin.

For new skills, follow the workflow in `skills/skill-authoring/SKILL.md` and keep the skill list in `tests/library.test.js` in sync.

## Directory structure

```
skill-framework/
├── package.json          # manifest: dsh.bundle → cordis.patch.yml
├── cordis.patch.yml      # bundle patch layer: inserts the praxis plugin line
├── tsconfig.json         # build config (src → lib)
├── tsconfig.tests.json   # full type-check config (src + tests, checkJs)
├── examples/dev.patch.yml  # development-mode overlay example
├── src/                  # plugin source (TypeScript)
│   ├── index.ts          # plugin entry: name / inject / apply / config resolution
│   ├── provider.ts       # ctx.skills provider implementation
│   ├── catalog.ts        # skill library catalog scan
│   ├── document.ts       # document field validation
│   └── frontmatter.ts    # frontmatter splitting
├── tests/                # node:test tests (run against lib/)
└── skills/               # skill library (Agent Skills standard)
    └── <skill-name>/SKILL.md [+ references/]
```

## License

Released under the [MIT License](LICENSE).
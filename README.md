[English](README.en.md)

# dsh-praxis

**Praxis** 是一套面向 DeepSeek Harness（dsh）的工程方法论技能库插件：把资深工程师的工作流程（设计对话、写计划、执行计划、测试先行、系统排障、完成验证、并行分工、代码评审、分支收尾等）固化成一组符合 Agent Skills 开放标准的 `SKILL.md` 技能，以自包含插件的形式接入 dsh 的技能体系。

- 插件形态：dsh bundle（`package.json` 的 `dsh.bundle` 声明 + `cordis.patch.yml` 补丁行）
- 能力接口：Cordis 插件 → `ctx.skills` 技能提供者（provider）→ 平台自带的 `dsh-tool-skill` 消费端 → 模型可见的技能目录与 `skill` 加载工具
- 技能格式：Agent Skills 标准（`SKILL.md` + YAML frontmatter），与 dsh 本地技能发现器（`dsh-skill-filesystem`）完全兼容

## 技能清单

| 技能 | 触发场景 | 分组 |
| --- | --- | --- |
| `method-compass` | 开始任何任务时：了解技能库、选择第一个技能 | meta |
| `design-conversation` | 需求模糊、有多种方案、设计未定——先对话后编码 | planning |
| `implementation-blueprint` | 设计已定，写可执行的分步计划 | planning |
| `blueprint-execution` | 按计划实施：顺序执行、检查点验证、偏差上报 | planning |
| `test-first-cycle` | 写任何有可测行为的代码：先红后绿再重构 | testing |
| `fault-isolation` | 任何异常行为：以证据定位根因，而非猜测 | debugging |
| `completion-proof` | 声称"完成"之前：用可观察证据证明 | debugging |
| `task-splitting` | 并行分工：按契约切分、派发、集成 | collaboration |
| `delegated-build` | 把计划交给子代理执行：两轮审查把关 | collaboration |
| `review-preflight` | 请求评审前：自检、自测、写好评审请求 | review |
| `feedback-assimilation` | 收到评审意见后：逐条消化、修复、回应 | review |
| `lane-isolation` | 同仓库并行开发：每条分支独立工作区 | delivery |
| `branch-conclusion` | 分支完成、合入主干前的完整收尾流程 | delivery |
| `skill-authoring` | 编写/修改/验证新技能 | meta |

## 环境要求

- DeepSeek Harness `dsh` ≥ 0.1.0-rc.6（skill 能力族已在标准 profile 中启用，即 `dsh-skill`、`dsh-tool-skill` 已挂载）
- Node.js ≥ 22（dsh 自身要求；本插件运行时为纯 ESM JavaScript）

## 安装

### 在 DSH 中安装

```sh
dsh plugin --profile demo add github:JohnXu22786/skill-framework
```

### 方式 A：本地打包后安装（推荐）

```sh
# 1. 在插件目录安装依赖并构建
npm install
npm run build

# 2. 打包（产物含 lib/、skills/、cordis.patch.yml）
npm pack

# 3. 安装到 dsh 的某个 profile
dsh plugin --profile web add ./dsh-praxis-0.1.0.tgz
```

### 方式 B：从本地目录安装（开发中）

```sh
dsh plugin --profile web add /绝对/路径/dsh-praxis
```

目录安装时 profile 需按 dsh 文档授权本地构建。

### 方式 C：开发模式（源码直挂，配合 Harness 源码环境）

```sh
# 1. 把 examples/dev.patch.yml 里 name 的值改为本插件 src/index.ts 的绝对路径
# 2. 启动（默认 web profile；`dsh --profile <名>` 可指定其他 profile）
dsh web --patch ./examples/dev.patch.yml
```

### 方式 D：零代码接入（不使用本插件的加载器）

本库的 `skills/` 目录本身就是标准 Agent Skills 集合，可直接放进 dsh 的本地技能根目录之一：

```sh
# 用户级（对所有项目生效）
cp -r skills/* ~/.dsh/skills/

# 或项目级
mkdir -p .dsh/skills && cp -r skills/* .dsh/skills/
```

此方式由 dsh 自带的 `dsh-skill-filesystem` 发现器加载，无需安装本插件。两种接入方式的技能内容完全一致。

## 使用

安装后无需任何手动配置：模型在会话中遇到技能目录中的触发场景时会自动加载对应技能。也可以在对话中直接指定，例如：

> 先给我一个实现计划（implementation-blueprint），再按计划执行（blueprint-execution）。

排障时模型会优先遵循 `fault-isolation` 的流程；声称完成前会按 `completion-proof` 给出验证证据。技能之间通过 `**REQUIRED SUB-SKILL:** praxis:xxx` 显式标记依赖。

## 接入说明：插件如何被 dsh 加载

```
dsh 启动
 └─ profile 按层合成插件树
     └─ bundle 层：读取 package.json 的 dsh.bundle.patch → cordis.patch.yml
         └─ 补丁插入一行插件配置：
              - id: praxis
                name: dsh-praxis          # 按 npm 包名解析 main → lib/index.js
             └─ dsh 加载该模块的命名导出 { name, inject, apply }
                 └─ apply(ctx) 调用 ctx.skills.registerProvider(...)
                     └─ PraxisSkillProvider 注册到技能注册表（rank 600，source: bundled）
                         └─ dsh-tool-skill 消费端生成技能目录与 skill 加载工具
                             └─ 模型可见：目录条目（name + description）+ 技能正文
```

关键点：

1. **manifest**：`package.json` 中的 `"dsh": { "bundle": { "patch": "./cordis.patch.yml" } }` 声明本包是一个 bundle；`dsh plugin --profile <名> add <包>` 即通过它激活。
2. **入口文件**：`lib/index.js`（构建产物，`main` 指向），导出 Cordis 插件三要素——`name`（行 id：`praxis`）、`inject`（依赖服务：`['skills']`）、`apply(ctx, config)`（注册提供者）。源码入口为 `src/index.ts`。
3. **技能接口**：提供者实现 `list()`（返回候选目录，含名称、描述、调用策略、资源基址）与 `get()`（按候选返回完整技能正文）。注册表负责合并、去重与校验；插件卸载时注册效果自动解除，无残留状态。
4. **事件**：本插件为静态库，不监听/发射事件；注册与注销会触发注册表的 `skills/change` 失效通知，消费端据此刷新目录。

## 插件配置

插件行支持两个可选配置字段（写在 profile 的 `cordis.patch.yml` 或 `--patch` 覆盖层中）：

```yaml
- insert:
    - id: praxis
      name: dsh-praxis
      config:
        providerName: praxis-bundled   # 注册到 ctx.skills 的提供者名（默认）
        skillsDir: ./skills            # 技能库目录；相对路径以包根解析；可传数组
```

- `providerName`：非空字符串；在同一作用域内必须唯一（重名注册会被注册表拒绝）。
- `skillsDir`：一个或多个技能库根目录。默认 `<包根>/skills`（该默认根以 `bundled` 来源、rank 600 注册；显式配置的目录以 `custom` 来源、rank 300 注册，与平台自定义目录语义一致）。目录内接受两种标准布局：`<name>/SKILL.md` 目录束，或 `<name>.md` 平铺文件；frontmatter 的 `name` 必须与目录名/文件名一致，否则该条目跳过并告警。

## 导出接口（编程使用）

`lib/index.js` 除插件三要素外还导出：

| 导出 | 说明 |
| --- | --- |
| `PraxisSkillProvider` | 提供者类：`{ providerName, roots }` 构造，`list()` / `get()` 遵循平台 `SkillProvider` 契约 |
| `resolveSettings(config)` | 配置校验与解析（默认值、相对路径解析、参数校验） |
| `scanLibrary(root)` | 扫描一个技能库根目录，返回条目与警告 |
| `parseSkillDocument(raw)` / `splitFrontmatter(raw)` | 技能文档解析与 frontmatter 切分（含字段校验） |
| `SkillDocumentError`、`MAX_DESCRIPTION_LENGTH` | 解析错误类型与描述长度上限（1024） |
| `CUSTOM_SKILL_RANK` | 自定义技能目录的注册优先级常量（300，与平台文档一致） |
| `PACKAGE_ROOT` | 插件包根目录的绝对路径（运行时解析） |

## 本地开发

```sh
npm install
npm run build       # tsc → lib/
npm run typecheck   # src + tests 全量类型检查
npm test            # 全部测试：解析器、目录扫描、提供者、库完整性、真实 Cordis 集成
```

测试说明：

- `tests/frontmatter.test.js` / `catalog.test.js` / `provider.test.js`：解析与发现逻辑的单元测试。
- `tests/library.test.js`：对 `skills/` 的完整性检查——技能集合固定为 14 个、frontmatter 合法、目录名与 `name` 一致、交叉引用全部可解析。**新增或改名技能时该文件会挡住你**。
- `tests/integration.test.js`：挂载真实的 `@deepseek-ai/cordis` + `@deepseek-ai/dsh-skill`，验证目录、加载、快照与重复注册拒绝——即 dsh 实际加载本插件的运行时路径。

新增技能请遵循 `skills/skill-authoring/SKILL.md` 的流程，并保持 `tests/library.test.js` 中的技能清单同步。

## 目录结构

```
skill-framework/
├── package.json          # manifest：dsh.bundle → cordis.patch.yml
├── cordis.patch.yml      # bundle 补丁层：插入 praxis 插件行
├── tsconfig.json         # 构建配置（src → lib）
├── tsconfig.tests.json   # 全量类型检查配置（src + tests，checkJs）
├── examples/dev.patch.yml  # 开发模式覆盖层示例
├── src/                  # 插件源码（TypeScript）
│   ├── index.ts          # 插件入口：name / inject / apply / 配置解析
│   ├── provider.ts       # ctx.skills 提供者实现
│   ├── catalog.ts        # 技能库目录扫描
│   ├── document.ts       # 文档字段校验
│   └── frontmatter.ts    # frontmatter 切分
├── tests/                # node:test 测试（对 lib/ 运行）
└── skills/               # 技能库（Agent Skills 标准）
    └── <skill-name>/SKILL.md [+ references/]
```

## 许可

本项目基于 [MIT](LICENSE) 许可开源。

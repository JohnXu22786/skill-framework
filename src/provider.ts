/**
 * The `ctx.skills` provider contributed by this plugin.
 *
 * The provider exposes the bundled skill library as immutable candidates at the
 * standard packaged rank, reading each body fresh on every `get()` so edits to
 * the shipped markdown are picked up without any cache invalidation machinery.
 */

import { readFile } from 'node:fs/promises';
import {
  type SkillCandidate,
  type SkillDefinition,
  type SkillLookupOptions,
  type SkillProvider,
  type SkillProviderObservation,
} from '@deepseek-ai/dsh-skill';
import { scanLibrary, type CatalogResult } from './catalog.js';
import { parseSkillDocument, type SkillDocument, SkillDocumentError } from './document.js';

/** Rank for admin-configured skill roots, matching the platform's documented custom-source rank. */
export const CUSTOM_SKILL_RANK = 300;

/** One library root with its provenance and precedence. */
export interface PraxisRoot {
  /** Absolute path of the library directory. */
  readonly path: string;
  /** Provenance label exposed to the model-facing catalog. */
  readonly source: 'bundled' | 'custom';
  /** Duplicate-resolution rank; lower wins within one layer. */
  readonly rank: number;
}

/** Runtime settings for one provider instance. */
export interface PraxisProviderConfig {
  /** Unique provider name registered on `ctx.skills`. */
  readonly providerName: string;
  /** Absolute library roots scanned in order. */
  readonly roots: readonly PraxisRoot[];
}

/** Side channels the provider reports through. */
export interface PraxisProviderDeps {
  /** Log or forward a non-fatal discovery warning. */
  readonly warn: (message: string) => void;
}

/** Opaque provider-owned locator carried by candidates. */
interface PraxisLocator {
  readonly file: string;
  readonly directory: string;
}

/** Immutable bundled-skill provider. */
export class PraxisSkillProvider implements SkillProvider {
  readonly name: string;
  readonly #config: PraxisProviderConfig;
  readonly #deps: PraxisProviderDeps;

  constructor(config: PraxisProviderConfig, deps: PraxisProviderDeps) {
    this.name = config.providerName;
    this.#config = config;
    this.#deps = deps;
  }

  async list(options: SkillLookupOptions): Promise<readonly SkillCandidate[] | SkillProviderObservation> {
    options.signal?.throwIfAborted();
    const candidates: SkillCandidate[] = [];
    for (const root of this.#config.roots) {
      const scanned = await scanLibrary(root.path, { signal: options.signal });
      for (const warning of scanned.warnings) this.#deps.warn(warning);
      for (const entry of scanned.entries) {
        candidates.push(candidateFor(entry.document, entry.path, entry.directory, this.name, root));
      }
    }
    return candidates;
  }

  async get(candidate: SkillCandidate, options: SkillLookupOptions): Promise<SkillDefinition | undefined> {
    options.signal?.throwIfAborted();
    const locator = locatorOf(candidate);
    if (locator === undefined) return undefined;

    let raw: string;
    try {
      raw = await readFile(locator.file, { encoding: 'utf8', signal: options.signal });
    } catch (error) {
      if (isNotReadableSkillFileError(error)) return undefined;
      throw error;
    }
    options.signal?.throwIfAborted();

    let document: SkillDocument;
    try {
      document = parseSkillDocument(raw);
    } catch (error) {
      if (error instanceof SkillDocumentError) {
        this.#deps.warn(`skill file ${locator.file} ignored: ${error.message}`);
        return undefined;
      }
      throw error;
    }
    if (document.name !== candidate.name) {
      this.#deps.warn(`skill file ${locator.file}: frontmatter name changed to "${document.name}"; stale selection dropped`);
      return undefined;
    }

    return {
      name: document.name,
      description: document.description,
      ...(document.whenToUse !== undefined ? { whenToUse: document.whenToUse } : {}),
      invocation: document.invocation,
      provider: this.name,
      source: candidate.source,
      resourceBase: { kind: 'directory', path: locator.directory },
      path: locator.file,
      ...(document.metadata !== undefined ? { metadata: document.metadata } : {}),
      content: document.content,
    };
  }
}

function candidateFor(
  document: SkillDocument,
  file: string,
  directory: string,
  provider: string,
  root: PraxisRoot,
): SkillCandidate {
  return {
    name: document.name,
    description: document.description,
    ...(document.whenToUse !== undefined ? { whenToUse: document.whenToUse } : {}),
    invocation: document.invocation,
    provider,
    source: root.source,
    rank: root.rank,
    locator: { file, directory } satisfies PraxisLocator,
    resourceBase: { kind: 'directory', path: directory },
    path: file,
    ...(document.metadata !== undefined ? { metadata: document.metadata } : {}),
  };
}

function locatorOf(candidate: SkillCandidate): PraxisLocator | undefined {
  const locator = candidate.locator as Partial<PraxisLocator> | null | undefined;
  if (
    typeof locator?.file !== 'string' ||
    typeof locator.directory !== 'string'
  ) {
    return undefined;
  }
  return { file: locator.file, directory: locator.directory };
}

function isNotReadableSkillFileError(error: unknown): boolean {
  return isAbsentPathError(error) || hasErrorCode(error, 'EISDIR');
}

function isAbsentPathError(error: unknown): boolean {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? (error as { code?: unknown }).code
    : undefined;
  return code === 'ENOENT' || code === 'ENOTDIR';
}

function hasErrorCode(error: unknown, code: string): boolean {
  const found = typeof error === 'object' && error !== null && 'code' in error
    ? (error as { code?: unknown }).code
    : undefined;
  return found === code;
}

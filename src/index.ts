/**
 * dsh-praxis — bundled engineering-methodology skill library.
 *
 * This module is the Cordis plugin entry point dsh mounts from the bundle
 * patch row ({@link ../cordis.patch.yml}). The loader reads the named exports
 * `name`, `inject`, and `apply`; `apply` registers a skill provider on the
 * `ctx.skills` registry, which the stock `dsh-tool-skill` consumer turns into
 * the model-facing skill catalog and loader.
 */

import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Context } from '@deepseek-ai/cordis';
import { BUNDLED_SKILL_RANK } from '@deepseek-ai/dsh-skill';
import { CUSTOM_SKILL_RANK, PraxisSkillProvider, type PraxisProviderConfig, type PraxisRoot } from './provider.js';

/** Cordis plugin identifier of this bundle row. */
export const name = 'praxis';

/** Services this plugin must have mounted before it applies. */
export const inject = ['skills'];

/** Config accepted by the plugin row. */
export interface PraxisConfig {
  /**
   * Unique provider name on `ctx.skills`.
   * @default 'praxis-bundled'
   */
  providerName?: string;
  /**
   * One or more skill library directories. Relative entries resolve against
   * the package root. When omitted, the bundled `skills/` directory is used.
   * @default ['<package root>/skills']
   */
  skillsDir?: string | readonly string[];
}

/** Package root of this plugin (one level above the compiled or source entry). */
export const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Validate user config and produce the provider settings.
 *
 * @throws {TypeError} on invalid field values.
 */
export function resolveSettings(config: PraxisConfig): PraxisProviderConfig {
  if (typeof config.providerName !== 'undefined' && typeof config.providerName !== 'string') {
    throw new TypeError('praxis: "providerName" must be a string');
  }
  const providerName = (config.providerName ?? 'praxis-bundled').trim();
  if (providerName.length === 0) {
    throw new TypeError('praxis: "providerName" must be a non-empty string');
  }

  let rawDirs: readonly string[];
  if (config.skillsDir === undefined) {
    rawDirs = [join(PACKAGE_ROOT, 'skills')];
  } else if (typeof config.skillsDir === 'string') {
    rawDirs = [config.skillsDir];
  } else if (Array.isArray(config.skillsDir)) {
    rawDirs = config.skillsDir;
  } else {
    throw new TypeError('praxis: "skillsDir" must be a string or an array of strings');
  }
  if (rawDirs.length === 0) {
    throw new TypeError('praxis: "skillsDir" must not be empty');
  }

  const roots: PraxisRoot[] = rawDirs.map((dir) => {
    if (typeof dir !== 'string' || dir.trim().length === 0) {
      throw new TypeError('praxis: every "skillsDir" entry must be a non-empty string');
    }
    return {
      path: isAbsolute(dir) ? dir : resolve(PACKAGE_ROOT, dir),
      source: config.skillsDir === undefined ? 'bundled' : 'custom',
      rank: config.skillsDir === undefined ? BUNDLED_SKILL_RANK : CUSTOM_SKILL_RANK,
    };
  });
  return { providerName, roots };
}

/**
 * Cordis plugin body: register the bundled library on `ctx.skills`.
 *
 * The provider is immutable, so no watchers or invalidation state are needed;
 * the returned disposer unregisters the provider when this plugin unloads.
 */
export function apply(ctx: Context, config: PraxisConfig = {}): () => void {
  const settings = resolveSettings(config);
  const warn = (message: string): void => {
    ctx.logger.warn(`praxis: ${message}`);
  };
  return ctx.skills.registerProvider((_control) => new PraxisSkillProvider(settings, { warn }));
}

export { PraxisSkillProvider, CUSTOM_SKILL_RANK } from './provider.js';
export type { PraxisProviderConfig, PraxisRoot } from './provider.js';
export {
  parseSkillDocument,
  SkillDocumentError,
  MAX_DESCRIPTION_LENGTH,
} from './document.js';
export type { SkillDocument, InvocationPolicy } from './document.js';
export { scanLibrary } from './catalog.js';
export type { CatalogEntry, CatalogResult } from './catalog.js';
export { splitFrontmatter } from './frontmatter.js';
export type { ParsedDocument } from './frontmatter.js';

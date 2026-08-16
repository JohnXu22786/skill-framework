/**
 * Semantic validation of skill documents.
 *
 * This layer turns a raw SKILL.md text into a typed {@link SkillDocument},
 * applying the field rules shared by the skill ecosystem: a kebab-case `name`,
 * a non-empty `description`, optional `whenToUse`/`metadata`, and explicit
 * invocation controls.
 */

import { isSkillName } from '@deepseek-ai/dsh-skill';
import { YAMLParseError } from 'yaml';
import { splitFrontmatter, type ParsedDocument } from './frontmatter.js';

/** Whether a skill may be surfaced on the model-facing and human-facing surfaces. */
export interface InvocationPolicy {
  readonly modelInvocable: boolean;
  readonly userInvocable: boolean;
}

/** Fully validated skill content ready to be served as a provider definition. */
export interface SkillDocument {
  readonly name: string;
  readonly description: string;
  readonly whenToUse?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly invocation: InvocationPolicy;
  readonly content: string;
}

/** Raised when a skill document violates the field contract. */
export class SkillDocumentError extends Error {
  override readonly name = 'SkillDocumentError';

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

/** Hard cap on the description field, matching the shared skill format rules. */
export const MAX_DESCRIPTION_LENGTH = 1024;

/**
 * Parse and validate one skill document.
 *
 * @param raw - full SKILL.md text.
 * @returns the validated document.
 * @throws {SkillDocumentError} when a required field is missing or invalid,
 *   or when the frontmatter block is not valid YAML.
 */
export function parseSkillDocument(raw: string): SkillDocument {
  let parsed: ParsedDocument | undefined;
  try {
    parsed = splitFrontmatter(raw);
  } catch (error) {
    if (error instanceof YAMLParseError) {
      throw new SkillDocumentError(
        `invalid YAML frontmatter: ${error.message.split('\n')[0]}`,
        { cause: error },
      );
    }
    throw error;
  }
  if (parsed === undefined) {
    throw new SkillDocumentError('missing YAML frontmatter');
  }

  const name = stringValue(parsed.data, 'name');
  if (name === undefined) throw new SkillDocumentError('frontmatter requires "name"');
  if (!isSkillName(name)) throw new SkillDocumentError(`invalid skill name "${name}"`);

  const description = stringValue(parsed.data, 'description');
  if (description === undefined) throw new SkillDocumentError('frontmatter requires "description"');
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw new SkillDocumentError(`description exceeds ${MAX_DESCRIPTION_LENGTH} characters`);
  }

  return {
    name,
    description,
    ...optionalString(parsed.data, 'whenToUse'),
    ...optionalMetadata(parsed.data),
    invocation: parseInvocationPolicy(parsed.data),
    content: parsed.body.trim(),
  };
}

function stringValue(data: Readonly<Record<string, unknown>>, key: string): string | undefined {
  const value = data[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function optionalString(data: Readonly<Record<string, unknown>>, key: string): object {
  const value = data[key];
  return typeof value === 'string' && value.length > 0 ? { [key]: value } : {};
}

function optionalMetadata(data: Readonly<Record<string, unknown>>): object {
  const value = data.metadata;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
  return { metadata: value as Readonly<Record<string, unknown>> };
}

function parseInvocationPolicy(data: Readonly<Record<string, unknown>>): InvocationPolicy {
  rejectLegacyKey(data, 'disableModelInvocation', 'disable-model-invocation');
  rejectLegacyKey(data, 'modelInvocable', 'disable-model-invocation');
  rejectLegacyKey(data, 'userInvocable', 'user-invocable');

  const disableModelInvocation = booleanValue(data, 'disable-model-invocation');
  const userInvocable = booleanValue(data, 'user-invocable');
  return {
    modelInvocable: disableModelInvocation !== true,
    userInvocable: userInvocable !== false,
  };
}

function rejectLegacyKey(data: Readonly<Record<string, unknown>>, legacy: string, canonical: string): void {
  if (Object.hasOwn(data, legacy)) {
    throw new SkillDocumentError(`frontmatter field "${legacy}" is unsupported; use "${canonical}"`);
  }
}

/**
 * Read a boolean frontmatter field, accepting the common scalar spellings:
 * YAML booleans, `1`/`0`, and case-insensitive `true`/`false`/`yes`/`no`/`on`/`off`.
 *
 * @returns the boolean value, or `undefined` when the key is absent.
 */
function booleanValue(data: Readonly<Record<string, unknown>>, key: string): boolean | undefined {
  if (!Object.hasOwn(data, key)) return undefined;
  const value = data[key];
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;
  if (typeof value === 'string') {
    switch (value.toLowerCase()) {
      case 'true':
      case 'yes':
      case 'on':
        return true;
      case 'false':
      case 'no':
      case 'off':
        return false;
    }
  }
  throw new SkillDocumentError(`frontmatter field "${key}" must be a boolean`);
}

/**
 * Shared fixture helpers for the test suite.
 */

import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

/**
 * Create a temporary directory populated from a flat spec map.
 *
 * @param {Record<string, string>} spec - relative path -> file content.
 *   Parent directories are created automatically.
 * @returns {Promise<string>} the absolute path of the temporary directory.
 */
export async function makeFixture(spec) {
  const root = await mkdtemp(join(tmpdir(), 'praxis-test-'));
  for (const [rel, content] of Object.entries(spec)) {
    const target = join(root, rel);
    await mkdir(join(target, '..'), { recursive: true });
    await writeFile(target, content, 'utf8');
  }
  return root;
}

/**
 * A minimal valid skill document for fixtures.
 *
 * @param {string} name - skill name (kebab-case).
 * @param {string} [extra] - extra frontmatter lines inserted before the closing marker.
 * @returns {string} the full SKILL.md text.
 */
export function SKILL_TEMPLATE(name, extra = '') {
  return `---
name: ${name}
description: Test skill used by the praxis test suite only.
${extra}---
# ${name}

Body of the test skill.
`;
}

/**
 * Assert that a provider `list()` result is the complete-array shorthand and
 * narrow it for typing.
 *
 * @param {readonly import('@deepseek-ai/dsh-skill').SkillCandidate[] | import('@deepseek-ai/dsh-skill').SkillProviderObservation} value
 * @returns {readonly import('@deepseek-ai/dsh-skill').SkillCandidate[]}
 */
export function completeCandidates(value) {
  assert.ok(Array.isArray(value), 'list() must use the complete-array shorthand');
  return value;
}

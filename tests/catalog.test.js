import { test } from 'node:test';
import assert from 'node:assert/strict';
import { symlink } from 'node:fs/promises';
import { platform } from 'node:os';
import { join } from 'node:path';
import { scanLibrary } from '../lib/index.js';
import { makeFixture, SKILL_TEMPLATE } from './helpers.js';
test('scanLibrary: finds directory bundles and flat markdown files', async () => {
  const root = await makeFixture({
    'alpha/SKILL.md': SKILL_TEMPLATE('alpha'),
    'beta.md': SKILL_TEMPLATE('beta'),
  });
  const result = await scanLibrary(root);
  assert.deepEqual(
    result.entries.map((entry) => entry.document.name),
    ['alpha', 'beta'],
  );
  assert.deepEqual(result.warnings, []);
  const alpha = result.entries.find((entry) => entry.document.name === 'alpha');
  assert.ok(alpha);
  assert.match(alpha.path, /alpha[\\/]SKILL\.md$/);
  assert.match(alpha.directory, /alpha$/);
  const beta = result.entries.find((entry) => entry.document.name === 'beta');
  assert.ok(beta);
  assert.match(beta.path, /beta\.md$/);
  assert.equal(beta.directory, root);
});

test('scanLibrary: entries are sorted by skill name', async () => {
  const root = await makeFixture({
    'zulu/SKILL.md': SKILL_TEMPLATE('zulu'),
    'alpha/SKILL.md': SKILL_TEMPLATE('alpha'),
    'mike/SKILL.md': SKILL_TEMPLATE('mike'),
  });
  const result = await scanLibrary(root);
  assert.deepEqual(
    result.entries.map((entry) => entry.document.name),
    ['alpha', 'mike', 'zulu'],
  );
});

test('scanLibrary: reports malformed entries as warnings and skips them', async () => {
  const root = await makeFixture({
    'good/SKILL.md': SKILL_TEMPLATE('good'),
    'bad/SKILL.md': '# no frontmatter here\n',
    'broken/SKILL.md': '---\nname: [unclosed\n---\n',
    'wrong/SKILL.md': SKILL_TEMPLATE('different-name'),
    'notaskill/README.md': 'not a skill file',
  });
  const result = await scanLibrary(root);
  assert.deepEqual(
    result.entries.map((entry) => entry.document.name),
    ['good'],
  );
  assert.equal(result.warnings.length, 3);
  assert.match(result.warnings[0] ?? '', /bad[\\/]SKILL\.md/);
  assert.match(result.warnings[1] ?? '', /broken[\\/]SKILL\.md/);
  assert.match(result.warnings[2] ?? '', /wrong[\\/]SKILL\.md/);
});

test('scanLibrary: a directory named like a markdown file is not a skill', async () => {
  const root = await makeFixture({
    'notes.md/README.txt': 'a directory, not a file',
    'alpha/SKILL.md': SKILL_TEMPLATE('alpha'),
  });
  const result = await scanLibrary(root);
  assert.deepEqual(
    result.entries.map((entry) => entry.document.name),
    ['alpha'],
  );
  assert.deepEqual(result.warnings, []);
});

test('scanLibrary: a directory named SKILL.md inside a bundle is not a crash', async () => {
  const root = await makeFixture({
    'alpha/SKILL.md/README.txt': 'a directory where the skill file should be',
    'good/SKILL.md': SKILL_TEMPLATE('good'),
  });
  const result = await scanLibrary(root);
  assert.deepEqual(
    result.entries.map((entry) => entry.document.name),
    ['good'],
  );
  assert.deepEqual(result.warnings, []);
});

test('scanLibrary: uppercase .MD flat files surface a name-mismatch warning instead of vanishing', async () => {
  const root = await makeFixture({
    'BETA.MD': SKILL_TEMPLATE('beta'),
    'alpha/SKILL.md': SKILL_TEMPLATE('alpha'),
  });
  const result = await scanLibrary(root);
  assert.deepEqual(
    result.entries.map((entry) => entry.document.name),
    ['alpha'],
  );
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0] ?? '', /BETA\.MD/);
});

test('scanLibrary: symbolic links to skill directories are followed', async (t) => {
  const root = await makeFixture({
    'real/alpha/SKILL.md': SKILL_TEMPLATE('alpha'),
    'real/beta/SKILL.md': SKILL_TEMPLATE('beta'),
  });
  try {
    await symlink(join(root, 'real', 'alpha'), join(root, 'alpha'), platform() === 'win32' ? 'junction' : 'dir');
    await symlink(join(root, 'real', 'beta'), join(root, 'beta'), platform() === 'win32' ? 'junction' : 'dir');
  } catch (error) {
    t.skip(`symlink unavailable: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }
  const result = await scanLibrary(root);
  assert.deepEqual(
    result.entries.map((entry) => entry.document.name).sort(),
    ['alpha', 'beta'],
  );
  assert.deepEqual(result.warnings, []);
});

test('scanLibrary: ignores entries deeper than one level', async () => {
  const root = await makeFixture({
    'nested/SKILL.md': SKILL_TEMPLATE('nested'),
    'deep/nested/SKILL.md': SKILL_TEMPLATE('deep'),
  });
  const result = await scanLibrary(root);
  assert.deepEqual(
    result.entries.map((entry) => entry.document.name),
    ['nested'],
  );
});

test('scanLibrary: an absent root is an empty library', async () => {
  const result = await scanLibrary('X:\\definitely-not-a-real-path\\nowhere');
  assert.deepEqual(result.entries, []);
  assert.deepEqual(result.warnings, []);
});

test('scanLibrary: aborts on a signalled abort', async () => {
  const root = await makeFixture({ 'alpha/SKILL.md': SKILL_TEMPLATE('alpha') });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    scanLibrary(root, { signal: controller.signal }),
    { name: 'AbortError' },
  );
});

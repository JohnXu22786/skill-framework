import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rm, writeFile } from 'node:fs/promises';
import { PraxisSkillProvider, resolveSettings, CUSTOM_SKILL_RANK } from '../lib/index.js';
import { completeCandidates, makeFixture, SKILL_TEMPLATE } from './helpers.js';

/** @type {string[]} */
const warnings = [];
/** @param {string} message */
const noopWarn = (message) => warnings.push(message);

/** @param {string} root */
function providerFor(root, providerName = 'praxis-test') {
  return new PraxisSkillProvider(
    { providerName, roots: [{ path: root, source: 'bundled', rank: 600 }] },
    { warn: noopWarn },
  );
}

test('resolveSettings: defaults point at the bundled skills directory', () => {
  const settings = resolveSettings({});
  assert.equal(settings.providerName, 'praxis-bundled');
  assert.equal(settings.roots.length, 1);
  const root = settings.roots[0];
  assert.ok(root);
  assert.match(root.path, /skills$/);
  assert.equal(root.source, 'bundled');
  assert.equal(root.rank, 600);
});

test('resolveSettings: rejects malformed provider names and dir lists', () => {
  assert.throws(() => resolveSettings({ providerName: '' }), TypeError);
  assert.throws(() => resolveSettings({ providerName: '  ' }), TypeError);
  assert.throws(
    () => resolveSettings({ providerName: /** @type {any} */ (42) }),
    /must be a string/,
  );
  assert.throws(() => resolveSettings({ skillsDir: [] }), /must not be empty/);
  assert.throws(
    () => resolveSettings({ skillsDir: /** @type {any} */ (42) }),
    /must be a string or an array/,
  );
  assert.throws(() => resolveSettings({ skillsDir: [''] }), /non-empty string/);
});

test('resolveSettings: configured dirs are labeled custom at the custom rank', () => {
  const settings = resolveSettings({ providerName: 'custom', skillsDir: ['extra'] });
  assert.equal(settings.providerName, 'custom');
  assert.equal(settings.roots.length, 1);
  const root = settings.roots[0];
  assert.ok(root);
  assert.ok(!root.path.startsWith('extra'));
  assert.match(root.path, /extra$/);
  assert.equal(root.source, 'custom');
  assert.equal(root.rank, CUSTOM_SKILL_RANK);
});

test('list: exposes the full candidate shape', async () => {
  const root = await makeFixture({
    'alpha/SKILL.md': SKILL_TEMPLATE('alpha', 'whenToUse: Test only.\n'),
    'beta/SKILL.md': SKILL_TEMPLATE('beta'),
  });
  const provider = providerFor(root);
  const candidates = completeCandidates(await provider.list({}));
  assert.equal(candidates.length, 2);
  const alpha = candidates[0];
  assert.ok(alpha);
  const locator = /** @type {{ file: string, directory: string }} */ (alpha.locator);
  assert.equal(alpha.name, 'alpha');
  assert.equal(alpha.description, 'Test skill used by the praxis test suite only.');
  assert.equal(alpha.whenToUse, 'Test only.');
  assert.equal(alpha.provider, 'praxis-test');
  assert.equal(alpha.source, 'bundled');
  assert.equal(alpha.rank, 600);
  assert.deepEqual(alpha.invocation, { modelInvocable: true, userInvocable: true });
  assert.deepEqual(alpha.resourceBase, { kind: 'directory', path: locator.directory });
  assert.equal(alpha.path, locator.file);
});

test('list: forwards discovery warnings', async () => {
  const root = await makeFixture({ 'bad/SKILL.md': '# no frontmatter\n' });
  warnings.length = 0;
  const provider = providerFor(root);
  await provider.list({});
  assert.equal(warnings.length, 1);
  assert.match(warnings[0] ?? '', /ignored/);
});

test('list: one broken file does not sink the rest of the library', async () => {
  const root = await makeFixture({
    'good/SKILL.md': SKILL_TEMPLATE('good'),
    'broken/SKILL.md': '---\nname: [unclosed\n---\n',
  });
  warnings.length = 0;
  const provider = providerFor(root);
  const candidates = completeCandidates(await provider.list({}));
  assert.deepEqual(
    candidates.map((candidate) => candidate.name),
    ['good'],
  );
  assert.equal(warnings.length, 1);
  assert.match(warnings[0] ?? '', /broken[\\/]SKILL\.md/);
});

test('get: loads the body from disk', async () => {
  const root = await makeFixture({ 'alpha/SKILL.md': SKILL_TEMPLATE('alpha') });
  const provider = providerFor(root);
  const candidate = completeCandidates(await provider.list({}))[0];
  assert.ok(candidate);
  const definition = await provider.get(candidate, {});
  assert.ok(definition);
  assert.equal(definition.name, 'alpha');
  assert.equal(definition.provider, 'praxis-test');
  assert.equal(definition.source, 'bundled');
  assert.equal(definition.content, '# alpha\n\nBody of the test skill.');
  assert.match(definition.path ?? '', /alpha[\\/]SKILL\.md$/);
});

test('get: returns undefined for a foreign locator', async () => {
  const provider = providerFor(await makeFixture({ 'alpha/SKILL.md': SKILL_TEMPLATE('alpha') }));
  const foreign = {
    name: 'alpha',
    description: 'x',
    invocation: { modelInvocable: true, userInvocable: true },
    provider: 'someone-else',
    source: 'bundled',
    rank: 600,
    locator: { unexpected: true },
  };
  assert.equal(await provider.get(foreign, {}), undefined);
});

test('get: returns undefined when the file disappeared', async () => {
  const root = await makeFixture({ 'alpha/SKILL.md': SKILL_TEMPLATE('alpha') });
  const provider = providerFor(root);
  const candidate = completeCandidates(await provider.list({}))[0];
  assert.ok(candidate);
  await rm(requirePathOf(candidate), { force: true });
  assert.equal(await provider.get(candidate, {}), undefined);
});

test('get: returns undefined when the frontmatter name changed since discovery', async () => {
  const root = await makeFixture({ 'alpha/SKILL.md': SKILL_TEMPLATE('alpha') });
  const provider = providerFor(root);
  const candidate = completeCandidates(await provider.list({}))[0];
  assert.ok(candidate);
  await writeFile(requirePathOf(candidate), SKILL_TEMPLATE('renamed'), 'utf8');
  assert.equal(await provider.get(candidate, {}), undefined);
});

test('get: returns undefined when the file turned into invalid YAML', async () => {
  const root = await makeFixture({ 'alpha/SKILL.md': SKILL_TEMPLATE('alpha') });
  const provider = providerFor(root);
  const candidate = completeCandidates(await provider.list({}))[0];
  assert.ok(candidate);
  await writeFile(requirePathOf(candidate), '---\nname: [unclosed\n---\n', 'utf8');
  assert.equal(await provider.get(candidate, {}), undefined);
});

test('get: honors the abort signal', async () => {
  const root = await makeFixture({ 'alpha/SKILL.md': SKILL_TEMPLATE('alpha') });
  const provider = providerFor(root);
  const candidate = completeCandidates(await provider.list({}))[0];
  assert.ok(candidate);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(provider.get(candidate, { signal: controller.signal }), { name: 'AbortError' });
});

/** @param {import('@deepseek-ai/dsh-skill').SkillCandidate} candidate */
function requirePathOf(candidate) {
  return /** @type {{ file: string }} */ (candidate.locator).file;
}

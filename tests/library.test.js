import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanLibrary } from '../lib/index.js';

const SKILLS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'skills');

/** The fixed capability set this library must ship. */
const EXPECTED_SKILLS = [
  'blueprint-execution',
  'branch-conclusion',
  'completion-proof',
  'delegated-build',
  'design-conversation',
  'fault-isolation',
  'feedback-assimilation',
  'implementation-blueprint',
  'lane-isolation',
  'method-compass',
  'review-preflight',
  'skill-authoring',
  'task-splitting',
  'test-first-cycle',
];

const REFERENCE_PATTERN = /praxis:([a-z0-9]+(?:-[a-z0-9]+)*)/g;

test('library: ships exactly the expected skill set, cleanly parsed', async () => {
  const result = await scanLibrary(SKILLS_DIR);
  assert.deepEqual(result.warnings, []);
  const names = result.entries.map((entry) => entry.document.name).sort();
  assert.deepEqual(names, [...EXPECTED_SKILLS].sort());
});

test('library: every skill follows the layout and field contract', async () => {
  const result = await scanLibrary(SKILLS_DIR);
  for (const entry of result.entries) {
    const { document } = entry;
    assert.ok(document.name.length >= 3, `${document.name}: name too short`);
    assert.ok(document.name.length <= 64, `${document.name}: name too long`);
    assert.ok(document.description.length <= 1024, `${document.name}: description too long`);
    assert.ok(document.description.length >= 20, `${document.name}: description too terse`);
    assert.ok(document.content.length >= 200, `${document.name}: body too thin (${document.content.length} chars)`);
    assert.match(document.description, /^Use (when|before|after|to) /i, `${document.name}: description should be trigger-first`);
    assert.ok(document.metadata?.version, `${document.name}: missing metadata.version`);
    assert.ok(document.metadata?.group, `${document.name}: missing metadata.group`);
    assert.match(entry.path, /[\\/]SKILL\.md$/, `${document.name}: must be a directory bundle`);
  }
});

test('library: cross-references only point at existing skills', async () => {
  const result = await scanLibrary(SKILLS_DIR);
  const bodies = new Map(result.entries.map((entry) => [entry.document.name, entry.document.content]));
  const known = new Set([...EXPECTED_SKILLS]);
  for (const [name, body] of bodies) {
    for (const match of body.matchAll(REFERENCE_PATTERN)) {
      const target = match[1] ?? '';
      assert.ok(known.has(target), `${name}: references unknown skill "${target}"`);
      assert.notEqual(target, name, `${name}: references itself`);
    }
  }
});

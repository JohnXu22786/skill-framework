import { test } from 'node:test';
import assert from 'node:assert/strict';
import { YAMLParseError } from 'yaml';
import {
  splitFrontmatter,
  parseSkillDocument,
  SkillDocumentError,
  MAX_DESCRIPTION_LENGTH,
} from '../lib/index.js';

test('splitFrontmatter: splits data and body', () => {
  const raw = '---\nname: alpha\n---\n# Alpha\n\nBody text.\n';
  const parsed = splitFrontmatter(raw);
  assert.ok(parsed);
  assert.deepEqual(parsed.data, { name: 'alpha' });
  assert.equal(parsed.body, '# Alpha\n\nBody text.\n');
});

test('splitFrontmatter: tolerates CRLF line endings', () => {
  const parsed = splitFrontmatter('---\r\nname: alpha\r\n---\r\n# Body\r\n');
  assert.ok(parsed);
  assert.deepEqual(parsed.data, { name: 'alpha' });
  assert.equal(parsed.body, '# Body\r\n');
});

test('splitFrontmatter: returns undefined when the marker is not the first line', () => {
  assert.equal(splitFrontmatter('\n---\nname: alpha\n---\n'), undefined);
});

test('splitFrontmatter: returns undefined when the document is empty', () => {
  assert.equal(splitFrontmatter(''), undefined);
  assert.equal(splitFrontmatter('---\n'), undefined);
});

test('splitFrontmatter: returns undefined when the closing marker is missing', () => {
  assert.equal(splitFrontmatter('---\nname: alpha\n'), undefined);
});

test('splitFrontmatter: a marker inside the body does not close the block', () => {
  const parsed = splitFrontmatter('---\nname: alpha\n---\nSome --- text\n');
  assert.ok(parsed);
  assert.equal(parsed.body, 'Some --- text\n');
});

test('splitFrontmatter: throws on malformed YAML', () => {
  assert.throws(() => splitFrontmatter('---\nname: [unclosed\n---\n'), YAMLParseError);
});

test('splitFrontmatter: non-mapping frontmatter is treated as absent', () => {
  assert.equal(splitFrontmatter('---\n- a\n- b\n---\n'), undefined);
});

test('parseSkillDocument: returns the validated document', () => {
  const doc = parseSkillDocument(
    '---\nname: alpha-one\ndescription: Use when testing.\nwhenToUse: Only in tests.\nmetadata:\n  version: "1.0"\n---\n\n# Alpha\n',
  );
  assert.equal(doc.name, 'alpha-one');
  assert.equal(doc.description, 'Use when testing.');
  assert.equal(doc.whenToUse, 'Only in tests.');
  assert.deepEqual(doc.metadata, { version: '1.0' });
  assert.deepEqual(doc.invocation, { modelInvocable: true, userInvocable: true });
  assert.equal(doc.content, '# Alpha');
});

test('parseSkillDocument: rejects documents without frontmatter', () => {
  assert.throws(() => parseSkillDocument('# No frontmatter\n'), SkillDocumentError);
});

test('parseSkillDocument: converts malformed YAML into a SkillDocumentError', () => {
  assert.throws(
    () => parseSkillDocument('---\nname: [unclosed\n---\n# body\n'),
    (error) => error instanceof SkillDocumentError && /invalid YAML/.test(error.message),
  );
});

test('parseSkillDocument: requires a name', () => {
  assert.throws(
    () => parseSkillDocument('---\ndescription: Use when testing.\n---\n'),
    /requires "name"/,
  );
});

test('parseSkillDocument: rejects invalid kebab-case names', () => {
  for (const bad of ['Alpha-One', 'alpha_one', 'alpha--one', '-alpha', 'alpha-', 'alpha one']) {
    assert.throws(
      () => parseSkillDocument(`---\nname: ${bad}\ndescription: Use when testing.\n---\n`),
      SkillDocumentError,
      `name ${JSON.stringify(bad)} must be rejected`,
    );
  }
});

test('parseSkillDocument: requires a description', () => {
  assert.throws(
    () => parseSkillDocument('---\nname: alpha\n---\n'),
    /requires "description"/,
  );
});

test('parseSkillDocument: rejects overlong descriptions', () => {
  const long = 'x'.repeat(MAX_DESCRIPTION_LENGTH + 1);
  assert.throws(
    () => parseSkillDocument(`---\nname: alpha\ndescription: ${long}\n---\n`),
    /exceeds 1024 characters/,
  );
});

test('parseSkillDocument: invocation defaults permit both surfaces', () => {
  const doc = parseSkillDocument('---\nname: alpha\ndescription: Use when testing.\n---\n');
  assert.deepEqual(doc.invocation, { modelInvocable: true, userInvocable: true });
});

test('parseSkillDocument: disable-model-invocation excludes the model surface', () => {
  const doc = parseSkillDocument(
    '---\nname: alpha\ndescription: Use when testing.\ndisable-model-invocation: true\n---\n',
  );
  assert.deepEqual(doc.invocation, { modelInvocable: false, userInvocable: true });
});

test('parseSkillDocument: user-invocable false excludes the user surface', () => {
  const doc = parseSkillDocument(
    '---\nname: alpha\ndescription: Use when testing.\nuser-invocable: false\n---\n',
  );
  assert.deepEqual(doc.invocation, { modelInvocable: true, userInvocable: false });
});

test('parseSkillDocument: accepts the common boolean spellings', () => {
  for (const spelling of ['true', 'yes', 'on', '1', 'True', 'YES']) {
    const doc = parseSkillDocument(
      `---\nname: alpha\ndescription: Use when testing.\ndisable-model-invocation: ${spelling}\n---\n`,
    );
    assert.equal(doc.invocation.modelInvocable, false, `spelling ${spelling}`);
  }
  for (const spelling of ['false', 'no', 'off', '0', 'False', 'OFF']) {
    const doc = parseSkillDocument(
      `---\nname: alpha\ndescription: Use when testing.\ndisable-model-invocation: ${spelling}\n---\n`,
    );
    assert.equal(doc.invocation.modelInvocable, true, `spelling ${spelling}`);
  }
});

test('parseSkillDocument: rejects non-boolean invocation values', () => {
  for (const bad of ['sometimes', '2', '[]']) {
    assert.throws(
      () => parseSkillDocument(
        `---\nname: alpha\ndescription: Use when testing.\ndisable-model-invocation: ${bad}\n---\n`,
      ),
      SkillDocumentError,
      `value ${bad} must be rejected`,
    );
  }
});

test('parseSkillDocument: rejects legacy camel-case invocation keys', () => {
  assert.throws(
    () => parseSkillDocument(
      '---\nname: alpha\ndescription: Use when testing.\ndisableModelInvocation: true\n---\n',
    ),
    /disableModelInvocation/,
  );
  assert.throws(
    () => parseSkillDocument(
      '---\nname: alpha\ndescription: Use when testing.\nuserInvocable: true\n---\n',
    ),
    /userInvocable/,
  );
});

test('parseSkillDocument: trims the body', () => {
  const doc = parseSkillDocument('---\nname: alpha\ndescription: Use when testing.\n---\n\n\n# Alpha\n\n');
  assert.equal(doc.content, '# Alpha');
});

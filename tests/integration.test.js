import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Context } from '@deepseek-ai/cordis';
import { SkillService } from '@deepseek-ai/dsh-skill';
import * as praxis from '../lib/index.js';

/**
 * Compose a real Cordis application the same way the harness does: mount the
 * skill service, then mount this plugin's row ({ name, inject, apply } are the
 * exact named exports the bundle patch row loads). Each mount returns a fiber
 * whose promise settles once the plugin finished loading.
 */
async function mountPlugin() {
  const app = new Context();
  const service = app.plugin(SkillService);
  const row = app.plugin({ name: praxis.name, inject: praxis.inject, apply: praxis.apply });
  await Promise.all([service, row]);
  return {
    app,
    dispose: async () => {
      await row.dispose();
      await service.dispose();
    },
  };
}

test('integration: the catalog exposes the full bundled library', async () => {
  const { app, dispose } = await mountPlugin();
  try {
    const skills = await app.skills.list();
    assert.equal(skills.length, 14);
    const names = skills.map((skill) => skill.name);
    assert.ok(names.includes('test-first-cycle'));
    assert.ok(names.includes('fault-isolation'));
    assert.ok(names.includes('design-conversation'));
    const sorted = [...names].sort();
    assert.deepEqual(names, sorted, 'summaries must be sorted by name');
    for (const skill of skills) {
      assert.equal(skill.provider, 'praxis-bundled');
      assert.deepEqual(skill.invocation, { modelInvocable: true, userInvocable: true });
      assert.ok(skill.description.length > 0);
    }
  } finally {
    await dispose();
  }
});

test('integration: get() loads a complete skill body', async () => {
  const { app, dispose } = await mountPlugin();
  try {
    const definition = await app.skills.get('fault-isolation');
    assert.ok(definition);
    assert.equal(definition.name, 'fault-isolation');
    assert.equal(definition.provider, 'praxis-bundled');
    assert.ok(definition.content.includes('## Steps'));
    assert.equal(definition.content, definition.content.trim(), 'body must be trimmed');
  } finally {
    await dispose();
  }
});

test('integration: unknown skill names resolve to undefined', async () => {
  const { app, dispose } = await mountPlugin();
  try {
    assert.equal(await app.skills.get('no-such-skill'), undefined);
  } finally {
    await dispose();
  }
});

test('integration: snapshot reports a complete discovery', async () => {
  const { app, dispose } = await mountPlugin();
  try {
    const snapshot = await app.skills.snapshot();
    assert.equal(snapshot.complete, true);
    assert.equal(snapshot.skills.length, 14);
  } finally {
    await dispose();
  }
});

test('integration: renderSkillContent produces the canonical block', async () => {
  const { renderSkillContent } = await import('@deepseek-ai/dsh-skill');
  const { app, dispose } = await mountPlugin();
  try {
    const definition = await app.skills.get('method-compass');
    assert.ok(definition);
    const rendered = renderSkillContent(definition);
    assert.match(rendered, /<skill_content name="method-compass">/);
    assert.ok(rendered.includes(definition.content));
  } finally {
    await dispose();
  }
});

test('integration: duplicate provider names are rejected by the registry', async () => {
  const { app, dispose } = await mountPlugin();
  try {
    const second = new praxis.PraxisSkillProvider(
      { providerName: 'praxis-bundled', roots: [] },
      { warn() {} },
    );
    assert.throws(
      () => app.skills.registerProvider(() => second),
      /already registered/i,
    );
  } finally {
    await dispose();
  }
});

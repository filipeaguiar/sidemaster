import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createGuideStore } = require('../electron/guide-store.cjs');
const makeGuide = (title = 'Guide') => ({ schemaVersion: 2, guideId: 'guide_test-1', archetypeId: 'archetype_test-1', archetypeName: 'Affinity', versionLabel: 'V1', title, author: '', sections: [{ id: 'section_test-1', type: 'custom', title: 'Intro', fields: { markdown: title }, children: [] }], deck: { main: '', sideboard: '' } });
async function fixture() { const root = await mkdtemp(path.join(os.tmpdir(), 'sidemaster-store-')); return { root, store: createGuideStore(root), cleanup: () => rm(root, { recursive: true, force: true }) }; }

test('commits concurrent snapshots in revision order and ignores stale revisions', async t => {
  const f = await fixture(); t.after(f.cleanup);
  const first = f.store.save(makeGuide('first'), 1);
  const second = f.store.save(makeGuide('second'), 2);
  await Promise.all([first, second]);
  const stale = await f.store.save(makeGuide('stale'), 1);
  const loaded = await f.store.list();
  assert.equal(stale.stale, true);
  assert.equal(loaded.guides[0].title, 'second');
  assert.equal(loaded.revisions['guide_test-1'], 2);
});

test('failed commit preserves the prior valid file and removes incomplete temp file', async t => {
  const f = await fixture(); t.after(f.cleanup);
  await f.store.save(makeGuide('confirmed'), 1);
  const failing = createGuideStore(f.root, { beforeRename: destination => { if (destination.endsWith('/guides/guide_test-1.json')) throw new Error('simulated disk failure'); } });
  await assert.rejects(failing.save(makeGuide('unconfirmed'), 2), /simulated disk failure/);
  const record = JSON.parse(await readFile(path.join(f.root, 'guides', 'guide_test-1.json'), 'utf8'));
  assert.equal(record.guide.title, 'confirmed');
  assert.equal((await readdir(path.join(f.root, 'guides'))).some(name => name.endsWith('.tmp')), false);
});

test('recovers a corrupt guide from the previous validated copy and quarantines the damaged original', async t => {
  const f = await fixture(); t.after(f.cleanup);
  await f.store.save(makeGuide('version 1'), 1);
  await f.store.save(makeGuide('version 2'), 2);
  await writeFile(path.join(f.root, 'guides', 'guide_test-1.json'), '{broken');
  const loaded = await f.store.list();
  assert.equal(loaded.guides[0].title, 'version 1');
  assert.equal(loaded.problems.length, 1);
  assert.equal((await readdir(path.join(f.root, 'recovery', 'corrupt'))).length, 1);
});

test('does not resurrect a deliberately deleted guide from its recovery file', async t => {
  const f = await fixture(); t.after(f.cleanup);
  await f.store.save(makeGuide(), 1);
  await f.store.save(makeGuide('newer'), 2);
  await f.store.remove('guide_test-1');
  assert.equal((await f.store.list()).guides.length, 0);
});

test('preserves a corrupt file without creating a blank guide when no backup exists', async t => {
  const f = await fixture(); t.after(f.cleanup);
  await f.store.save(makeGuide(), 1);
  await f.store.remove('guide_test-1');
  await rm(path.join(f.root, 'recovery', 'guide_test-1.bak.json'), { force: true });
  await writeFile(path.join(f.root, 'guides', 'guide_test-1.json'), '{damaged');
  const loaded = await f.store.list();
  assert.equal(loaded.guides.length, 0);
  assert.match(loaded.problems[0], /não pôde ser lido/);
  assert.equal(await readFile(path.join(f.root, 'guides', 'guide_test-1.json'), 'utf8'), '{damaged');
});

test('rejects an unsupported future storage format and will not overwrite it', async t => {
  const f = await fixture(); t.after(f.cleanup);
  await f.store.save(makeGuide(), 1);
  await writeFile(path.join(f.root, 'guides', 'guide_test-1.json'), JSON.stringify({ storageVersion: 99, revision: 10, guide: makeGuide('from future') }));
  const loaded = await f.store.list();
  assert.equal(loaded.guides.length, 0);
  await assert.rejects(f.store.save(makeGuide('old app'), 11), /Formato de armazenamento incompatível/);
  const raw = JSON.parse(await readFile(path.join(f.root, 'guides', 'guide_test-1.json'), 'utf8'));
  assert.equal(raw.storageVersion, 99);
});

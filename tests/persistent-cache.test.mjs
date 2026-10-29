import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeCardName,
  getCardRecord,
  putCardRecord,
  clearCardStorage,
  simulateReload,
  resetCardStorageForTesting
} from '../src/card-storage.js';

function createMockIndexedDB() {
  const dbs = new Map();
  return {
    _dbs: dbs,
    open(name, version) {
      const req = { result: null, error: null, onsuccess: null, onerror: null, onupgradeneeded: null, onblocked: null };
      queueMicrotask(() => {
        let dbData = dbs.get(name);
        const isUpgrade = !dbData || dbData.version < version;
        if (!dbData) {
          dbData = { version, stores: new Map() };
          dbs.set(name, dbData);
        }
        const db = {
          name,
          version,
          objectStoreNames: { contains: (s) => dbData.stores.has(s) },
          createObjectStore: (s, { keyPath }) => {
            const storeData = { keyPath, records: new Map(), indexes: new Map() };
            dbData.stores.set(s, storeData);
            return {
              createIndex: (idxName, idxKeyPath) => {
                storeData.indexes.set(idxName, idxKeyPath);
              }
            };
          },
          transaction: (storeNames, mode) => {
            const tx = {
              oncomplete: null,
              onerror: null,
              onabort: null,
              objectStore: (name) => {
                const targetStoreName = name || (typeof storeNames === 'string' ? storeNames : storeNames[0]);
                const storeData = dbData.stores.get(targetStoreName);
                return {
                  get: (key) => {
                    const r = { result: storeData.records.get(key) || null, onsuccess: null, onerror: null };
                    queueMicrotask(() => { if (r.onsuccess) r.onsuccess(); });
                    return r;
                  },
                  put: (val) => {
                    const key = val[storeData.keyPath];
                    storeData.records.set(key, val);
                    const r = { result: key, onsuccess: null, onerror: null };
                    queueMicrotask(() => {
                      if (r.onsuccess) r.onsuccess();
                      if (tx.oncomplete) tx.oncomplete();
                    });
                    return r;
                  },
                  clear: () => {
                    storeData.records.clear();
                    const r = { onsuccess: null, onerror: null };
                    queueMicrotask(() => {
                      if (r.onsuccess) r.onsuccess();
                      if (tx.oncomplete) tx.oncomplete();
                    });
                    return r;
                  }
                };
              }
            };
            return tx;
          }
        };
        req.result = db;
        if (isUpgrade && req.onupgradeneeded) req.onupgradeneeded({ target: req });
        if (req.onsuccess) req.onsuccess({ target: req });
      });
      return req;
    }
  };
}

const originalIndexedDB = globalThis.indexedDB;
const originalFetch = globalThis.fetch;

beforeEach(async () => {
  globalThis.indexedDB = createMockIndexedDB();
  resetCardStorageForTesting({ disableIndexedDB: false });
  await clearCardStorage();
});

test('1.1 & 1.2: IndexedDB persists positive and failure entries, normalizes keys, links aliases to Oracle identity', async () => {
  const cardData = {
    status: 'found',
    identity: 'oracle-lightning-bolt',
    name: 'Lightning Bolt',
    printedName: 'Raio',
    type: 'Instant',
    legalities: { pauper: 'legal' },
    legalityStatus: 'current',
    legalityPending: false,
    image: 'https://cards.scryfall.io/normal/bolt.jpg',
    art: 'https://cards.scryfall.io/art/bolt.jpg',
    savedAt: Date.now()
  };

  // Put by Portuguese queried name with surrounding whitespace and mixed case
  await putCardRecord('  RAIO  ', cardData);

  // Retrieve by normalized Portuguese key
  const retrievedPt = await getCardRecord('raio');
  assert.ok(retrievedPt);
  assert.equal(retrievedPt.identity, 'oracle-lightning-bolt');
  assert.equal(retrievedPt.name, 'Lightning Bolt');
  assert.equal(retrievedPt.key, 'raio');

  // Retrieve by English alias key
  const retrievedEn = await getCardRecord('lightning bolt');
  assert.ok(retrievedEn);
  assert.equal(retrievedEn.identity, 'oracle-lightning-bolt');

  // Failure persistence (notfound and error)
  await putCardRecord('Carta Inexistente', { status: 'notfound', name: 'Carta Inexistente', savedAt: Date.now() });
  const notFound = await getCardRecord('carta inexistente');
  assert.equal(notFound.status, 'notfound');

  await putCardRecord('Servico Offline', { status: 'error', name: 'Servico Offline', savedAt: Date.now() });
  const errorRec = await getCardRecord('servico offline');
  assert.equal(errorRec.status, 'error');
});

test('1.1: Fallback seguro para memória quando IndexedDB não está disponível', async () => {
  resetCardStorageForTesting({ disableIndexedDB: true });

  await putCardRecord('Fallback Card', {
    status: 'found',
    identity: 'fallback-id',
    name: 'Fallback Card',
    savedAt: Date.now()
  });

  const retrieved = await getCardRecord('fallback card');
  assert.ok(retrieved);
  assert.equal(retrieved.identity, 'fallback-id');
});

test('2.1 & 2.2: Reutilizar carta reconhecida após reload por até 24h sem nova requisição', async () => {
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls++;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        oracle_id: 'counterspell-oracle',
        name: 'Counterspell',
        type_line: 'Instant',
        legalities: { pauper: 'legal' },
        image_uris: { normal: 'https://cards.scryfall.io/normal/counterspell.jpg' }
      })
    };
  };

  try {
    const { findCard } = await import('../src/cards.js?session-1');
    const first = await findCard('Counterspell');
    assert.equal(first.status, 'found');
    assert.equal(first.legalityPending, false);
    assert.equal(fetchCalls, 1);

    // Simulate page reload (clears in-memory cache and map, persists IndexedDB)
    simulateReload();

    const { findCard: findCardReloaded } = await import('../src/cards.js?session-2');
    const reloaded = await findCardReloaded('Counterspell');
    assert.equal(reloaded.status, 'found');
    assert.equal(reloaded.identity, 'counterspell-oracle');
    assert.equal(reloaded.legalityPending, false);
    // Crucial: fetch was NOT called again after reload because entry is fresh (<24h)
    assert.equal(fetchCalls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('2.2: Entrada positiva expirada (>24h) mantém nome e imagem; atualiza com legalidade pendente até sucesso', async () => {
  let fetchCalls = 0;
  let networkAvailable = true;

  globalThis.fetch = async () => {
    fetchCalls++;
    if (!networkAvailable) throw new TypeError('Network offline');
    return {
      ok: true,
      status: 200,
      json: async () => ({
        oracle_id: 'stale-card-oracle',
        name: 'Stale Card',
        type_line: 'Sorcery',
        legalities: { pauper: 'banned' },
        image_uris: { normal: 'https://cards.scryfall.io/normal/stale.jpg' }
      })
    };
  };

  try {
    // Seed an expired entry (> 25 hours old)
    const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000;
    await putCardRecord('stale card', {
      status: 'found',
      identity: 'stale-card-oracle',
      name: 'Stale Card',
      type: 'Sorcery',
      legalities: { pauper: 'legal' },
      legalityStatus: 'current',
      legalityPending: false,
      image: 'https://cards.scryfall.io/normal/stale-old.jpg',
      savedAt: twentyFiveHoursAgo
    });

    simulateReload();

    // 1. With network available: update succeeds, legality updated
    const { findCard: findOnline } = await import('../src/cards.js?expired-online');
    const resultOnline = await findOnline('Stale Card');
    assert.equal(resultOnline.status, 'found');
    assert.equal(resultOnline.legalityStatus, 'current');
    assert.equal(resultOnline.legalityPending, false);
    assert.equal(resultOnline.legalities.pauper, 'banned');
    assert.equal(fetchCalls, 1);

    // 2. Now test update failure (network down):
    // Seed another expired entry
    await putCardRecord('offline stale', {
      status: 'found',
      identity: 'offline-stale-oracle',
      name: 'Offline Stale Card',
      type: 'Creature',
      legalities: { pauper: 'legal' },
      legalityStatus: 'current',
      legalityPending: false,
      image: 'https://cards.scryfall.io/normal/offline.jpg',
      savedAt: twentyFiveHoursAgo
    });

    simulateReload();
    networkAvailable = false;

    const { findCard: findOffline } = await import('../src/cards.js?expired-offline');
    const resultOffline = await findOffline('Offline Stale Card');
    // Name and image remain available, legality is pending, status is found (NOT notfound or error)
    assert.equal(resultOffline.status, 'found');
    assert.equal(resultOffline.identity, 'offline-stale-oracle');
    assert.equal(resultOffline.name, 'Offline Stale Card');
    assert.equal(resultOffline.image, 'https://cards.scryfall.io/normal/offline.jpg');
    assert.equal(resultOffline.legalityPending, true);
    assert.equal(resultOffline.legalityStatus, 'pending');

    // Does not repeat retry for the same name after failure
    const retryCallsBefore = fetchCalls;
    const secondCall = await findOffline('Offline Stale Card');
    assert.equal(secondCall.status, 'found');
    assert.equal(secondCall.legalityPending, true);
    assert.equal(fetchCalls, retryCallsBefore); // No new network call
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('2.1 & 2.4: Falha persistida (notfound e error) não repete requisição após reload; edição inicia nova consulta', async () => {
  let fetchCalls = 0;
  globalThis.fetch = async (url) => {
    fetchCalls++;
    if (url.includes('notfound')) {
      return { ok: false, status: 404 };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({
        oracle_id: 'edited-id',
        name: 'Edited Card',
        image_uris: { normal: 'https://example.test/edited.jpg' }
      })
    };
  };

  try {
    const { findCard: find1 } = await import('../src/cards.js?fail-1');
    const failRes = await find1('notfound-card');
    assert.equal(failRes.status, 'notfound');
    const callsAfterFail = fetchCalls;

    // Simulate reload
    simulateReload();

    const { findCard: findReload } = await import('../src/cards.js?fail-reload');
    const failAfterReload = await findReload('notfound-card');
    assert.equal(failAfterReload.status, 'notfound');
    // Did NOT call API again!
    assert.equal(fetchCalls, callsAfterFail);

    // Editing card name starts a new lookup
    const editedRes = await findReload('edited-card');
    assert.equal(editedRes.status, 'found');
    assert.equal(fetchCalls, callsAfterFail + 1);

    // Force retry on a failed card bypasses the stored failure and queries API (named + search fallback)
    const recoveredRes = await findReload('notfound-card', { force: true });
    assert.equal(fetchCalls, callsAfterFail + 3);
    assert.equal(recoveredRes.status, 'notfound');
    // Since mock still returns 404 for 'notfound', now test recovery when API succeeds:
    globalThis.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        oracle_id: 'recovered-id',
        name: 'Recovered Card',
        image_uris: { normal: 'https://example.test/recovered.jpg' }
      })
    });
    const successRes = await findReload('notfound-card', { force: true });
    assert.equal(successRes.status, 'found');
    assert.equal(successRes.name, 'Recovered Card');

    // Subsequent normal lookup now uses the recovered positive entry
    const subsequent = await findReload('notfound-card');
    assert.equal(subsequent.status, 'found');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('3.1: Imagens permanecem remotas e não gravam base64 em localStorage', async () => {
  const cardData = {
    status: 'found',
    identity: 'remote-img-id',
    name: 'Remote Image Card',
    image: 'https://cards.scryfall.io/normal/front/1/2/test.jpg',
    art: 'https://cards.scryfall.io/art/front/1/2/test.jpg',
    savedAt: Date.now()
  };

  await putCardRecord('Remote Image Card', cardData);
  const record = await getCardRecord('remote image card');
  assert.ok(record.image.startsWith('https://cards.scryfall.io'));
  assert.ok(!record.image.startsWith('data:image'));

  // Ensure localStorage is never touched for card image storage
  if (typeof localStorage !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k);
      assert.ok(!v.includes('data:image/'));
    }
  }
});

test('3.2: Edição e exportação continuam acessíveis quando IndexedDB está indisponível', async () => {
  resetCardStorageForTesting({ disableIndexedDB: true });

  const { emptyGuide, createNode } = await import('../src/model.js');
  const { renderGuide } = await import('../src/reading.js');
  const { validateGuide } = await import('../src/validation.js');
  const { findCard } = await import('../src/cards.js?offline-idb-export');

  // Verify finding a card still works in memory fallback
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      oracle_id: 'no-idb-card',
      name: 'Fallback Card',
      image_uris: { normal: 'https://example.test/fallback.jpg' }
    })
  });

  try {
    const card = await findCard('Fallback Card');
    assert.equal(card.status, 'found');

    // Guide creation, editing and rendering
    const guide = emptyGuide();
    guide.title = 'Guia sem IndexedDB';
    guide.deck.main = '60 [Island]';
    guide.deck.sideboard = '15 [Island]';
    const section = createNode('custom', 'Seção de teste');
    section.fields.markdown = 'Texto com [Fallback Card] e ![Fallback Card]';
    guide.sections.push(section);

    const validation = validateGuide(guide);
    assert.equal(validation.problems.length, 0);

    const rendered = renderGuide(guide);
    assert.ok(rendered.includes('Guia sem IndexedDB'));
    assert.ok(rendered.includes('Fallback Card'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('3.3: Disparar download de imagens não baixadas para o IndexedDB e reutilizar localmente', async () => {
  const {
    downloadMissingCardImages,
    findCard,
    cachedCard,
    hasImageBlob,
    getImageBlob,
    collectGuideCardNames
  } = await import('../src/cards.js?download-blobs');
  const { emptyGuide } = await import('../src/model.js');

  const imageUrl = 'https://cards.scryfall.io/normal/myr.jpg';
  const artUrl = 'https://cards.scryfall.io/art/myr-art.jpg';

  let imageFetchCalls = 0;
  globalThis.fetch = async (url) => {
    if (url.includes('cards.scryfall.io')) {
      imageFetchCalls++;
      return {
        ok: true,
        status: 200,
        blob: async () => new Blob(['fake-image-bytes'], { type: 'image/jpeg' })
      };
    }
    // Scryfall metadata API
    return {
      ok: true,
      status: 200,
      json: async () => ({
        oracle_id: 'myr-id',
        name: 'Myr Enforcer',
        image_uris: { normal: imageUrl, art_crop: artUrl }
      })
    };
  };

  try {
    // 1. Initial lookup: card has remote image URL, not yet in IndexedDB images store
    const card = await findCard('Myr Enforcer');
    assert.equal(card.status, 'found');
    assert.equal(card.remoteImage, imageUrl);
    assert.equal(await hasImageBlob(imageUrl), false);

    // 2. Guide contains Myr Enforcer
    const guide = emptyGuide();
    guide.deck.main = '4 [Myr Enforcer]\n56 [Island]';
    const names = collectGuideCardNames(guide);
    assert.ok(names.includes('Myr Enforcer'));

    // 3. Trigger download of missing images
    let progressReported = null;
    const result = await downloadMissingCardImages(names, (p) => { progressReported = p; });

    assert.ok(result.total >= 1);
    assert.ok(progressReported);
    assert.equal(progressReported.completed, progressReported.total);
    assert.equal(await hasImageBlob(imageUrl), true);
    assert.equal(await hasImageBlob(artUrl), true);

    const savedBlob = await getImageBlob(imageUrl);
    assert.ok(savedBlob instanceof Blob);

    // In-memory resolved card now points to Object URL (or has local object URL)
    const updatedCard = cachedCard('Myr Enforcer');
    assert.ok(updatedCard.image);
    assert.equal(updatedCard.remoteImage, imageUrl);

    // 4. Triggering download again does NOT re-download already stored images
    const callsBefore = imageFetchCalls;
    await downloadMissingCardImages(names);
    assert.equal(imageFetchCalls, callsBefore);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

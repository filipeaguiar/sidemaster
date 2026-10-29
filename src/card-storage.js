const DB_NAME = 'sidemaster-card-catalog';
const DB_VERSION = 2;
const STORE_CARDS = 'cards';
const STORE_IMAGES = 'images';

const memoryStore = new Map();
const memoryImageStore = new Map();
const objectUrlMap = new Map();
let dbPromise = null;
let indexedDBDisabled = false;

function openDB() {
  if (indexedDBDisabled || typeof indexedDB === 'undefined') return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_CARDS)) {
          const store = db.createObjectStore(STORE_CARDS, { keyPath: 'key' });
          store.createIndex('identity', 'identity', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_IMAGES)) {
          db.createObjectStore(STORE_IMAGES, { keyPath: 'url' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        indexedDBDisabled = true;
        resolve(null);
      };
      request.onblocked = () => {
        indexedDBDisabled = true;
        resolve(null);
      };
    } catch {
      indexedDBDisabled = true;
      resolve(null);
    }
  });

  return dbPromise;
}

export function normalizeCardName(name) {
  return (name ?? '').trim().toLowerCase();
}

export async function getCardRecord(name) {
  const key = normalizeCardName(name);
  if (!key) return null;
  if (memoryStore.has(key)) return memoryStore.get(key);

  const db = await openDB();
  if (!db) return memoryStore.get(key) || null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_CARDS, 'readonly');
      const store = tx.objectStore(STORE_CARDS);
      const req = store.get(key);
      req.onsuccess = () => {
        const result = req.result || null;
        if (result) memoryStore.set(key, result);
        resolve(result);
      };
      req.onerror = () => resolve(memoryStore.get(key) || null);
    } catch {
      resolve(memoryStore.get(key) || null);
    }
  });
}

export async function putCardRecord(name, record) {
  const key = normalizeCardName(name);
  if (!key || !record) return record;

  const entry = { ...record, key, version: 1 };
  memoryStore.set(key, entry);

  const aliases = [];
  if (record.name) {
    const aliasKey = normalizeCardName(record.name);
    if (aliasKey && aliasKey !== key) {
      const aliasEntry = { ...entry, key: aliasKey };
      aliases.push(aliasEntry);
      memoryStore.set(aliasKey, aliasEntry);
    }
  }
  if (record.printedName) {
    const printedKey = normalizeCardName(record.printedName);
    if (printedKey && printedKey !== key && printedKey !== normalizeCardName(record.name)) {
      const printedEntry = { ...entry, key: printedKey };
      aliases.push(printedEntry);
      memoryStore.set(printedKey, printedEntry);
    }
  }

  const db = await openDB();
  if (!db) return entry;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_CARDS, 'readwrite');
      const store = tx.objectStore(STORE_CARDS);
      store.put(entry);
      for (const alias of aliases) {
        store.put(alias);
      }
      tx.oncomplete = () => resolve(entry);
      tx.onerror = () => resolve(entry);
      tx.onabort = () => resolve(entry);
    } catch {
      resolve(entry);
    }
  });
}

export async function getImageBlob(url) {
  if (!url) return null;
  if (memoryImageStore.has(url)) return memoryImageStore.get(url);

  const db = await openDB();
  if (!db) return memoryImageStore.get(url) || null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_IMAGES, 'readonly');
      const store = tx.objectStore(STORE_IMAGES);
      const req = store.get(url);
      req.onsuccess = () => {
        const record = req.result;
        const blob = record?.blob || null;
        if (blob) memoryImageStore.set(url, blob);
        resolve(blob);
      };
      req.onerror = () => resolve(memoryImageStore.get(url) || null);
    } catch {
      resolve(memoryImageStore.get(url) || null);
    }
  });
}

export async function hasImageBlob(url) {
  if (!url) return false;
  if (memoryImageStore.has(url)) return true;
  const blob = await getImageBlob(url);
  return !!blob;
}

export async function putImageBlob(url, blob) {
  if (!url || !blob) return;
  memoryImageStore.set(url, blob);
  if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    try {
      const objUrl = URL.createObjectURL(blob);
      objectUrlMap.set(url, objUrl);
    } catch {}
  }

  const db = await openDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_IMAGES, 'readwrite');
      const store = tx.objectStore(STORE_IMAGES);
      store.put({ url, blob, downloadedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

export function getObjectUrlForImage(url) {
  if (!url) return null;
  if (objectUrlMap.has(url)) return objectUrlMap.get(url);
  if (memoryImageStore.has(url) && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    try {
      const obj = URL.createObjectURL(memoryImageStore.get(url));
      objectUrlMap.set(url, obj);
      return obj;
    } catch {}
  }
  return null;
}

export async function resolveImageUrl(url) {
  if (!url) return null;
  const cachedObj = getObjectUrlForImage(url);
  if (cachedObj) return cachedObj;

  const blob = await getImageBlob(url);
  if (blob && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    try {
      const obj = URL.createObjectURL(blob);
      objectUrlMap.set(url, obj);
      return obj;
    } catch {}
  }
  return url;
}

export async function clearCardStorage() {
  memoryStore.clear();
  memoryImageStore.clear();
  objectUrlMap.clear();

  const db = await openDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORE_CARDS, STORE_IMAGES], 'readwrite');
      tx.objectStore(STORE_CARDS).clear();
      tx.objectStore(STORE_IMAGES).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export function simulateReload() {
  memoryStore.clear();
  memoryImageStore.clear();
  objectUrlMap.clear();
  dbPromise = null;
}

export function resetCardStorageForTesting({ disableIndexedDB = false } = {}) {
  memoryStore.clear();
  memoryImageStore.clear();
  objectUrlMap.clear();
  dbPromise = null;
  indexedDBDisabled = disableIndexedDB;
}

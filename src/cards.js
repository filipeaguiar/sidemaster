import {
  getCardRecord,
  putCardRecord,
  normalizeCardName,
  clearCardStorage,
  simulateReload,
  resetCardStorageForTesting,
  getImageBlob,
  hasImageBlob,
  putImageBlob,
  resolveImageUrl
} from './card-storage.js';
import { parseList } from './deck.js';
import { walkNodes } from './model.js';

const cache = new Map();
const resolved = new Map();
let requestQueue = Promise.resolve();

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function request(url) {
  // Keep different cards from flooding the API when a complete guide is rendered.
  const pending = requestQueue.then(() => fetch(url, { signal: AbortSignal.timeout(10000) }));
  requestQueue = pending.catch(() => {}).then(() => new Promise(resolve => setTimeout(resolve, 110)));
  return pending;
}

function cardData(card) {
  const images = card.image_uris || card.card_faces?.[0]?.image_uris;
  const normal = images?.normal || null;
  const art = images?.art_crop || null;
  const printedName = card.printed_name || card.card_faces?.[0]?.printed_name || null;
  return {
    status: 'found',
    identity: card.oracle_id || card.id,
    name: card.name,
    printedName,
    type: card.type_line,
    legalities: card.legalities,
    legalityStatus: 'current',
    legalityPending: false,
    image: normal,
    art: art,
    remoteImage: normal,
    remoteArt: art,
    manaValue: card.cmc,
    colors: card.color_identity || []
  };
}

async function attachLocalImages(card) {
  if (!card || card.status !== 'found') return card;
  const remoteImage = card.remoteImage || card.image;
  const remoteArt = card.remoteArt || card.art;
  const localImage = remoteImage ? await resolveImageUrl(remoteImage) : null;
  const localArt = remoteArt ? await resolveImageUrl(remoteArt) : null;
  return {
    ...card,
    remoteImage,
    remoteArt,
    image: localImage || remoteImage,
    art: localArt || remoteArt
  };
}

async function fetchFromApi(name) {
  const trimmed = name.trim();
  try {
    const r = await request(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(trimmed)}`);
    if (!r.ok) {
      if (r.status === 404) {
        try {
          const response = await request(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(`lang:any !"${trimmed}"`)}`);
          if (!response.ok) {
            return { status: response.status === 404 ? 'notfound' : 'error', name };
          }
          const data = await response.json();
          const card = data.data?.[0];
          if (!card) return { status: 'notfound', name };
          return cardData(card);
        } catch {
          return { status: 'error', name };
        }
      }
      return { status: 'error', name };
    }
    const card = await r.json();
    return cardData(card);
  } catch {
    return { status: 'error', name };
  }
}

export function findCard(name, { force = false } = {}) {
  const key = normalizeCardName(name);
  if (!force && cache.has(key)) return cache.get(key);

  const pending = (async () => {
    if (!force) {
      const stored = await getCardRecord(key);
      if (stored) {
        if (stored.status === 'notfound' || stored.status === 'error') {
          return stored;
        }
        if (stored.status === 'found') {
          const age = Date.now() - (stored.savedAt || 0);
          const isFresh = age < TWENTY_FOUR_HOURS_MS;
          if (isFresh) {
            const fresh = { ...stored, legalityStatus: 'current', legalityPending: false };
            return attachLocalImages(fresh);
          }

          // Stale entry (> 24 hours):
          // Keep identity and image while updating; legality is pending.
          const staleRecord = { ...stored, legalityStatus: 'pending', legalityPending: true };
          const staleWithImages = await attachLocalImages(staleRecord);
          resolved.set(key, staleWithImages);

          if (stored.updateFailed) {
            return staleWithImages;
          }

          try {
            const updated = await fetchFromApi(name);
            if (updated.status === 'found') {
              const freshRecord = {
                ...updated,
                savedAt: Date.now(),
                legalityStatus: 'current',
                legalityPending: false,
                updateFailed: false
              };
              await putCardRecord(name, freshRecord);
              return attachLocalImages(freshRecord);
            } else {
              const failedStale = { ...staleRecord, updateFailed: true };
              await putCardRecord(name, failedStale);
              return attachLocalImages(failedStale);
            }
          } catch {
            const failedStale = { ...staleRecord, updateFailed: true };
            await putCardRecord(name, failedStale);
            return attachLocalImages(failedStale);
          }
        }
      }
    }

    const fetched = await fetchFromApi(name);
    const toSave = {
      ...fetched,
      savedAt: Date.now()
    };
    await putCardRecord(name, toSave);
    return attachLocalImages(toSave);
  })();

  cache.set(key, pending);
  pending.then(result => {
    resolved.set(key, result);
    if (result?.name) {
      resolved.set(normalizeCardName(result.name), result);
    }
    if (result?.printedName) {
      resolved.set(normalizeCardName(result.printedName), result);
    }
  });

  return pending;
}

export function cachedCard(name) {
  return resolved.get(normalizeCardName(name));
}

export function collectGuideCardNames(guide) {
  if (!guide) return [];
  const names = [];
  if (guide.deck?.main) {
    names.push(...parseList(guide.deck.main).filter(e => !e.error).map(e => e.name));
  }
  if (guide.deck?.sideboard) {
    names.push(...parseList(guide.deck.sideboard).filter(e => !e.error).map(e => e.name));
  }
  for (const { node } of walkNodes(guide.sections || [])) {
    if (node.fields?.cards) {
      names.push(...parseList(node.fields.cards).filter(e => !e.error).map(e => e.name));
    }
    const checkText = (text) => {
      if (typeof text !== 'string') return;
      for (const m of text.matchAll(/!?\[([^\]]+)\]/g)) {
        names.push(m[1].trim());
      }
    };
    if (node.fields) {
      for (const val of Object.values(node.fields)) checkText(val);
      if (node.fields.overrides) {
        for (const val of Object.values(node.fields.overrides)) checkText(val);
      }
    }
  }
  return [...new Set(names.filter(Boolean))];
}

export async function downloadMissingCardImages(cardNames, onProgress = () => {}) {
  const uniqueNames = [...new Set(cardNames.map(n => (n || '').trim()).filter(Boolean))];
  const urlsToDownload = new Set();

  for (const name of uniqueNames) {
    const card = await findCard(name);
    if (card && card.status === 'found') {
      const remoteImg = card.remoteImage || card.image;
      if (remoteImg && !(await hasImageBlob(remoteImg))) {
        urlsToDownload.add(remoteImg);
      }
      const remoteArt = card.remoteArt || card.art;
      if (remoteArt && !(await hasImageBlob(remoteArt))) {
        urlsToDownload.add(remoteArt);
      }
    }
  }

  let count = 0;
  const total = urlsToDownload.size;
  onProgress({ completed: 0, total });

  for (const url of urlsToDownload) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        await putImageBlob(url, blob);
      }
    } catch {}
    count++;
    onProgress({ completed: count, total });
  }

  for (const name of uniqueNames) {
    const key = normalizeCardName(name);
    const card = resolved.get(key);
    if (card && card.status === 'found') {
      const updated = await attachLocalImages(card);
      resolved.set(key, updated);
      cache.set(key, Promise.resolve(updated));
      if (updated.name) resolved.set(normalizeCardName(updated.name), updated);
      if (updated.printedName) resolved.set(normalizeCardName(updated.printedName), updated);
    }
  }

  return { total, downloaded: count };
}

export {
  clearCardStorage,
  simulateReload,
  resetCardStorageForTesting,
  getImageBlob,
  hasImageBlob,
  putImageBlob,
  resolveImageUrl
};

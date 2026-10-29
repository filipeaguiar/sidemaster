import { normalizeGuide, SCHEMA_VERSION } from './model.js?v=hierarchy-v3';
const KEY = 'sidemaster.guides.v1';
const desktop = globalThis.sideMasterDesktop;
let desktopSettings = {};
let localRevision = 0;
const desktopRevisions = new Map();
export let startupProblems = [];

export const repository = {
  isDesktop: !!desktop,
  desktop,
  nextRevision(guideId) { return (desktopRevisions.get(guideId) || 0) + 1; },
  async list() {
    if (desktop) {
      const result = await desktop.guides.list();
      startupProblems = result.problems || [];
      for (const [id, revision] of Object.entries(result.revisions || {})) desktopRevisions.set(id, revision);
      return (result.guides || []).map(normalizeGuide);
    }
    const raw = localStorage.getItem(KEY) || '[]';
    const guides = JSON.parse(raw);
    const normalized = guides.map(normalizeGuide);
    const migrationBackup = `${KEY}.backup-before-schema-${SCHEMA_VERSION}`;
    if (guides.some(g => (g.schemaVersion || 1) < SCHEMA_VERSION) && !localStorage.getItem(migrationBackup)) localStorage.setItem(migrationBackup, raw);
    return normalized;
  },
  async put(guide, revision) {
    if (desktop) {
      const next = revision || (desktopRevisions.get(guide.guideId) || 0) + 1;
      const result = await desktop.guides.save(guide, next);
      desktopRevisions.set(guide.guideId, result.revision || next);
      return result;
    }
    const guides = await this.list();
    const i = guides.findIndex((g) => g.guideId === guide.guideId);
    if (i < 0) guides.push(guide); else guides[i] = guide;
    localStorage.setItem(KEY, JSON.stringify(guides));
    return guide;
  },
  async delete(guideId) {
    if (desktop) return desktop.guides.delete(guideId);
    const guides = await this.list();
    return this.replace(guides.filter(g => g.guideId !== guideId));
  },
  async replace(guides) {
    if (desktop) {
      const existing = new Set((await this.list()).map(g => g.guideId));
      const incoming = new Set(guides.map(g => g.guideId));
      for (const guide of guides) if (!existing.has(guide.guideId)) await this.put(guide, ++localRevision);
      for (const id of existing) if (!incoming.has(id)) await this.delete(id);
      return guides;
    }
    localStorage.setItem(KEY, JSON.stringify(guides));
    return guides;
  },
  async loadSettings() {
    if (desktop) { desktopSettings = await desktop.settings.load(); return desktopSettings; }
    try { desktopSettings = JSON.parse(localStorage.getItem('sidemaster.desktop-settings') || '{}'); } catch { desktopSettings = {}; }
    return desktopSettings;
  },
  async saveSettings(patch) {
    desktopSettings = { ...desktopSettings, ...patch };
    if (desktop) return desktop.settings.save(desktopSettings);
    localStorage.setItem('sidemaster.desktop-settings', JSON.stringify(desktopSettings));
    return { ok: true };
  }
};

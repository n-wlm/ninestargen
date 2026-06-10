import { DEFAULT_CONFIG, type StarConfig } from '@/types/star';
import { DEFAULT_COMPOSITION, normalizeLayer, type CompositionConfig } from '@/types/composition';

// A snapshot of a design the user downloaded. Stored only in the browser
// (localStorage) — never uploaded. Cleared when the user clears browser data.
export interface HistoryEntry {
  id: string;
  date: number; // epoch ms
  mode: 'geometry' | 'images';
  format: string; // png | svg | jpg
  config: StarConfig | CompositionConfig;
  link?: string; // shareable URL — geometry only (image designs don't fit in a URL)
}

const KEY = 'nsg:history';
const MAX = 12;

// Bump when the stored shape changes in a way that needs explicit migration.
// Entries are ALSO normalized field-by-field on load (see normalizeEntry), so
// additive changes (new fields) need no version bump — old snapshots stay usable.
const SCHEMA_VERSION = 1;

interface Envelope {
  version: number;
  entries: unknown[];
}

// Make a stored entry safe to use under the *current* schema: validate the
// essentials and merge each config with current defaults so fields added in
// later app versions are present. Returns null for an unusable entry (it's
// dropped individually — a single bad entry never wipes the whole history).
function normalizeEntry(raw: unknown): HistoryEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const e = raw as Record<string, unknown>;
  if (e.mode !== 'geometry' && e.mode !== 'images') return null;
  if (!e.config || typeof e.config !== 'object') return null;
  if (typeof e.id !== 'string' || !e.id) return null;

  const date = typeof e.date === 'number' ? e.date : 0;
  const format = typeof e.format === 'string' ? e.format : 'png';
  const link = typeof e.link === 'string' ? e.link : undefined;

  let config: StarConfig | CompositionConfig;
  if (e.mode === 'geometry') {
    config = { ...DEFAULT_CONFIG, ...(e.config as Partial<StarConfig>) };
  } else {
    const c = e.config as Partial<CompositionConfig> & { layers?: unknown };
    const layers = Array.isArray(c.layers)
      ? (c.layers.map(normalizeLayer).filter(Boolean) as CompositionConfig['layers'])
      : [];
    config = { ...DEFAULT_COMPOSITION, ...c, layers };
  }

  return { id: e.id, date, mode: e.mode, format, config, link };
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Accept the versioned envelope and the legacy bare-array format.
    const list: unknown[] = Array.isArray(parsed)
      ? parsed
      : parsed && Array.isArray((parsed as Envelope).entries)
        ? (parsed as Envelope).entries
        : [];
    return list.map(normalizeEntry).filter((e): e is HistoryEntry => e !== null);
  } catch {
    return [];
  }
}

// Writes the list (versioned), trimming oldest entries until it fits the quota.
function persist(entries: HistoryEntry[]): HistoryEntry[] {
  if (typeof window === 'undefined') return entries;
  let list = entries.slice(0, MAX);
  while (list.length) {
    try {
      const envelope: Envelope = { version: SCHEMA_VERSION, entries: list };
      localStorage.setItem(KEY, JSON.stringify(envelope));
      return list;
    } catch {
      list = list.slice(0, list.length - 1); // drop the oldest (end of list)
    }
  }
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return [];
}

// Structural signature for the dedup check. Image layers carry multi-MB data-URL
// strings — serializing those in full on every download blocks the main thread,
// so long strings are folded to length + head + tail (collision-safe enough here).
function configSignature(config: StarConfig | CompositionConfig): string {
  return JSON.stringify(config, (_key, value) =>
    typeof value === 'string' && value.length > 256
      ? `${value.length}:${value.slice(0, 64)}…${value.slice(-64)}`
      : value,
  );
}

export interface AddHistoryResult {
  entries: HistoryEntry[];
  // True when entries had to be dropped because localStorage is full — the
  // caller should tell the user instead of losing history silently.
  trimmed: boolean;
}

export function addHistory(input: {
  mode: 'geometry' | 'images';
  format: string;
  config: StarConfig | CompositionConfig;
  link?: string;
}): AddHistoryResult {
  const existing = loadHistory();

  // Skip if identical to the most recent entry (e.g. downloading several formats
  // of the same design) — just refresh its timestamp/format instead.
  const last = existing[0];
  const same =
    last && last.mode === input.mode && configSignature(last.config) === configSignature(input.config);

  const stamp = typeof Date !== 'undefined' ? Date.now() : 0;
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `h-${stamp}`;

  const next: HistoryEntry[] = same
    ? [{ ...last, date: stamp, format: input.format, link: input.link }, ...existing.slice(1)]
    : [{ id, date: stamp, ...input }, ...existing];

  const entries = persist(next);
  return { entries, trimmed: entries.length < Math.min(next.length, MAX) };
}

export function removeHistory(id: string): HistoryEntry[] {
  return persist(loadHistory().filter((e) => e.id !== id));
}

export function clearHistory(): HistoryEntry[] {
  return persist([]);
}

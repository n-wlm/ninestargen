const KEY = 'nsg:recent-colors';
const MAX_RECENT = 8;

const HEX_RE = /^#[0-9A-F]{6}$/i;

export function loadRecentColors(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((c): c is string => typeof c === 'string' && HEX_RE.test(c))
      .slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function pushRecentColor(hex: string): void {
  if (typeof window === 'undefined') return;
  const norm = hex.toUpperCase();
  if (!HEX_RE.test(norm)) return;
  const next = [norm, ...loadRecentColors().filter((c) => c !== norm)].slice(0, MAX_RECENT);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // best-effort: losing recent colors on a full storage is acceptable
  }
}

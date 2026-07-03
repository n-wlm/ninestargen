// Bump APP_VERSION with each user-visible release and add an entry below
// (newest first, keep roughly the last five). The header shows a dot while
// the visitor's last seen version is older than APP_VERSION.
export const APP_VERSION = '1.1.0';

export interface ChangelogEntry {
  version: string;
  date: string; // ISO, e.g. '2026-07-03'
  title: string;
  items: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.1.0',
    date: '2026-07-03',
    title: 'Smarter color picker',
    items: [
      'Every color swatch now opens a picker with 20 curated preset colors.',
      'Your recently used colors are remembered across visits.',
      'The native color picker and hex input are still one click away.',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-06-10',
    title: 'ninestar.app launch',
    items: [
      'Geometry mode with six nine-pointed star types, fills, strokes and effects.',
      'Images mode: arrange your own images into a nine-fold mandala with layers.',
      'PNG, SVG and JPG export up to 4K, shareable links and a local design history.',
    ],
  },
];

const KEY = 'nsg:version-seen';

export function hasUnseenChanges(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(KEY) !== APP_VERSION;
  } catch {
    return false;
  }
}

export function markChangesSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, APP_VERSION);
  } catch {
    // best-effort: without storage the dot simply shows again next visit
  }
}

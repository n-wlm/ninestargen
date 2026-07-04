// Versioning — MAJOR.FEATURE.PATCH (see docs/sections/60-ui-design.md):
//   • MAJOR  (1st) — sweeping overhauls that redefine the app.
//   • FEATURE (2nd) — a notable new capability (a mode, a system, a redesign).
//   • PATCH  (3rd) — everything else, numbered straight up (…1.2.1, 1.2.2, …1.2.15).
// Reconstructed from the git history: geometry-only launch = 1.0, adding Images
// mode = 1.1, the layers + layout + performance release = 1.2. The early ad-hoc
// v0.x/v1.x commit tags predate this scheme and roll up into 1.0.
//
// On each user-visible release: bump APP_VERSION to match and add a CHANGELOG
// entry below (newest first). The header shows a dot while the visitor's last
// seen version is older than APP_VERSION.
export const APP_VERSION = '1.2.0';

export interface ChangelogEntry {
  version: string;
  date: string; // ISO, e.g. '2026-07-03'
  title: string;
  items: string[];
}

// Newest first — CHANGELOG[0] is the current release (shown expanded in the
// dialog; the rest sit behind "Show full changelog").
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.2.0',
    date: '2026-07-04',
    title: 'Layers, a fresh layout & a big speed-up',
    items: [
      'Stack multiple stars — or images — in layers to build richer, compound designs.',
      'A redesigned layout: the Geometry / Images switch and your History, Share and Download actions moved up into a new top bar, with layers in their own floating panel.',
      'A refreshed template gallery and a bigger color picker with soft pastels and recent colors.',
      'A big performance pass, so editing stays smooth even with many layers.',
      'Minor visual improvements and polish throughout.',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-06-10',
    title: 'Images mode',
    items: [
      'Turn your own images (SVG, PNG or JPG) into a nine-fold kaleidoscopic mandala.',
      'Arrange several image layers, each with its own size, distance, rotation and mirroring.',
      'Compositions are kept in your local history so you can restore them later.',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-03-24',
    title: 'ninestar.app launch',
    items: [
      'Design nine-pointed stars: six star types with fills, gradients, strokes and effects.',
      'Export as PNG, SVG or JPG, all the way up to 4K.',
      'Shareable links that encode your whole design, plus a local design history.',
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

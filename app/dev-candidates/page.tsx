'use client';

// TEMPORARY proposal gallery for the 2026-07 template curation — deleted
// together with lib/preset-candidates.ts once the owner has picked.
import StarPreview from '@/components/StarPreview';
import { PRESETS, type Preset } from '@/lib/presets';
import { PRESET_CANDIDATES } from '@/lib/preset-candidates';

const KEEP = new Set([
  'classic-bahai', 'watercolor-petal', 'outline-enneagram', 'earth-tones',
  'linked-petals', 'indigo-solid', 'golden-kite',
]);

function Card({ preset }: { preset: Preset }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-square rounded-xl border border-[#EAECF0] bg-white overflow-hidden shadow-sm">
        <StarPreview config={preset.config} className="w-full h-full" />
      </div>
      <div className="flex items-baseline justify-between px-0.5">
        <span className="text-[13px] font-medium text-[#111827]">{preset.name}</span>
        <span className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">{preset.category}</span>
      </div>
    </div>
  );
}

export default function DevCandidatesPage() {
  const kept = PRESETS.filter((p) => KEEP.has(p.id));

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-[#FAFAFB]">
      <div className="px-8 py-10 flex flex-col gap-10 max-w-5xl mx-auto">
      <section className="flex flex-col gap-4">
        <h1 className="text-[18px] font-semibold text-[#111827]">Template curation — proposal gallery</h1>
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[#6B7280]">Kandidaten (13) — Auswahl treffen</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {PRESET_CANDIDATES.map((p) => <Card key={p.id} preset={p} />)}
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[#6B7280]">Bestand (bleibt)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {kept.map((p) => <Card key={p.id} preset={p} />)}
        </div>
      </section>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import PresetCard from '@/components/gallery/PresetCard';
import { PRESETS, PRESET_CATEGORIES } from '@/lib/presets';

export const metadata: Metadata = {
  title: "Star Gallery | Nine-Pointed Star Presets | ninestar.app",
  description:
    "Browse and download ready-made nine-pointed star designs. Click any preset to customize it in the editor. Classic Bahá'í stars, modern gradients, geometric patterns, and artistic styles.",
};

export default function GalleryPage() {
  return (
    <div className="flex flex-col flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Generator
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-xs text-gray-700 font-medium">Gallery</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Star Gallery</h1>
        <p className="text-sm text-gray-500 mt-1">
          Click any preset to open it in the editor and customize it.
        </p>
      </div>

      {/* Category sections */}
      {PRESET_CATEGORIES.map((category) => {
        const categoryPresets = PRESETS.filter((p) => p.category === category);
        if (categoryPresets.length === 0) return null;
        return (
          <section key={category} className="mb-10">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 capitalize">
              {category}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {categoryPresets.map((preset) => (
                <PresetCard key={preset.id} preset={preset} />
              ))}
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <div className="mt-4 text-center py-10 border-t border-gray-100">
        <p className="text-sm text-gray-500 mb-3">Want to start from scratch?</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors shadow-sm"
        >
          Open Generator
        </Link>
      </div>
    </div>
  );
}

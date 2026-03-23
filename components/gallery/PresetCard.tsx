'use client';

import Link from 'next/link';
import StarPreview from '@/components/StarPreview';
import { configToParams } from '@/lib/url-params';
import type { Preset } from '@/lib/presets';

interface PresetCardProps {
  preset: Preset;
}

const CATEGORY_COLORS: Record<string, string> = {
  classic: 'bg-amber-50 text-amber-700 border-amber-200',
  modern: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  decorative: 'bg-pink-50 text-pink-700 border-pink-200',
  geometric: 'bg-blue-50 text-blue-700 border-blue-200',
  artistic: 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function PresetCard({ preset }: PresetCardProps) {
  const params = configToParams(preset.config).toString();
  const href = params ? `/?${params}` : '/';

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Star preview */}
      <div className="aspect-square bg-gray-50 p-4 flex items-center justify-center group-hover:bg-indigo-50/30 transition-colors">
        <StarPreview
          config={preset.config}
          className="w-full h-full"
        />
      </div>

      {/* Info */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-800 truncate">{preset.name}</span>
        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[preset.category] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
          {preset.category}
        </span>
      </div>
    </Link>
  );
}

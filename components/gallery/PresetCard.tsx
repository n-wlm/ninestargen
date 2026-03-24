'use client';

import Link from 'next/link';
import StarPreview from '@/components/StarPreview';
import { configToParams } from '@/lib/url-params';
import { normalizePresetConfig } from '@/lib/preset-normalization';
import type { Preset } from '@/lib/presets';

interface PresetCardProps {
  preset: Preset;
}

export default function PresetCard({ preset }: PresetCardProps) {
  const previewConfig = normalizePresetConfig(preset.config);
  const params = configToParams(previewConfig).toString();
  const href = params ? `/?${params}` : '/';

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Star preview */}
      <div className="aspect-square bg-white p-4 flex items-center justify-center">
        <StarPreview
          config={previewConfig}
          className="w-full h-full"
        />
      </div>

      {/* Info */}
      <div className="px-3 py-2.5 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-800 truncate">{preset.name}</span>
      </div>
    </Link>
  );
}

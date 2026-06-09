'use client';

import { ImagePlus } from 'lucide-react';

// Larger 9-dot ring hinting at the nine-fold layout.
function NineFoldGlyph() {
  const dots = Array.from({ length: 9 }, (_, i) => {
    const a = -Math.PI / 2 + (i / 9) * Math.PI * 2;
    return { cx: 32 + 22 * Math.cos(a), cy: 32 + 22 * Math.sin(a) };
  });
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0" aria-hidden="true">
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={5} fill={i === 0 ? '#5E6AD2' : '#C7D2FE'} />
      ))}
    </svg>
  );
}

export default function ImageEmptyState({ onAddImage }: { onAddImage: () => void }) {
  return (
    <div className="max-w-md w-full mx-auto text-center px-8 py-10 rounded-2xl bg-white/95 backdrop-blur border border-[#EAECF0] shadow-xl flex flex-col items-center gap-4">
      <NineFoldGlyph />
      <h2 className="text-[20px] lg:text-[22px] font-semibold text-[#111827] tracking-tight">
        Turn one image into a nine-fold star
      </h2>
      <p className="text-[14px] lg:text-[15px] text-[#6B7280] leading-relaxed">
        Upload an SVG, PNG or JPG. Each image becomes a layer that&apos;s repeated nine times around a
        center to build a mandala. Stack several layers and tune size, distance, rotation and
        mirroring for each one.
      </p>
      <button
        onClick={onAddImage}
        className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#5E6AD2] hover:bg-[#4F5BBF] text-white text-[14px] font-semibold shadow-sm transition-colors"
      >
        <ImagePlus className="w-4 h-4" />
        Add image
      </button>
    </div>
  );
}

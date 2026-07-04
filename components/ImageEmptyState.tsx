'use client';

// 9-dot ring hinting at the nine-fold layout. Sized down on small screens.
function NineFoldGlyph() {
  const dots = Array.from({ length: 9 }, (_, i) => {
    const a = -Math.PI / 2 + (i / 9) * Math.PI * 2;
    return { cx: 32 + 22 * Math.cos(a), cy: 32 + 22 * Math.sin(a) };
  });
  return (
    <svg viewBox="0 0 64 64" className="shrink-0 w-9 h-9 lg:w-16 lg:h-16" aria-hidden="true">
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={5} fill={i === 0 ? 'var(--nsg-accent)' : 'var(--nsg-accent-ring)'} />
      ))}
    </svg>
  );
}

export default function ImageEmptyState() {
  return (
    <div className="max-w-md w-full mx-auto text-center px-5 py-4 lg:px-8 lg:py-10 rounded-xl lg:rounded-2xl bg-white/95 backdrop-blur border border-[#EAECF0] shadow-xl flex flex-col items-center gap-2 lg:gap-4 overflow-y-auto max-h-full">
      <NineFoldGlyph />
      <h2 className="text-[15px] lg:text-[22px] font-semibold text-[#111827] tracking-tight leading-snug">
        Turn one image into a nine-fold star
      </h2>
      <p className="text-[12px] lg:text-[15px] text-[#6B7280] leading-relaxed">
        Upload an SVG, PNG or JPG. It&apos;s repeated nine times into a mandala —
        <span className="hidden lg:inline"> stack several layers and tune size, distance, rotation and mirroring for each one.</span>
        <span className="lg:hidden"> stack layers and tweak each one.</span>
      </p>
      <p className="text-[12px] lg:text-[13px] text-[#9CA3AF]">
        Add your first image in the Layers panel.
      </p>
    </div>
  );
}

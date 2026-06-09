'use client';

// Shared control primitives used by both the geometry ControlPanel and the
// image-mode ImageControlPanel. Extracted so both panels stay visually identical.

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#F3F4F6]">
      <div className="px-4 py-2.5 lg:py-2 bg-[#F9FAFB] border-b border-[#F3F4F6]">
        <p className="text-[12px] lg:text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">{title}</p>
      </div>
      <div className="px-4 py-4 lg:py-3 flex flex-col gap-4 lg:gap-3.5">{children}</div>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-md bg-[#F3F4F6] p-0.5 gap-0.5">
      {options.map(({ value: v, label }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`flex-1 py-2 lg:py-1 text-[13px] lg:text-[11px] rounded font-medium transition-all ${
            value === v
              ? 'bg-white text-[#111827] shadow-sm'
              : 'text-[#6B7280] hover:text-[#374151]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] lg:text-[11px] font-medium text-[#6B7280]">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`rounded-full transition-all relative shrink-0 ${value ? 'bg-[#5E6AD2]' : 'bg-[#D1D5DB]'}`}
        style={{ height: '18px', width: '32px' }}
      >
        <span
          className="absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all"
          style={{ left: value ? '14px' : '2px' }}
        />
      </button>
    </div>
  );
}

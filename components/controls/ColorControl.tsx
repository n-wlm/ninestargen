'use client';

import type { StarConfig } from '@/types/star';

interface ColorControlProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  showOpacity?: boolean;
  opacity?: number;
  onOpacityChange?: (v: number) => void;
}

export function ColorControl({ label, value, onChange, showOpacity, opacity = 1, onOpacityChange }: ColorControlProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">{label}</span>
      )}
      <div className="flex items-center gap-2">
        <label className="relative cursor-pointer group/swatch">
          <span
            className="block w-7 h-7 rounded-md border border-black/10 shadow-sm"
            style={{ background: value }}
          />
          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/swatch:opacity-100 transition-opacity">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="drop-shadow-sm">
              <path d="M6.5 1.5l2 2-5 5H1.5v-2l5-5z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
          </span>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </label>
        <span className="text-[11px] font-mono text-[#6B7280] uppercase tracking-wide">{value}</span>
        {showOpacity && onOpacityChange && (
          <div className="flex items-center gap-1.5 ml-auto">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={opacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="w-16 h-1 accent-[#5E6AD2] cursor-pointer"
            />
            <span className="text-[11px] font-mono text-[#9CA3AF] w-8 text-right">{Math.round(opacity * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface GradientBuilderProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  direction: StarConfig['gradientDirection'];
  onDirectionChange: (d: StarConfig['gradientDirection']) => void;
}

const DIR_OPTIONS: { value: StarConfig['gradientDirection']; label: string }[] = [
  { value: 'to-bottom', label: '↓' },
  { value: 'to-right', label: '→' },
  { value: 'to-bottom-right', label: '↘' },
  { value: 'to-top-right', label: '↗' },
];

export function GradientBuilder({ colors, onChange, direction, onDirectionChange, isRadial = false }: GradientBuilderProps & { isRadial?: boolean }) {
  const updateColor = (i: number, color: string) => {
    const next = [...colors];
    next[i] = color;
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Direction — linear only */}
      {!isRadial && (
      <div className="flex items-center gap-1">
        {DIR_OPTIONS.map((d) => (
          <button
            key={d.value}
            onClick={() => onDirectionChange(d.value)}
            className={`w-7 h-7 rounded-md text-sm font-medium transition-all ${
              direction === d.value
                ? 'bg-[#EEF2FF] text-[#5E6AD2] ring-1 ring-inset ring-[#C7D2FE]'
                : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#374151]'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
      )}

      {/* Preview bar */}
      <div
        className="h-5 rounded-md border border-black/5"
        style={{ background: `linear-gradient(to right, ${colors.join(', ')})` }}
      />

      {/* Color stops */}
      <div className="flex flex-col gap-1.5">
        {colors.map((color, i) => (
          <div key={i} className="flex items-center gap-2">
            <label className="relative cursor-pointer group/swatch">
              <span
                className="block w-6 h-6 rounded border border-black/10 shadow-sm"
                style={{ background: color }}
              />
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/swatch:opacity-100 transition-opacity">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none" className="drop-shadow-sm">
                  <path d="M6.5 1.5l2 2-5 5H1.5v-2l5-5z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
              </span>
              <input
                type="color"
                value={color}
                onChange={(e) => updateColor(i, e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </label>
            <span className="text-[11px] font-mono text-[#6B7280] uppercase flex-1">{color}</span>
            {colors.length > 2 && (
              <button
                onClick={() => onChange(colors.filter((_, idx) => idx !== i))}
                className="text-[#D1D5DB] hover:text-[#EF4444] text-xs leading-none"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {colors.length < 5 && (
        <button
          onClick={() => onChange([...colors, '#ffffff'])}
          className="text-[11px] text-[#9CA3AF] hover:text-[#5E6AD2] font-medium transition-colors text-left"
        >
          + Add stop
        </button>
      )}
    </div>
  );
}

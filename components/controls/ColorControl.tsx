'use client';

import { useRef, useState } from 'react';
import { ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, type LucideIcon } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SWATCH_COLORS } from '@/lib/color-palettes';
import { loadRecentColors, pushRecentColor } from '@/lib/recent-colors';
import type { StarConfig } from '@/types/star';

// Accepts "#abc", "abc", "#aabbcc", "aabbcc" → "#AABBCC"; null if invalid.
function normalizeHex(raw: string): string | null {
  let s = raw.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(s)) s = s.split('').map((c) => c + c).join('');
  if (/^[0-9a-fA-F]{6}$/.test(s)) return '#' + s.toUpperCase();
  return null;
}

// Editable hex field — type or paste a code, committed on Enter/blur.
function HexInput({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  // Local text state mirrors the committed color; reset it during render when
  // the model changes (React's documented alternative to setState-in-effect).
  const [text, setText] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setText(value);
  }

  function commit() {
    const next = normalizeHex(text);
    if (next) onChange(next);
    else setText(value);
  }

  return (
    <input
      type="text"
      value={text}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          commit();
          (e.target as HTMLInputElement).blur();
        }
      }}
      className={className}
    />
  );
}

function MiniSwatch({ color, current, onPick }: { color: string; current: string; onPick: (c: string) => void }) {
  const selected = color.toUpperCase() === current.toUpperCase();

  return (
    <button
      type="button"
      title={color}
      aria-label={`Color ${color}`}
      onClick={() => onPick(color)}
      className={`h-7 w-7 lg:h-6 lg:w-6 rounded-md border border-black/10 transition-transform hover:scale-110 ${
        selected ? 'ring-2 ring-[var(--nsg-accent)] ring-offset-1' : ''
      }`}
      style={{ background: color }}
    />
  );
}

// Swatch that opens the shared color popover: curated presets, recent colors
// (localStorage), and the native picker + hex field as the custom fallback.
function ColorSwatchButton({ value, onChange, swatchClass, iconSize }: {
  value: string;
  onChange: (v: string) => void;
  swatchClass: string;
  iconSize: number;
}) {
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  // Only colors the user actually changed count as "recent".
  const openedWith = useRef(value);

  function handleOpenChange(next: boolean) {
    if (next) {
      openedWith.current = value;
      setRecent(loadRecentColors());
    } else if (value !== openedWith.current) {
      pushRecentColor(value);
    }
    setOpen(next);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger aria-label={`Choose color (current ${value})`} className="relative block cursor-pointer group/swatch">
        <span className={`block ${swatchClass} rounded-md border border-black/10 shadow-sm`} style={{ background: value }} />
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/swatch:opacity-100 transition-opacity">
          <svg width={iconSize} height={iconSize} viewBox="0 0 10 10" fill="none" className="drop-shadow-sm">
            <path d="M6.5 1.5l2 2-5 5H1.5v-2l5-5z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        </span>
      </PopoverTrigger>
      <PopoverContent className="p-2.5 flex flex-col gap-2.5">
        <div className="grid grid-cols-5 gap-1.5">
          {SWATCH_COLORS.map((c) => (
            <MiniSwatch key={c} color={c} current={value} onPick={onChange} />
          ))}
        </div>
        {recent.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">Recent</span>
            <div className="flex flex-wrap gap-1.5">
              {recent.map((c) => (
                <MiniSwatch key={c} color={c} current={value} onPick={onChange} />
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 pt-2 border-t border-[#F3F4F6]">
          <label className="relative shrink-0 cursor-pointer" title="Custom color">
            <span
              className="block h-7 w-7 lg:h-6 lg:w-6 rounded-md border border-black/10 shadow-sm"
              style={{ background: 'conic-gradient(from 180deg, #EF4444, #F59E0B, #10B981, #0EA5E9, #8B5CF6, #EC4899, #EF4444)' }}
            />
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
          <HexInput
            value={value}
            onChange={onChange}
            className="flex-1 min-w-0 text-[12px] lg:text-[11px] font-mono text-[#6B7280] uppercase tracking-wide bg-transparent border-b border-transparent hover:border-[#E5E7EB] focus:border-[var(--nsg-accent)] focus:outline-none py-0.5 transition-colors"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

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
        <span className="text-[12px] lg:text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">{label}</span>
      )}
      <div className="flex items-center gap-2.5 lg:gap-2">
        <ColorSwatchButton value={value} onChange={onChange} swatchClass="w-9 h-9 lg:w-7 lg:h-7" iconSize={11} />
        <HexInput
          value={value}
          onChange={onChange}
          className="w-[72px] lg:w-[68px] text-[12px] lg:text-[11px] font-mono text-[#6B7280] uppercase tracking-wide bg-transparent border-b border-transparent hover:border-[#E5E7EB] focus:border-[var(--nsg-accent)] focus:outline-none py-0.5 transition-colors"
        />
        {showOpacity && onOpacityChange && (
          <div className="flex items-center gap-1.5 ml-auto">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={opacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              className="w-20 lg:w-16 h-1 accent-[var(--nsg-accent)] cursor-pointer"
            />
            <span className="text-[12px] lg:text-[11px] font-mono text-[#9CA3AF] w-9 lg:w-8 text-right">{Math.round(opacity * 100)}%</span>
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
  isRadial?: boolean;
}

const DIR_OPTIONS: { value: StarConfig['gradientDirection']; icon: LucideIcon; ariaLabel: string }[] = [
  { value: 'to-bottom', icon: ArrowDown, ariaLabel: 'Gradient direction: down' },
  { value: 'to-right', icon: ArrowRight, ariaLabel: 'Gradient direction: right' },
  { value: 'to-bottom-right', icon: ArrowDownRight, ariaLabel: 'Gradient direction: down-right' },
  { value: 'to-top-right', icon: ArrowUpRight, ariaLabel: 'Gradient direction: up-right' },
];

export function GradientBuilder({ colors, onChange, direction, onDirectionChange, isRadial = false }: GradientBuilderProps) {
  const updateColor = (i: number, color: string) => {
    const next = [...colors];
    next[i] = color;
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Direction — linear only */}
      {!isRadial && (
        <div className="flex items-center gap-1.5 lg:gap-1">
          {DIR_OPTIONS.map((d) => {
            const Icon = d.icon;

            return (
              <button
                key={d.value}
                type="button"
                onClick={() => onDirectionChange(d.value)}
                aria-label={d.ariaLabel}
                title={d.ariaLabel}
                className={`inline-flex w-9 h-9 lg:w-7 lg:h-7 items-center justify-center rounded-md transition-all ${
                direction === d.value
                  ? 'bg-[var(--nsg-accent-soft)] text-[var(--nsg-accent)] ring-1 ring-inset ring-[var(--nsg-accent-ring)]'
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#374151]'
                }`}
              >
                <Icon aria-hidden="true" className="h-[18px] w-[18px] lg:h-[14px] lg:w-[14px] pointer-events-none" strokeWidth={2.25} />
              </button>
            );
          })}
        </div>
      )}

      {/* Preview bar */}
      <div
        className="h-6 lg:h-5 rounded-md border border-black/5"
        style={{ background: `linear-gradient(to right, ${colors.join(', ')})` }}
      />

      {/* Color stops */}
      <div className="flex flex-col gap-2 lg:gap-1.5">
        {colors.map((color, i) => (
          <div key={i} className="flex items-center gap-2.5 lg:gap-2">
            <ColorSwatchButton
              value={color}
              onChange={(v) => updateColor(i, v)}
              swatchClass="w-8 h-8 lg:w-6 lg:h-6"
              iconSize={9}
            />
            <HexInput
              value={color}
              onChange={(v) => updateColor(i, v)}
              className="flex-1 min-w-0 text-[12px] lg:text-[11px] font-mono text-[#6B7280] uppercase bg-transparent border-b border-transparent hover:border-[#E5E7EB] focus:border-[var(--nsg-accent)] focus:outline-none py-0.5 transition-colors"
            />
            {colors.length > 2 && (
              <button
                onClick={() => onChange(colors.filter((_, idx) => idx !== i))}
                className="text-[#D1D5DB] hover:text-[#EF4444] text-sm lg:text-xs leading-none p-1 lg:p-0"
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
          className="text-[13px] lg:text-[11px] text-[#9CA3AF] hover:text-[var(--nsg-accent)] font-medium transition-colors text-left py-0.5"
        >
          + Add stop
        </button>
      )}
    </div>
  );
}

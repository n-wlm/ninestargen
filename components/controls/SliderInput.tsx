"use client";

import { memo, useState } from "react";
import { Slider } from "@/components/ui/slider";

// Strips non-numeric characters and returns the typed number as-is (1:1 units).
export const stripNumber = (raw: string) => parseFloat(raw.replace(/[^0-9.\-]/g, ""));
// Inverse of a `${Math.round(v * 100)}%` formatter: typed "50" → 0.5.
export const parsePercent = (raw: string) => stripNumber(raw) / 100;

// Stable module-level formatters — passing an inline `format={(v)=>…}` defeats
// SliderInput's memo (new identity every render), so use these shared ones.
export const fmtDeg = (v: number) => `${Math.round(v)}°`;
export const fmtInt = (v: number) => String(Math.round(v));
export const fmtPct = (v: number) => `${Math.round(v * 100)}%`;
export const fmtRatio = (v: number) => v.toFixed(2);
export const fmtPx = (v: number) => `${v}px`;

interface SliderInputProps {
  label: string;
  tooltip?: string;
  value: number;
  defaultValue: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  /** Inverse of `format` — converts the typed display string back to a model value. */
  parse?: (raw: string) => number;
  /** Magnetic snap targets (model units) applied while dragging the slider. */
  snap?: number[];
  onChange: (v: number) => void;
  disabled?: boolean;
  /** Shown in place of the value when disabled, explaining why. */
  disabledHint?: string;
  resetLabel?: string;
}

function SliderInput({
  label,
  tooltip,
  value,
  defaultValue,
  min,
  max,
  step = 1,
  format,
  parse,
  snap,
  onChange,
  disabled,
  disabledHint = 'Not for this shape',
  resetLabel,
}: SliderInputProps) {
  const formatted = format
    ? format(value)
    : String(step < 1 ? value.toFixed(2) : Math.round(value));

  // Local text state mirrors the model value; reset it during render when the
  // model changes (React's documented alternative to setState-in-effect).
  const [inputVal, setInputVal] = useState(formatted);
  const [prevFormatted, setPrevFormatted] = useState(formatted);
  if (formatted !== prevFormatted) {
    setPrevFormatted(formatted);
    setInputVal(formatted);
  }

  const isModified = Math.abs(value - defaultValue) > step * 0.01;

  function commitInput(raw: string) {
    const num = parse ? parse(raw) : stripNumber(raw);
    if (!isNaN(num)) {
      onChange(num);
    } else {
      setInputVal(format ? format(value) : String(value));
    }
  }

  // Snap to the nearest target if the dragged value lands within a small threshold.
  function applySnap(v: number): number {
    if (!snap || snap.length === 0) return v;
    const threshold = (max - min) * 0.02;
    let best = v;
    let bestDist = Infinity;
    for (const s of snap) {
      const d = Math.abs(s - v);
      if (d < bestDist) {
        bestDist = d;
        best = s;
      }
    }
    return bestDist <= threshold ? best : v;
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2 lg:mb-1.5">
        <div className="flex items-center gap-2 min-h-[22px]">
          <span className={`text-[13px] lg:text-[11px] font-medium tracking-wide uppercase select-none flex items-center gap-1 ${disabled ? "text-[#9CA3AF]" : "text-[#6B7280]"}`}>
            {label}
            {tooltip && (
              <span
                title={tooltip}
                className="text-[#D1D5DB] hover:text-[#9CA3AF] transition-colors cursor-default text-[11px] lg:text-[10px] leading-none"
              >
                ⓘ
              </span>
            )}
          </span>
          {resetLabel && (
            <button
              onClick={() => onChange(defaultValue)}
              aria-hidden={!isModified}
              tabIndex={isModified ? 0 : -1}
              className={`px-2 py-1 rounded-md border text-[10px] font-semibold transition-colors leading-none ${
                isModified
                  ? "border-amber-200 bg-amber-50 text-amber-700 hover:text-amber-800 hover:border-amber-300 hover:bg-amber-100 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
                  : "border-transparent bg-transparent text-transparent pointer-events-none select-none shadow-none"
              }`}
            >
              {resetLabel}
            </button>
          )}
        </div>
        {disabled ? (
          <span className="text-[11px] lg:text-[10px] text-[#9CA3AF] italic whitespace-nowrap min-h-[22px] flex items-center">
            {disabledHint}
          </span>
        ) : (
          <div className="flex items-center gap-1.5 min-h-[22px]">
            <input
              type="text"
              value={inputVal}
              inputMode="numeric"
              onChange={(e) => setInputVal(e.target.value)}
              onBlur={(e) => commitInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  commitInput((e.target as HTMLInputElement).value);
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  onChange(value + step);
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  onChange(value - step);
                }
              }}
              className="w-16 lg:w-14 text-right text-[13px] lg:text-[11px] font-mono text-[#111827] bg-transparent border-b border-transparent hover:border-[#E5E7EB] focus:border-[var(--nsg-accent)] focus:outline-none py-0 leading-none transition-colors"
            />
            {isModified && !resetLabel && (
              <button
                onClick={() => onChange(defaultValue)}
                title="Reset to default"
                className="text-[#9CA3AF] hover:text-[var(--nsg-accent)] transition-colors leading-none text-sm lg:text-xs ml-0.5"
              >
                ↺
              </button>
            )}
          </div>
        )}
      </div>
      <div className={disabled ? "opacity-35 pointer-events-none select-none" : ""}>
        <Slider
          min={min}
          max={max}
          step={step}
          value={[Math.min(max, Math.max(min, value))]}
          onValueChange={(v) => onChange(applySnap(Array.isArray(v) ? v[0] : v))}
          className="w-full"
        />
      </div>
    </div>
  );
}

// Memoized so a single-field edit only re-renders that one slider — provided the
// parent passes STABLE onChange/format/snap (see the module-level formatters and
// the per-key handler caches in the control panels).
export default memo(SliderInput);

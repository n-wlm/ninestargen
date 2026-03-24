"use client";

import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

interface SliderInputProps {
  label: string;
  tooltip?: string;
  value: number;
  defaultValue: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
  disabled?: boolean;
  resetLabel?: string;
}

export default function SliderInput({
  label,
  tooltip,
  value,
  defaultValue,
  min,
  max,
  step = 1,
  format,
  onChange,
  disabled,
  resetLabel,
}: SliderInputProps) {
  const [inputVal, setInputVal] = useState(String(value));
  const isModified = Math.abs(value - defaultValue) > step * 0.01;

  useEffect(() => {
    setInputVal(
      format
        ? format(value)
        : String(step < 1 ? value.toFixed(2) : Math.round(value)),
    );
  }, [value, format, step]);

  function commitInput(raw: string) {
    const stripped = raw.replace(/[^0-9.\-]/g, "");
    const num = parseFloat(stripped);
    if (!isNaN(num)) {
      onChange(num);
    } else {
      setInputVal(format ? format(value) : String(value));
    }
  }

  return (
    <div
      className={`group ${disabled ? "opacity-35 pointer-events-none select-none" : ""}`}
    >
      <div className="flex items-center justify-between mb-2 lg:mb-1.5">
        <div className="flex items-center gap-2 min-h-[22px]">
          <span className="text-[13px] lg:text-[11px] font-medium text-[#6B7280] tracking-wide uppercase select-none flex items-center gap-1">
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
            className="w-16 lg:w-14 text-right text-[13px] lg:text-[11px] font-mono text-[#111827] bg-transparent border-b border-transparent hover:border-[#E5E7EB] focus:border-[#5E6AD2] focus:outline-none py-0 leading-none transition-colors"
          />
          {isModified && !resetLabel && (
            <button
              onClick={() => onChange(defaultValue)}
              title="Reset to default"
              className="text-[#9CA3AF] hover:text-[#5E6AD2] transition-colors leading-none text-sm lg:text-xs ml-0.5"
            >
              ↺
            </button>
          )}
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[Math.min(max, Math.max(min, value))]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        className="w-full"
      />
    </div>
  );
}

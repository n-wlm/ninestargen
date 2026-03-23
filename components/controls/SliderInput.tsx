'use client';

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';

interface SliderInputProps {
  label: string;
  value: number;
  defaultValue: number;
  min: number;
  max: number;
  step?: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}

export default function SliderInput({
  label,
  value,
  defaultValue,
  min,
  max,
  step = 1,
  format,
  onChange,
}: SliderInputProps) {
  const [inputVal, setInputVal] = useState(String(value));
  const isModified = Math.abs(value - defaultValue) > step * 0.01;

  // Sync input when value changes externally
  useEffect(() => {
    setInputVal(format ? format(value) : String(step < 1 ? value.toFixed(2) : Math.round(value)));
  }, [value, format, step]);

  function commitInput(raw: string) {
    const stripped = raw.replace(/[^0-9.\-]/g, '');
    const num = parseFloat(stripped);
    if (!isNaN(num)) {
      onChange(Math.min(max, Math.max(min, num)));
    } else {
      // Reset display
      setInputVal(format ? format(value) : String(value));
    }
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-[#6B7280] tracking-wide uppercase select-none">{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={inputVal}
            inputMode="numeric"
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={(e) => commitInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitInput((e.target as HTMLInputElement).value);
              if (e.key === 'ArrowUp') { e.preventDefault(); onChange(Math.min(max, value + step)); }
              if (e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(min, value - step)); }
            }}
            className="w-14 text-right text-[11px] font-mono text-[#111827] bg-transparent border-b border-transparent hover:border-[#E5E7EB] focus:border-[#5E6AD2] focus:outline-none py-0 leading-none transition-colors"
          />
          {isModified && (
            <button
              onClick={() => onChange(defaultValue)}
              title="Reset to default"
              className="text-[#9CA3AF] hover:text-[#5E6AD2] transition-colors leading-none text-xs ml-0.5"
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
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        className="w-full"
      />
    </div>
  );
}

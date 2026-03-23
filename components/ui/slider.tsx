'use client';

interface SliderProps {
  value?: number | number[];
  defaultValue?: number | number[];
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  onValueChange?: (value: number | number[]) => void;
  disabled?: boolean;
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className = '',
  disabled = false,
}: SliderProps) {
  const val = Array.isArray(value) ? value[0] : (value ?? min);
  const pct = max === min ? 0 : ((val - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={val}
      disabled={disabled}
      onChange={(e) => onValueChange?.(parseFloat(e.target.value))}
      className={`nsg-slider ${className}`}
      style={{
        background: `linear-gradient(to right, #5E6AD2 ${pct}%, #E5E7EB ${pct}%)`,
      }}
    />
  );
}

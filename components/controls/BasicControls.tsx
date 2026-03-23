'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ColorControl, GradientBuilder } from './ColorControl';
import type { StarConfig, StarType } from '@/types/star';
import { STAR_TYPE_LABELS, PHASE_1_TYPES, PHASE_2_TYPES, PHASE_3_TYPES } from '@/types/star';

interface BasicControlsProps {
  config: StarConfig;
  update: <K extends keyof StarConfig>(key: K, value: StarConfig[K]) => void;
}

const FILL_TYPES: { value: StarConfig['fillType']; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'linear-gradient', label: 'Linear' },
  { value: 'radial-gradient', label: 'Radial' },
  { value: 'conic-gradient', label: 'Conic' },
  { value: 'none', label: 'None' },
];

const STROKE_DASHES: { value: StarConfig['strokeDash']; label: string }[] = [
  { value: 'solid', label: '—' },
  { value: 'dashed', label: '- -' },
  { value: 'dotted', label: '···' },
];

function SliderRow({ label, value, min, max, step = 1, onChange, format }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-gray-500 font-medium">{label}</Label>
        <span className="text-xs font-mono text-gray-400">{format ? format(value) : value}</span>
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

function StarTypeGrid({ value, onChange }: { value: StarType; onChange: (t: StarType) => void }) {
  const groups = [
    { label: 'Core', types: PHASE_1_TYPES },
    { label: 'Extended', types: PHASE_2_TYPES },
    { label: 'Artistic', types: PHASE_3_TYPES },
  ];

  return (
    <div className="flex flex-col gap-2">
      {groups.map(({ label, types }) => (
        <div key={label}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
          <div className="grid grid-cols-2 gap-1">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => onChange(t)}
                className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  value === t
                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                {STAR_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BasicControls({ config, update }: BasicControlsProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Star Type */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Star Type</h3>
        <StarTypeGrid value={config.starType} onChange={(t) => update('starType', t)} />
      </section>

      <Separator />

      {/* Size & Shape */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2.5">Size & Shape</h3>
        <div className="flex flex-col gap-3">
          <SliderRow
            label="Outer Radius"
            value={config.outerRadius}
            min={60}
            max={240}
            onChange={(v) => update('outerRadius', v)}
          />
          <SliderRow
            label="Inner Ratio"
            value={config.innerRadiusRatio}
            min={0.1}
            max={0.9}
            step={0.01}
            onChange={(v) => update('innerRadiusRatio', v)}
            format={(v) => v.toFixed(2)}
          />
          <SliderRow
            label="Rotation"
            value={config.rotation}
            min={-180}
            max={180}
            onChange={(v) => update('rotation', v)}
            format={(v) => `${v}°`}
          />
        </div>
      </section>

      <Separator />

      {/* Fill */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2.5">Fill</h3>
        <div className="flex flex-col gap-3">
          {/* Fill type tabs */}
          <div className="flex rounded-lg bg-gray-100 p-0.5 gap-0.5">
            {FILL_TYPES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => update('fillType', value)}
                className={`flex-1 py-1 text-xs rounded-md font-medium transition-all ${
                  config.fillType === value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {config.fillType === 'solid' && (
            <ColorControl
              label="Fill Color"
              value={config.fillColor}
              onChange={(v) => update('fillColor', v)}
              showOpacity
              opacity={config.fillOpacity}
              onOpacityChange={(v) => update('fillOpacity', v)}
            />
          )}

          {(config.fillType === 'linear-gradient' || config.fillType === 'radial-gradient') && (
            <GradientBuilder
              colors={config.gradientColors}
              onChange={(colors) => update('gradientColors', colors)}
              direction={config.gradientDirection}
              onDirectionChange={(d) => update('gradientDirection', d)}
            />
          )}
        </div>
      </section>

      <Separator />

      {/* Stroke */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2.5">Stroke</h3>
        <div className="flex flex-col gap-3">
          <SliderRow
            label="Width"
            value={config.strokeWidth}
            min={0}
            max={20}
            step={0.5}
            onChange={(v) => update('strokeWidth', v)}
            format={(v) => `${v}px`}
          />
          {config.strokeWidth > 0 && (
            <>
              <ColorControl
                label="Stroke Color"
                value={config.strokeColor}
                onChange={(v) => update('strokeColor', v)}
              />
              <div className="flex gap-1">
                {STROKE_DASHES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => update('strokeDash', value)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
                      config.strokeDash === value
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Separator />

      {/* Background */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2.5">Background</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => update('bgColor', 'transparent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              config.bgColor === 'transparent'
                ? 'bg-indigo-500 text-white border-indigo-500'
                : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
            }`}
          >
            None
          </button>
          <ColorControl
            label=""
            value={config.bgColor === 'transparent' ? '#ffffff' : config.bgColor}
            onChange={(v) => update('bgColor', v)}
          />
        </div>
      </section>
    </div>
  );
}

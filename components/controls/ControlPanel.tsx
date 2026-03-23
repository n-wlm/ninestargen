'use client';

import SliderInput from './SliderInput';
import { ColorControl, GradientBuilder } from './ColorControl';
import type { StarConfig, StarType } from '@/types/star';
import { DEFAULT_CONFIG, STAR_TYPE_LABELS, PHASE_1_TYPES, PHASE_2_TYPES, PHASE_3_TYPES } from '@/types/star';

interface ControlPanelProps {
  config: StarConfig;
  update: <K extends keyof StarConfig>(key: K, value: StarConfig[K]) => void;
  onReset: () => void;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-[#F3F4F6]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-3">{title}</p>
      <div className="flex flex-col gap-3.5">{children}</div>
    </div>
  );
}

function SegmentedControl<T extends string>({
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
          className={`flex-1 py-1 text-[11px] rounded font-medium transition-all ${
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

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-medium text-[#6B7280]">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-8 h-4.5 rounded-full transition-all relative shrink-0 ${value ? 'bg-[#5E6AD2]' : 'bg-[#D1D5DB]'}`}
        style={{ height: '18px', width: '32px' }}
      >
        <span
          className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all`}
          style={{ left: value ? '14px' : '2px' }}
        />
      </button>
    </div>
  );
}

function StarTypeGrid({ value, onChange }: { value: StarType; onChange: (t: StarType) => void }) {
  const groups = [
    { label: 'Star Polygons', types: PHASE_1_TYPES },
    { label: 'Extended', types: PHASE_2_TYPES },
    { label: 'Artistic', types: PHASE_3_TYPES },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      {groups.map(({ label, types }) => (
        <div key={label}>
          <p className="text-[10px] text-[#9CA3AF] mb-1.5">{label}</p>
          <div className="grid grid-cols-2 gap-1">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => onChange(t)}
                className={`text-left px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                  value === t
                    ? 'bg-[#EEF2FF] text-[#5E6AD2] ring-1 ring-inset ring-[#C7D2FE]'
                    : 'text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]'
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

const FILL_TYPES: { value: StarConfig['fillType']; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'linear-gradient', label: 'Linear' },
  { value: 'radial-gradient', label: 'Radial' },
  { value: 'none', label: 'None' },
];

const STROKE_DASHES: { value: StarConfig['strokeDash']; label: string }[] = [
  { value: 'solid', label: '—' },
  { value: 'dashed', label: '╌╌' },
  { value: 'dotted', label: '···' },
];

// Types that support curve intensity
const USES_CURVE = new Set(['9-2', '9-4', '3-triangles', '3-rhombuses', 'spike', 'curved-outline', 'alt-length']);
const USES_FILLRULE = new Set(['3-triangles', '3-rhombuses']);
const USES_SPIRAL = new Set(['spiral']);
const USES_PETAL = new Set(['petal']);
const USES_FRACTAL = new Set(['fractal']);
const USES_ALT = new Set(['alt-length']);

// ── Main Panel ─────────────────────────────────────────────────────────────────

export default function ControlPanel({ config, update, onReset }: ControlPanelProps) {
  const t = config.starType;
  const D = DEFAULT_CONFIG;

  return (
    <div className="flex flex-col bg-white h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-[#F3F4F6] shrink-0">
        <span className="text-[12px] font-semibold text-[#111827] tracking-tight">Controls</span>
        <button
          onClick={onReset}
          className="text-[11px] text-[#9CA3AF] hover:text-[#5E6AD2] transition-colors font-medium"
        >
          Reset all
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">

        {/* STAR TYPE */}
        <Section title="Type">
          <StarTypeGrid value={config.starType} onChange={(t) => update('starType', t)} />
        </Section>

        {/* SHAPE */}
        <Section title="Shape">
          <SliderInput
            label="Outer Radius"
            value={config.outerRadius}
            defaultValue={D.outerRadius}
            min={60}
            max={240}
            step={1}
            onChange={(v) => update('outerRadius', v)}
          />
          {!['9-2', '9-4', 'mandala'].includes(t) && (
            <SliderInput
              label="Inner Ratio"
              value={config.innerRadiusRatio}
              defaultValue={D.innerRadiusRatio}
              min={0.1}
              max={0.9}
              step={0.01}
              format={(v) => v.toFixed(2)}
              onChange={(v) => update('innerRadiusRatio', v)}
            />
          )}
          <SliderInput
            label="Rotation"
            value={config.rotation}
            defaultValue={D.rotation}
            min={-180}
            max={180}
            step={1}
            format={(v) => `${v}°`}
            onChange={(v) => update('rotation', v)}
          />
          {USES_CURVE.has(t) && (
            <SliderInput
              label="Curve"
              value={config.curveIntensity}
              defaultValue={D.curveIntensity}
              min={-1}
              max={1}
              step={0.01}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={(v) => update('curveIntensity', v)}
            />
          )}
          {USES_FILLRULE.has(t) && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-1.5">Overlap</p>
              <SegmentedControl
                options={[
                  { value: 'evenodd' as const, label: 'Cut-out' },
                  { value: 'nonzero' as const, label: 'Filled' },
                ]}
                value={config.fillRule}
                onChange={(v) => update('fillRule', v)}
              />
            </div>
          )}
          {USES_ALT.has(t) && (
            <>
              <SegmentedControl
                options={[
                  { value: 'short-long' as const, label: '2-step' },
                  { value: 'short-mid-long' as const, label: '3-step' },
                ]}
                value={config.altLengthPattern}
                onChange={(v) => update('altLengthPattern', v)}
              />
              <SliderInput
                label="Short/Long Ratio"
                value={config.altLengthRatio}
                defaultValue={D.altLengthRatio}
                min={0.3}
                max={0.9}
                step={0.01}
                format={(v) => `${Math.round(v * 100)}%`}
                onChange={(v) => update('altLengthRatio', v)}
              />
            </>
          )}
          {USES_SPIRAL.has(t) && (
            <SliderInput
              label="Twist per Point"
              value={config.spiralTwist}
              defaultValue={D.spiralTwist}
              min={0}
              max={40}
              step={0.5}
              format={(v) => `${v}°`}
              onChange={(v) => update('spiralTwist', v)}
            />
          )}
          {USES_PETAL.has(t) && (
            <>
              <SliderInput
                label="Petal Width"
                value={config.petalWidth}
                defaultValue={D.petalWidth}
                min={0.1}
                max={1}
                step={0.01}
                format={(v) => `${Math.round(v * 100)}%`}
                onChange={(v) => update('petalWidth', v)}
              />
              <SliderInput
                label="Petal Curve"
                value={config.petalCurve}
                defaultValue={D.petalCurve}
                min={0}
                max={1}
                step={0.01}
                format={(v) => `${Math.round(v * 100)}%`}
                onChange={(v) => update('petalCurve', v)}
              />
            </>
          )}
          {USES_FRACTAL.has(t) && (
            <div>
              <p className="text-[10px] text-[#9CA3AF] mb-1.5">Depth</p>
              <div className="flex gap-1">
                {[1, 2, 3].map((d) => (
                  <button
                    key={d}
                    onClick={() => update('fractalDepth', d)}
                    className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                      config.fractalDepth === d
                        ? 'bg-[#EEF2FF] text-[#5E6AD2] ring-1 ring-inset ring-[#C7D2FE]'
                        : 'bg-[#F9FAFB] text-[#6B7280] hover:text-[#374151]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* FILL */}
        <Section title="Fill">
          <SegmentedControl
            options={FILL_TYPES}
            value={config.fillType}
            onChange={(v) => update('fillType', v)}
          />
          {config.fillType === 'solid' && (
            <ColorControl
              label="Color"
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
        </Section>

        {/* STROKE */}
        <Section title="Stroke">
          <SliderInput
            label="Width"
            value={config.strokeWidth}
            defaultValue={D.strokeWidth}
            min={0}
            max={20}
            step={0.5}
            format={(v) => `${v}px`}
            onChange={(v) => update('strokeWidth', v)}
          />
          {config.strokeWidth > 0 && (
            <>
              <ColorControl
                label="Color"
                value={config.strokeColor}
                onChange={(v) => update('strokeColor', v)}
              />
              <SegmentedControl
                options={STROKE_DASHES}
                value={config.strokeDash}
                onChange={(v) => update('strokeDash', v)}
              />
            </>
          )}
        </Section>

        {/* BACKGROUND */}
        <Section title="Background">
          <div className="flex items-center gap-2">
            <button
              onClick={() => update('bgColor', 'transparent')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                config.bgColor === 'transparent'
                  ? 'bg-[#EEF2FF] text-[#5E6AD2] ring-1 ring-inset ring-[#C7D2FE]'
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#374151]'
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
        </Section>

        {/* INNER POLYGON */}
        <Section title="Inner Polygon">
          <Toggle
            label="Show inner 9-gon"
            value={config.showInnerPolygon}
            onChange={(v) => update('showInnerPolygon', v)}
          />
          {config.showInnerPolygon && (
            <ColorControl
              label="Color"
              value={config.innerPolygonColor}
              onChange={(v) => update('innerPolygonColor', v)}
            />
          )}
        </Section>

        {/* EFFECTS */}
        <Section title="Effects">
          <SliderInput
            label="Glow"
            value={config.glowRadius}
            defaultValue={D.glowRadius}
            min={0}
            max={40}
            step={1}
            format={(v) => `${v}px`}
            onChange={(v) => update('glowRadius', v)}
          />
          {config.glowRadius > 0 && (
            <ColorControl
              label="Glow Color"
              value={config.glowColor}
              onChange={(v) => update('glowColor', v)}
            />
          )}
          <SliderInput
            label="Shadow"
            value={config.shadowBlur}
            defaultValue={D.shadowBlur}
            min={0}
            max={40}
            step={1}
            format={(v) => `${v}px`}
            onChange={(v) => update('shadowBlur', v)}
          />
          {config.shadowBlur > 0 && (
            <>
              <ColorControl
                label="Shadow Color"
                value={config.shadowColor.slice(0, 7)}
                onChange={(v) => update('shadowColor', v)}
              />
              <div className="grid grid-cols-2 gap-2">
                <SliderInput
                  label="Offset X"
                  value={config.shadowOffsetX}
                  defaultValue={D.shadowOffsetX}
                  min={-20}
                  max={20}
                  step={1}
                  format={(v) => `${v}px`}
                  onChange={(v) => update('shadowOffsetX', v)}
                />
                <SliderInput
                  label="Offset Y"
                  value={config.shadowOffsetY}
                  defaultValue={D.shadowOffsetY}
                  min={-20}
                  max={20}
                  step={1}
                  format={(v) => `${v}px`}
                  onChange={(v) => update('shadowOffsetY', v)}
                />
              </div>
            </>
          )}
        </Section>

        {/* Spacer at bottom */}
        <div className="h-4" />
      </div>
    </div>
  );
}

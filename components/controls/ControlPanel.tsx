'use client';

import SliderInput from './SliderInput';
import { ColorControl, GradientBuilder } from './ColorControl';
import StarPreview from '@/components/StarPreview';
import type { StarConfig, StarType } from '@/types/star';
import { DEFAULT_CONFIG, STAR_TYPE_LABELS, STAR_TYPES_ORDERED } from '@/types/star';
import { PALETTES } from '@/lib/color-palettes';

interface ControlPanelProps {
  config: StarConfig;
  update: <K extends keyof StarConfig>(key: K, value: StarConfig[K]) => void;
  onReset: () => void;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#F3F4F6]">
      <div className="px-4 py-2.5 lg:py-2 bg-[#F9FAFB] border-b border-[#F3F4F6]">
        <p className="text-[12px] lg:text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">{title}</p>
      </div>
      <div className="px-4 py-4 lg:py-3 flex flex-col gap-4 lg:gap-3.5">{children}</div>
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

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
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

// Minimal config used only for corner previews — neutral indigo, no bg, no stroke
const PREVIEW_BASE: StarConfig = {
  ...DEFAULT_CONFIG,
  fillType: 'solid',
  fillColor: '#5E6AD2',
  fillOpacity: 1,
  strokeWidth: 0,
  bgColor: 'transparent',
  outerContainer: 'none',
  showInnerPolygon: false,
  glowRadius: 0,
  shadowBlur: 0,
  outerRadius: 220,
  innerRadiusRatio: 0.38,
  curveIntensity: 0,
  cornerRounding: 0,
  rotation: -90,
};

function StarCornerPreview({ starType }: { starType: StarType }) {
  const cfg: StarConfig = { ...PREVIEW_BASE, starType };
  return (
    <div className="shrink-0 rounded-sm" style={{ width: 28, height: 28 }}>
      <StarPreview config={cfg} className="w-full h-full" />
    </div>
  );
}

function StarTypeList({ value, onChange }: { value: StarType; onChange: (t: StarType) => void }) {
  return (
    <div className="flex flex-col gap-0.5">
      {STAR_TYPES_ORDERED.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all text-left ${
            value === t
              ? 'bg-[#EEF2FF] ring-1 ring-inset ring-[#C7D2FE]'
              : 'hover:bg-[#F9FAFB]'
          }`}
        >
          <StarCornerPreview starType={t} />
          <span className={`text-[13px] lg:text-[11px] font-medium ${value === t ? 'text-[#5E6AD2]' : 'text-[#374151]'}`}>
            {STAR_TYPE_LABELS[t]}
          </span>
        </button>
      ))}
    </div>
  );
}

function PalettePicker({ onSelect }: {
  onSelect: (p: { fillColor: string; gradientColors: string[] }) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {PALETTES.map((p) => (
        <button
          key={p.id}
          title={p.name}
          onClick={() => onSelect({ fillColor: p.fillColor, gradientColors: p.gradientColors })}
          className="w-5 h-5 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform ring-1 ring-black/10 shrink-0"
          style={{ background: p.swatch }}
        />
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

const OUTER_CONTAINERS: { value: StarConfig['outerContainer']; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: '9-gon', label: '9-Gon' },
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
];

// ── Main Panel ─────────────────────────────────────────────────────────────────

const NO_INNER_RATIO = new Set(['9-2', '9-4', '3-triangles', 'petal']);
const NO_CURVE = new Set(['petal']);
const NO_ROUNDING = new Set(['petal']);
const NO_PETAL = new Set(['9-2', '9-4', '3-triangles', 'spike', 'kite']);

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
          <StarTypeList value={config.starType} onChange={(t) => update('starType', t)} />
        </Section>

        {/* SHAPE */}
        <Section title="Shape">
          <SliderInput
            label="Outer Radius"
            tooltip="Distance from center to the outermost star point"
            value={config.outerRadius}
            defaultValue={D.outerRadius}
            min={60}
            max={270}
            step={1}
            onChange={(v) => update('outerRadius', v)}
          />
          <SliderInput
            label="Inner Ratio"
            tooltip="Size of the inner vertices relative to outer radius"
            value={config.innerRadiusRatio}
            defaultValue={D.innerRadiusRatio}
            min={0.1}
            max={0.9}
            step={0.01}
            format={(v) => v.toFixed(2)}
            onChange={(v) => update('innerRadiusRatio', v)}
            disabled={NO_INNER_RATIO.has(t)}
          />
          <SliderInput
            label="Rotation"
            tooltip="Rotate the star around its center"
            value={config.rotation}
            defaultValue={D.rotation}
            min={-180}
            max={180}
            step={1}
            format={(v) => `${v}°`}
            onChange={(v) => update('rotation', v)}
            resetLabel="Set to default"
          />
          <SliderInput
            label="Curve Radius"
            tooltip="Bend edges inward (negative) or outward (positive)"
            value={config.curveIntensity}
            defaultValue={D.curveIntensity}
            min={-250}
            max={250}
            step={1}
            format={(v) => String(Math.round(v))}
            onChange={(v) => update('curveIntensity', v)}
            disabled={NO_CURVE.has(t)}
          />
          <SliderInput
            label="Corner Rounding"
            tooltip="Round the sharp tips of star points"
            value={config.cornerRounding}
            defaultValue={D.cornerRounding}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => update('cornerRounding', v)}
            disabled={NO_ROUNDING.has(t)}
          />
          <SliderInput
            label="Petal Width"
            tooltip="Controls how wide each petal is"
            value={config.petalWidth}
            defaultValue={D.petalWidth}
            min={0.1}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => update('petalWidth', v)}
            disabled={NO_PETAL.has(t)}
          />
          <SliderInput
            label="Petal Curve"
            tooltip="Controls the curvature of each petal"
            value={config.petalCurve}
            defaultValue={D.petalCurve}
            min={0}
            max={1}
            step={0.01}
            format={(v) => `${Math.round(v * 100)}%`}
            onChange={(v) => update('petalCurve', v)}
            disabled={NO_PETAL.has(t)}
          />
        </Section>

        {/* STROKE */}
        <Section title="Stroke">
          <SliderInput
            label="Width"
            tooltip="Thickness of the star outline"
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

        {/* FILL */}
        <Section title="Fill">
          {/* Palette quick-pick */}
          <PalettePicker onSelect={(p) => {
            update('fillColor', p.fillColor);
            update('gradientColors', p.gradientColors);
          }} />
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
            />
          )}
          {(config.fillType === 'linear-gradient' || config.fillType === 'radial-gradient') && (
            <GradientBuilder
              colors={config.gradientColors}
              onChange={(colors) => update('gradientColors', colors)}
              direction={config.gradientDirection}
              onDirectionChange={(d) => update('gradientDirection', d)}
              isRadial={config.fillType === 'radial-gradient'}
            />
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

        {/* OUTER CONTAINER */}
        <Section title="Outer Container">
          <SegmentedControl
            options={OUTER_CONTAINERS}
            value={config.outerContainer}
            onChange={(v) => update('outerContainer', v)}
          />
          {config.outerContainer !== 'none' && (
            <>
              <SliderInput
                label="Padding"
                tooltip="Gap between star and outer container"
                value={config.outerContainerPadding}
                defaultValue={D.outerContainerPadding}
                min={0}
                max={50}
                step={1}
                format={(v) => `${v}px`}
                onChange={(v) => update('outerContainerPadding', v)}
              />
              <ColorControl
                label="Stroke"
                value={config.outerContainerColor}
                onChange={(v) => update('outerContainerColor', v)}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => update('outerContainerFill', 'none')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    config.outerContainerFill === 'none'
                      ? 'bg-[#EEF2FF] text-[#5E6AD2] ring-1 ring-inset ring-[#C7D2FE]'
                      : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#374151]'
                  }`}
                >
                  No fill
                </button>
                <ColorControl
                  label=""
                  value={config.outerContainerFill === 'none' ? '#ffffff' : config.outerContainerFill}
                  onChange={(v) => update('outerContainerFill', v)}
                />
              </div>
            </>
          )}
        </Section>

        {/* EFFECTS */}
        <Section title="Effects">
          <SliderInput
            label="Glow"
            tooltip="Adds a colored halo around the star"
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
            tooltip="Adds a soft shadow evenly around the star"
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
            </>
          )}
        </Section>

        <div className="h-4" />
      </div>
    </div>
  );
}

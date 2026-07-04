'use client';

import { Lightbulb } from 'lucide-react';
import SliderInput, { parsePercent } from './SliderInput';
import { ColorControl, GradientBuilder } from './ColorControl';
import { Section, SegmentedControl, ConfirmButton, GroupLabel } from './primitives';
import StarPreview from '@/components/StarPreview';
import type { StarConfig, StarType } from '@/types/star';
import { DEFAULT_CONFIG, STAR_TYPE_LABELS, STAR_TYPES_ORDERED } from '@/types/star';
import { PALETTES } from '@/lib/color-palettes';
import type { GeometryLayer } from '@/types/geometry';

interface ControlPanelProps {
  config: StarConfig;
  update: <K extends keyof StarConfig>(key: K, value: StarConfig[K]) => void;
  onReset: () => void;
  // The property sections below edit the selected layer; the layer LIST itself
  // lives in the floating LayersPanel over the canvas.
  layers: GeometryLayer[];
  selectedLayer: GeometryLayer;
  updateLayer: (id: string, partial: Partial<GeometryLayer>) => void;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

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
  { value: 'none', label: 'None' },
  { value: 'solid', label: 'Solid' },
  { value: 'linear-gradient', label: 'Linear' },
  { value: 'radial-gradient', label: 'Radial' },
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

export default function ControlPanel({
  config, update, onReset,
  layers, selectedLayer, updateLayer,
}: ControlPanelProps) {
  const t = config.starType;
  const D = DEFAULT_CONFIG;
  const multiLayer = layers.length > 1;

  return (
    <div className="flex flex-col bg-white h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-[#F3F4F6] shrink-0">
        <span className="text-[12px] font-semibold text-[#111827] tracking-tight">Controls</span>
        <ConfirmButton
          label="Reset all"
          message="Reset all settings to their defaults?"
          confirmLabel="Reset"
          onConfirm={onReset}
          destructive
          align="center"
          className="text-[11px] text-[#6B7280] hover:text-[var(--nsg-accent)] transition-colors font-medium"
        />
      </div>

      {/* Scrollable content — the layer list lives in the floating LayersPanel */}
      <div className="flex-1 overflow-y-auto">

        {/* STAR TYPE */}
        <Section title="Type">
          <StarTypeList value={config.starType} onChange={(t) => update('starType', t)} />
        </Section>

        {/* SHAPE */}
        <Section title="Shape">
          {/* Per-layer composition controls — only meaningful with a stack. */}
          {multiLayer && (
            <>
              <SliderInput
                label="Layer Opacity"
                tooltip="Overall opacity of this layer"
                value={selectedLayer.opacity}
                defaultValue={1}
                min={0}
                max={1}
                step={0.01}
                format={(v) => `${Math.round(v * 100)}%`}
                parse={parsePercent}
                onChange={(v) => updateLayer(selectedLayer.id, { opacity: v })}
              />
              <SliderInput
                label="Offset X"
                tooltip="Shift this layer horizontally from the center"
                value={selectedLayer.offsetX}
                defaultValue={0}
                min={-300}
                max={300}
                step={1}
                format={(v) => String(Math.round(v))}
                onChange={(v) => updateLayer(selectedLayer.id, { offsetX: v })}
                resetLabel="Set to default"
              />
              <SliderInput
                label="Offset Y"
                tooltip="Shift this layer vertically from the center"
                value={selectedLayer.offsetY}
                defaultValue={0}
                min={-300}
                max={300}
                step={1}
                format={(v) => String(Math.round(v))}
                onChange={(v) => updateLayer(selectedLayer.id, { offsetY: v })}
                resetLabel="Set to default"
              />
            </>
          )}
          <SliderInput
            label="Outer Radius"
            tooltip="Distance from center to the outermost star point"
            value={config.outerRadius}
            defaultValue={D.outerRadius}
            min={60}
            max={350}
            step={1}
            onChange={(v) => update('outerRadius', v)}
            resetLabel="Set to default"
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
            parse={parsePercent}
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
            parse={parsePercent}
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
            parse={parsePercent}
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

        {/* EFFECTS — per selected layer */}
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
            <ColorControl
              label="Shadow Color"
              value={config.shadowColor.slice(0, 7)}
              onChange={(v) => update('shadowColor', v)}
            />
          )}
        </Section>

        {/* CANVAS — composition-level, applies to the whole design */}
        <GroupLabel label="Canvas" />

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
                max={45}
                step={1}
                format={(v) => `${v}px`}
                onChange={(v) => update('outerContainerPadding', v)}
              />
              <ColorControl
                label="Stroke"
                value={config.outerContainerColor}
                onChange={(v) => update('outerContainerColor', v)}
              />
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] lg:text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">Fill</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => update('outerContainerFill', 'none')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      config.outerContainerFill === 'none'
                        ? 'bg-[#EEF2FF] text-[#5E6AD2] ring-1 ring-inset ring-[#C7D2FE]'
                        : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#374151]'
                    }`}
                  >
                    None
                  </button>
                  <ColorControl
                    label=""
                    value={config.outerContainerFill === 'none' ? '#ffffff' : config.outerContainerFill}
                    onChange={(v) => update('outerContainerFill', v)}
                  />
                </div>
              </div>
            </>
          )}
        </Section>

        {/* Subtle hint for power users — discoverable, not loud, but readable */}
        <div className="px-4 py-3.5 flex items-start gap-1.5">
          <Lightbulb className="w-3 h-3 text-[#9CA3AF] mt-[1px] shrink-0" aria-hidden="true" />
          <p className="text-[10px] text-[#6B7280] leading-relaxed">
            Tip: type a value past a slider&apos;s range to push shapes into exotic territory.
          </p>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}

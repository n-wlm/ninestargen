'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import SliderInput, { parsePercent } from './SliderInput';
import { ColorControl } from './ColorControl';
import { Section, SegmentedControl, Toggle, ConfirmButton, GroupLabel } from './primitives';
import type { CompositionConfig, ImageLayer, SymmetryCount } from '@/types/composition';
import { LAYER_LIMITS, MAX_LAYERS } from '@/types/composition';
import { ACCEPT_ATTR, fileToLayer, UploadError } from '@/lib/image-upload';

interface ImageControlPanelProps {
  config: CompositionConfig;
  update: <K extends keyof CompositionConfig>(key: K, value: CompositionConfig[K]) => void;
  addLayer: (layer: ImageLayer) => void;
  updateLayer: (id: string, partial: Partial<ImageLayer>) => void;
  selectedLayer: ImageLayer | undefined;
  onReset: () => void;
}

const COUNT_OPTIONS: { value: string; label: string }[] = [
  { value: '9', label: '9 ×' },
  { value: '3', label: '3 ×' },
];

const OUTER_CONTAINERS: { value: CompositionConfig['outerContainer']; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: '9-gon', label: '9-Gon' },
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
];

// The per-layer property controls for the SELECTED image layer — mirrors the
// geometry ControlPanel's selected-layer pattern (the layer LIST is in the
// floating LayersPanel).
function LayerControls({ layer, updateLayer }: { layer: ImageLayer; updateLayer: (id: string, p: Partial<ImageLayer>) => void }) {
  return (
    <>
      <Section title="Arrangement">
        <SegmentedControl
          options={COUNT_OPTIONS}
          value={String(layer.count)}
          onChange={(v) => updateLayer(layer.id, { count: Number(v) as SymmetryCount })}
        />
        <Toggle label="Mirror" value={layer.mirror} onChange={(v) => updateLayer(layer.id, { mirror: v })} />
        <SliderInput
          label="Angle"
          tooltip="Rotate the whole arrangement"
          value={layer.angleOffset}
          defaultValue={LAYER_LIMITS.angleOffset.default}
          min={LAYER_LIMITS.angleOffset.min}
          max={LAYER_LIMITS.angleOffset.max}
          step={LAYER_LIMITS.angleOffset.step}
          format={(v) => `${Math.round(v)}°`}
          snap={Array.from({ length: layer.count * 2 + 1 }, (_, i) => (360 / (layer.count * 2)) * i)}
          onChange={(v) => updateLayer(layer.id, { angleOffset: v })}
          resetLabel="Set to default"
        />
      </Section>

      <Section title="Transform">
        <SliderInput
          label="Size"
          tooltip="Size of the image (longest side, in canvas units)"
          value={layer.scale}
          defaultValue={LAYER_LIMITS.scale.default}
          min={LAYER_LIMITS.scale.min}
          max={LAYER_LIMITS.scale.max}
          step={LAYER_LIMITS.scale.step}
          onChange={(v) => updateLayer(layer.id, { scale: v })}
        />
        <SliderInput
          label="Radius"
          tooltip="Distance of each copy from the center"
          value={layer.radius}
          defaultValue={LAYER_LIMITS.radius.default}
          min={LAYER_LIMITS.radius.min}
          max={LAYER_LIMITS.radius.max}
          step={LAYER_LIMITS.radius.step}
          onChange={(v) => updateLayer(layer.id, { radius: v })}
        />
        <SliderInput
          label="Spin"
          tooltip="Rotate each copy around its own center"
          value={layer.spin}
          defaultValue={LAYER_LIMITS.spin.default}
          min={LAYER_LIMITS.spin.min}
          max={LAYER_LIMITS.spin.max}
          step={LAYER_LIMITS.spin.step}
          format={(v) => `${Math.round(v)}°`}
          onChange={(v) => updateLayer(layer.id, { spin: v })}
        />
        <SliderInput
          label="Offset X"
          tooltip="Shift the image sideways within each copy (off-centre)"
          value={layer.offsetX}
          defaultValue={LAYER_LIMITS.offsetX.default}
          min={LAYER_LIMITS.offsetX.min}
          max={LAYER_LIMITS.offsetX.max}
          step={LAYER_LIMITS.offsetX.step}
          format={(v) => String(Math.round(v))}
          onChange={(v) => updateLayer(layer.id, { offsetX: v })}
        />
        <SliderInput
          label="Offset Y"
          tooltip="Shift the image in/out (toward or away from the center)"
          value={layer.offsetY}
          defaultValue={LAYER_LIMITS.offsetY.default}
          min={LAYER_LIMITS.offsetY.min}
          max={LAYER_LIMITS.offsetY.max}
          step={LAYER_LIMITS.offsetY.step}
          format={(v) => String(Math.round(v))}
          onChange={(v) => updateLayer(layer.id, { offsetY: v })}
        />
        <SliderInput
          label="Opacity"
          tooltip="Layer transparency"
          value={layer.opacity}
          defaultValue={LAYER_LIMITS.opacity.default}
          min={LAYER_LIMITS.opacity.min}
          max={LAYER_LIMITS.opacity.max}
          step={LAYER_LIMITS.opacity.step}
          format={(v) => `${Math.round(v * 100)}%`}
          parse={parsePercent}
          onChange={(v) => updateLayer(layer.id, { opacity: v })}
        />
      </Section>
    </>
  );
}

export default function ImageControlPanel({
  config, update, addLayer, updateLayer, selectedLayer, onReset,
}: ImageControlPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const atLimit = config.layers.length >= MAX_LAYERS;
  const hasLayers = config.layers.length > 0;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    let remaining = MAX_LAYERS - config.layers.length;
    for (const file of Array.from(files)) {
      if (remaining <= 0) {
        setError(`Maximum ${MAX_LAYERS} layers`);
        break;
      }
      try {
        const layer = await fileToLayer(file);
        addLayer(layer);
        remaining--;
      } catch (e) {
        setError(e instanceof UploadError ? e.message : 'Upload failed');
      }
    }
    if (fileRef.current) fileRef.current.value = '';
  }

  // The canvas empty-state CTA and the floating panel's "+" trigger this picker.
  useEffect(() => {
    const open = () => fileRef.current?.click();
    window.addEventListener('nsg:add-image', open);
    return () => window.removeEventListener('nsg:add-image', open);
  }, []);

  return (
    <div className="flex flex-col bg-white h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-[#F3F4F6] shrink-0">
        <span className="text-[12px] font-semibold text-[#111827] tracking-tight">Controls</span>
        {hasLayers && (
          <ConfirmButton
            label="Clear all"
            message="Remove all layers? This can't be undone."
            confirmLabel="Clear"
            onConfirm={onReset}
            destructive
            align="center"
            className="text-[11px] text-[#6B7280] hover:text-[var(--nsg-accent)] transition-colors font-medium"
          />
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* UPLOAD */}
        <Section title={`Images · ${config.layers.length}/${MAX_LAYERS}`}>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT_ATTR}
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={atLimit}
            className={`w-full flex items-center justify-center gap-2 font-medium transition-all ${
              atLimit
                ? 'py-3 rounded-lg border-2 border-dashed border-[#E5E7EB] text-[#D1D5DB] cursor-not-allowed text-[13px] lg:text-[12px]'
                : hasLayers
                  ? 'py-2 rounded-md bg-[#F3F4F6] text-[#6B7280] hover:bg-[var(--nsg-accent-soft)] hover:text-[var(--nsg-accent)] text-[12px] lg:text-[11px]'
                  : 'py-3 rounded-lg border-2 border-dashed border-[var(--nsg-accent-ring)] text-[var(--nsg-accent)] hover:bg-[var(--nsg-accent-soft)] hover:border-[var(--nsg-accent-border)] text-[13px] lg:text-[12px]'
            }`}
          >
            <ImagePlus className="w-4 h-4" />
            {atLimit ? 'Layer limit reached' : 'Add image'}
          </button>
          {error && <p className="text-[12px] lg:text-[11px] text-[#EF4444] font-medium">{error}</p>}
          {!hasLayers && (
            <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
              Upload an image to start — it&apos;s repeated into a nine-fold mandala. Add more as layers.
            </p>
          )}
        </Section>

        {/* SELECTED LAYER — arrangement + transform */}
        {selectedLayer && <LayerControls layer={selectedLayer} updateLayer={updateLayer} />}

        {/* CANVAS — composition-level */}
        <GroupLabel label="Canvas" />

        {/* BACKGROUND */}
        <Section title="Background">
          <div className="flex items-center gap-2">
            <button
              onClick={() => update('bgColor', 'transparent')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                config.bgColor === 'transparent'
                  ? 'bg-[var(--nsg-accent-soft)] text-[var(--nsg-accent)] ring-1 ring-inset ring-[var(--nsg-accent-ring)]'
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
                tooltip="Gap between images and the outer container"
                value={config.outerContainerPadding}
                defaultValue={20}
                min={0}
                max={60}
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
                      ? 'bg-[var(--nsg-accent-soft)] text-[var(--nsg-accent)] ring-1 ring-inset ring-[var(--nsg-accent-ring)]'
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

        <div className="h-4" />
      </div>
    </div>
  );
}

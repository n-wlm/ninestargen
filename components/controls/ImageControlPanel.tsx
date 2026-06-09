'use client';

import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, ChevronDown, ChevronUp, Trash2, ImagePlus } from 'lucide-react';
import SliderInput, { parsePercent } from './SliderInput';
import { ColorControl } from './ColorControl';
import { Section, SegmentedControl, Toggle } from './primitives';
import type { CompositionConfig, ImageLayer, SymmetryCount } from '@/types/composition';
import { LAYER_LIMITS, MAX_LAYERS } from '@/types/composition';
import { ACCEPT_ATTR, fileToLayer, UploadError } from '@/lib/image-upload';

interface ImageControlPanelProps {
  config: CompositionConfig;
  update: <K extends keyof CompositionConfig>(key: K, value: CompositionConfig[K]) => void;
  addLayer: (layer: ImageLayer) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, partial: Partial<ImageLayer>) => void;
  reorderLayer: (id: string, dir: -1 | 1) => void;
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

function LayerCard({
  layer,
  index,
  total,
  expanded,
  onToggleExpand,
  updateLayer,
  removeLayer,
  reorderLayer,
}: {
  layer: ImageLayer;
  index: number; // display index (0 = front/top)
  total: number;
  expanded: boolean;
  onToggleExpand: () => void;
  updateLayer: (id: string, partial: Partial<ImageLayer>) => void;
  removeLayer: (id: string) => void;
  reorderLayer: (id: string, dir: -1 | 1) => void;
}) {
  return (
    <div className="rounded-lg border border-[#EAECF0] overflow-hidden bg-white">
      {/* Header row */}
      <div className="flex items-center gap-2 px-2.5 py-2">
        {/* Thumbnail */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={layer.src}
          alt=""
          className="w-8 h-8 rounded object-contain bg-[#F3F4F6] border border-black/5 shrink-0"
        />
        <button
          onClick={onToggleExpand}
          className="flex-1 min-w-0 text-left flex items-center gap-1"
          title={layer.name}
        >
          <span className="text-[13px] lg:text-[11px] font-medium text-[#374151] truncate">{layer.name}</span>
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" />
          )}
        </button>

        {/* Reorder */}
        <div className="flex items-center">
          <button
            onClick={() => reorderLayer(layer.id, -1)}
            disabled={index === 0}
            title="Move forward"
            className="p-1 text-[#9CA3AF] hover:text-[#5E6AD2] disabled:opacity-25 disabled:hover:text-[#9CA3AF] transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => reorderLayer(layer.id, 1)}
            disabled={index === total - 1}
            title="Move back"
            className="p-1 text-[#9CA3AF] hover:text-[#5E6AD2] disabled:opacity-25 disabled:hover:text-[#9CA3AF] transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Visibility */}
        <button
          onClick={() => updateLayer(layer.id, { visible: !layer.visible })}
          title={layer.visible ? 'Hide layer' : 'Show layer'}
          className="p-1 text-[#9CA3AF] hover:text-[#5E6AD2] transition-colors"
        >
          {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Delete */}
        <button
          onClick={() => removeLayer(layer.id)}
          title="Delete layer"
          className="p-1 text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Expanded controls */}
      {expanded && (
        <div className="px-3 pb-3.5 pt-1 flex flex-col gap-4 lg:gap-3.5 border-t border-[#F3F4F6]">
          <div className="pt-3 flex flex-col gap-3">
            <SegmentedControl
              options={COUNT_OPTIONS}
              value={String(layer.count)}
              onChange={(v) => updateLayer(layer.id, { count: Number(v) as SymmetryCount })}
            />
            <Toggle
              label="Mirror"
              value={layer.mirror}
              onChange={(v) => updateLayer(layer.id, { mirror: v })}
            />
          </div>
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
            label="Offset"
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
        </div>
      )}
    </div>
  );
}

export default function ImageControlPanel({
  config,
  update,
  addLayer,
  removeLayer,
  updateLayer,
  reorderLayer,
  onReset,
}: ImageControlPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const atLimit = config.layers.length >= MAX_LAYERS;

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

  // The canvas empty-state CTA triggers this same file picker via a custom event.
  useEffect(() => {
    const open = () => fileRef.current?.click();
    window.addEventListener('nsg:add-image', open);
    return () => window.removeEventListener('nsg:add-image', open);
  }, []);

  function toggleCollapse(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Display front-to-back (last in array = front = top of list).
  const ordered = [...config.layers].reverse();

  return (
    <div className="flex flex-col bg-white h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-[#F3F4F6] shrink-0">
        <span className="text-[12px] font-semibold text-[#111827] tracking-tight">Layers</span>
        <button
          onClick={onReset}
          className="text-[11px] text-[#9CA3AF] hover:text-[#5E6AD2] transition-colors font-medium"
        >
          Clear all
        </button>
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
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed transition-all text-[13px] lg:text-[12px] font-medium ${
              atLimit
                ? 'border-[#E5E7EB] text-[#D1D5DB] cursor-not-allowed'
                : 'border-[#C7D2FE] text-[#5E6AD2] hover:bg-[#EEF2FF] hover:border-[#A5B4FC]'
            }`}
          >
            <ImagePlus className="w-4 h-4" />
            {atLimit ? 'Layer limit reached' : 'Add image'}
          </button>
          {error && <p className="text-[12px] lg:text-[11px] text-[#EF4444] font-medium">{error}</p>}
        </Section>

        {/* LAYERS */}
        {ordered.length > 0 && (
          <div className="px-3 py-3 flex flex-col gap-2 border-b border-[#F3F4F6]">
            {ordered.map((layer, i) => (
              <LayerCard
                key={layer.id}
                layer={layer}
                index={i}
                total={ordered.length}
                expanded={!collapsed.has(layer.id)}
                onToggleExpand={() => toggleCollapse(layer.id)}
                updateLayer={updateLayer}
                removeLayer={removeLayer}
                reorderLayer={reorderLayer}
              />
            ))}
          </div>
        )}

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

        <div className="h-4" />
      </div>
    </div>
  );
}

'use client';

import { memo, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { LayerThumb, type LayerRow } from './LayerThumb';

// A compact, selected-layer-first list shared by both modes. Rows are shown
// front→back (top row = front); the action cluster stays hidden (CSS group-hover)
// until a row is hovered or selected. `layers` come in storage order (index 0 =
// bottom). Every callback prop must be stable — rows are memoized per layer.
export interface LayerListProps {
  kind: 'geometry' | 'images';
  layers: LayerRow[];
  selectedId: string;
  max: number;
  minLayers?: number; // below this, delete is disabled (geometry needs ≥1)
  addLabel: string;
  maxHint: string;
  onSelect: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onReorder: (id: string, dir: -1 | 1) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}

function IconBtn({ title, onClick, disabled, danger, children }: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`p-1 rounded transition-colors ${
        disabled
          ? 'text-[#D1D5DB] cursor-default'
          : danger
            ? 'text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#FEF2F2]'
            : 'text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6]'
      }`}
    >
      {children}
    </button>
  );
}

// One row, memoized: on a slider tick only the edited layer's row re-renders
// (its `layer` identity changed); the rest bail out. All callbacks are stable.
const LayerRowItem = memo(function LayerRowItem({
  kind, layer, selected, displayIndex, total, minLayers, atMax,
  onSelect, onToggleVisible, onReorder, onDuplicate, onRemove,
}: {
  kind: 'geometry' | 'images';
  layer: LayerRow;
  selected: boolean;
  displayIndex: number;
  total: number;
  minLayers: number;
  atMax: boolean;
  onSelect: (id: string) => void;
  onToggleVisible: (id: string) => void;
  onReorder: (id: string, dir: -1 | 1) => void;
  onDuplicate: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onSelect(layer.id)}
      className={`group flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-md cursor-pointer transition-colors ${
        selected
          ? 'bg-[var(--nsg-accent-soft)] ring-1 ring-inset ring-[var(--nsg-accent-ring)]'
          : 'hover:bg-[#F9FAFB]'
      }`}
    >
      <div className={`shrink-0 w-[26px] h-[26px] rounded bg-[#F3F4F6] overflow-hidden flex items-center justify-center ${layer.visible ? '' : 'opacity-40'}`}>
        <LayerThumb kind={kind} layer={layer} />
      </div>
      <span className={`flex-1 min-w-0 truncate text-[13px] lg:text-[11px] font-medium ${
        selected ? 'text-[var(--nsg-accent)]' : layer.visible ? 'text-[#374151]' : 'text-[#9CA3AF]'
      }`}>
        {layer.name}
      </span>

      {/* Action cluster — revealed on hover/selection via CSS only (no JS state). */}
      <div className={`flex items-center shrink-0 transition-opacity group-hover:opacity-100 ${selected ? 'opacity-100' : 'opacity-0'}`}>
        <IconBtn title={layer.visible ? 'Hide layer' : 'Show layer'} onClick={() => onToggleVisible(layer.id)}>
          {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </IconBtn>
        <IconBtn title="Move up" disabled={displayIndex === 0} onClick={() => onReorder(layer.id, 1)}>
          <ArrowUp className="w-3.5 h-3.5" />
        </IconBtn>
        <IconBtn title="Move down" disabled={displayIndex === total - 1} onClick={() => onReorder(layer.id, -1)}>
          <ArrowDown className="w-3.5 h-3.5" />
        </IconBtn>
        <IconBtn title="Duplicate layer" disabled={atMax} onClick={() => onDuplicate(layer.id)}>
          <Copy className="w-3.5 h-3.5" />
        </IconBtn>
        <span className="w-px h-3.5 bg-[#EAECF0] mx-0.5" />
        <IconBtn title="Delete layer" danger disabled={total <= minLayers} onClick={() => onRemove(layer.id)}>
          <Trash2 className="w-3.5 h-3.5" />
        </IconBtn>
      </div>
    </div>
  );
});

export default function LayerList({
  kind, layers, selectedId, max, minLayers = 1, addLabel, maxHint,
  onSelect, onToggleVisible, onReorder, onDuplicate, onRemove, onAdd,
}: LayerListProps) {
  const total = layers.length;
  const atMax = total >= max;

  // Display front→back: reverse the storage order (index 0 = bottom = back).
  const display = layers.map((layer, storageIndex) => ({ layer, storageIndex })).reverse();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-0.5">
        {display.map(({ layer }, displayIndex) => (
          <LayerRowItem
            key={layer.id}
            kind={kind}
            layer={layer}
            selected={layer.id === selectedId}
            displayIndex={displayIndex}
            total={total}
            minLayers={minLayers}
            atMax={atMax}
            onSelect={onSelect}
            onToggleVisible={onToggleVisible}
            onReorder={onReorder}
            onDuplicate={onDuplicate}
            onRemove={onRemove}
          />
        ))}
      </div>

      {atMax ? (
        <p className="px-1.5 text-[11px] lg:text-[10px] text-[#9CA3AF] italic">{maxHint}</p>
      ) : total === 0 ? (
        <button
          type="button"
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-[var(--nsg-accent-border)] text-[var(--nsg-accent)] hover:bg-[var(--nsg-accent-soft)] hover:border-[var(--nsg-accent)] transition-colors text-[13px] font-semibold"
        >
          <Plus className="w-4 h-4" />
          {addLabel}
        </button>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-1.5 py-1 rounded-md text-[12px] lg:text-[11px] font-medium text-[#6B7280] hover:text-[var(--nsg-accent)] hover:bg-[#F9FAFB] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {addLabel}
        </button>
      )}
    </div>
  );
}

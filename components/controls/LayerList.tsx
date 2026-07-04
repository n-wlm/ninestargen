'use client';

import { ReactNode, useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';

// A compact, selected-layer-first list shared by both modes (geometry now,
// images in a later cycle). Rows are shown front→back (top row = front); the
// action cluster stays hidden until a row is hovered or selected, keeping the
// list calm at rest. `layers` come in storage order (index 0 = bottom).
export interface LayerListItem {
  id: string;
  name: string;
  visible: boolean;
}

interface LayerListProps {
  layers: LayerListItem[];
  selectedId: string;
  max: number;
  minLayers?: number; // below this, delete is disabled (geometry needs ≥1)
  addLabel: string;
  maxHint: string;
  renderThumb: (id: string) => ReactNode;
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

export default function LayerList({
  layers, selectedId, max, minLayers = 1, addLabel, maxHint, renderThumb,
  onSelect, onToggleVisible, onReorder, onDuplicate, onRemove, onAdd,
}: LayerListProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const total = layers.length;
  const atMax = total >= max;

  // Display front→back: reverse the storage order (index 0 = bottom = back).
  const display = layers.map((layer, storageIndex) => ({ layer, storageIndex })).reverse();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-0.5">
        {display.map(({ layer, storageIndex }, displayIndex) => {
          const selected = layer.id === selectedId;
          const showActions = selected || hovered === layer.id;

          return (
            <div
              key={layer.id}
              onClick={() => onSelect(layer.id)}
              onMouseEnter={() => setHovered(layer.id)}
              onMouseLeave={() => setHovered((h) => (h === layer.id ? null : h))}
              className={`group flex items-center gap-2 pl-1.5 pr-1 py-1 rounded-md cursor-pointer transition-colors ${
                selected
                  ? 'bg-[var(--nsg-accent-soft)] ring-1 ring-inset ring-[var(--nsg-accent-ring)]'
                  : 'hover:bg-[#F9FAFB]'
              }`}
            >
              <div className={`shrink-0 w-[26px] h-[26px] rounded bg-[#F3F4F6] overflow-hidden flex items-center justify-center ${layer.visible ? '' : 'opacity-40'}`}>
                {renderThumb(layer.id)}
              </div>
              <span className={`flex-1 min-w-0 truncate text-[13px] lg:text-[11px] font-medium ${
                selected ? 'text-[var(--nsg-accent)]' : layer.visible ? 'text-[#374151]' : 'text-[#9CA3AF]'
              }`}>
                {layer.name}
              </span>

              <div className={`flex items-center shrink-0 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
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
              {/* keep storageIndex referenced for clarity/debug parity with images mode */}
              <span className="hidden" aria-hidden="true" data-storage-index={storageIndex} />
            </div>
          );
        })}
      </div>

      {atMax ? (
        <p className="px-1.5 text-[11px] lg:text-[10px] text-[#9CA3AF] italic">{maxHint}</p>
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

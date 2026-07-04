'use client';

import { ReactNode, useState } from 'react';
import { ChevronDown, Layers as LayersIcon } from 'lucide-react';
import LayerList, { type LayerListItem } from './LayerList';

// The floating, collapsible Layers window shown over the canvas (both modes).
// It's just chrome around the shared LayerList — so geometry and images get an
// identical, prominent layer surface separated from the property controls.
export interface LayersPanelProps {
  layers: LayerListItem[];
  selectedId: string;
  max: number;
  minLayers?: number;
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

export default function LayersPanel(props: LayersPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="w-64 bg-white/95 backdrop-blur-sm border border-[#E5E7EB] rounded-xl shadow-lg overflow-hidden">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#F9FAFB] transition-colors"
        aria-expanded={!collapsed}
      >
        <LayersIcon className="w-3.5 h-3.5 text-[var(--nsg-accent)]" aria-hidden="true" />
        <span className="flex-1 text-[12px] font-semibold text-[#111827]">Layers</span>
        <ChevronDown
          className={`w-4 h-4 text-[#9CA3AF] transition-transform ${collapsed ? '-rotate-90' : ''}`}
          aria-hidden="true"
        />
      </button>

      {!collapsed && (
        <div className="px-2 pb-2 pt-0.5 border-t border-[#F3F4F6] max-h-[60vh] overflow-y-auto">
          <LayerList {...props} />
        </div>
      )}
    </div>
  );
}

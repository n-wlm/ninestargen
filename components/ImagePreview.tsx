'use client';

import { memo, useMemo } from 'react';
import type { CompositionConfig, ImageLayer } from '@/types/composition';

const VIEWBOX_SIZE = 600;
const CX = VIEWBOX_SIZE / 2;
const CY = VIEWBOX_SIZE / 2;
const TWO_PI = Math.PI * 2;

interface ImagePreviewProps {
  config: CompositionConfig;
  className?: string;
  style?: React.CSSProperties;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

function ngon9Path(cx: number, cy: number, r: number, rot: number): string {
  const pts = Array.from({ length: 9 }, (_, i) => {
    const a = rot + (TWO_PI * i) / 9;
    return `${(cx + r * Math.cos(a)).toFixed(3)},${(cy + r * Math.sin(a)).toFixed(3)}`;
  });
  return `M ${pts.join(' L ')} Z`;
}

// Width/height in viewBox units for a layer, preserving the image aspect ratio.
// `scale` is the longest side.
function layerSize(layer: ImageLayer): { w: number; h: number } {
  const aspect = layer.naturalWidth / layer.naturalHeight || 1;
  return aspect >= 1
    ? { w: layer.scale, h: layer.scale / aspect }
    : { w: layer.scale * aspect, h: layer.scale };
}

// Transform strings for every copy of a layer (count, or 2×count when mirrored).
function placements(layer: ImageLayer): string[] {
  const step = 360 / layer.count;
  // Per-copy tail: nudge the image off-centre in the sector frame, then spin it
  // around its own (shifted) centre. offset 0,0 reproduces the centred placement.
  const tail = `translate(${layer.offsetX},${layer.offsetY}) rotate(${layer.spin})`;
  const out: string[] = [];
  for (let k = 0; k < layer.count; k++) {
    const a = layer.angleOffset + k * step;
    const radial = `translate(${CX},${CY}) rotate(${a}) translate(0,${-layer.radius})`;
    out.push(`${radial} ${tail}`);
    if (layer.mirror) {
      // Reflect across the sector's radial axis → seamless kaleidoscope (Dₙ).
      // scale(-1,1) before the tail mirrors the offset too, keeping symmetry.
      out.push(`${radial} scale(-1,1) ${tail}`);
    }
  }
  return out;
}

function ImagePreview({ config, className, style, svgRef }: ImagePreviewProps) {
  // Sizes and transform strings per visible layer, recomputed only when the
  // layer list actually changes.
  const visible = useMemo(
    () =>
      config.layers
        .filter((l) => l.visible && l.src)
        .map((layer) => ({ layer, size: layerSize(layer), transforms: placements(layer) })),
    [config.layers],
  );

  // Container hugs the outermost reach of the visible layers.
  const maxReach = visible.reduce((m, { layer, size }) => {
    return Math.max(m, layer.radius + Math.max(size.w, size.h) / 2);
  }, 0);
  const baseR = maxReach > 0 ? maxReach : 200;
  const containerR = Math.min(295, baseR + config.outerContainerPadding);
  const containerFill = config.outerContainerFill === 'none' ? 'none' : config.outerContainerFill;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Image kaleidoscope preview"
      role="img"
    >
      {config.bgColor !== 'transparent' && (
        <rect width={VIEWBOX_SIZE} height={VIEWBOX_SIZE} fill={config.bgColor} />
      )}

      {/* Outer container (behind images) */}
      {config.outerContainer !== 'none' && (
        <>
          {config.outerContainer === 'circle' && (
            <circle cx={CX} cy={CY} r={containerR} fill={containerFill} stroke={config.outerContainerColor} strokeWidth={1.5} />
          )}
          {config.outerContainer === '9-gon' && (
            <path d={ngon9Path(CX, CY, containerR, -Math.PI / 2)} fill={containerFill} stroke={config.outerContainerColor} strokeWidth={1.5} />
          )}
          {config.outerContainer === 'square' && (
            <rect
              x={CX - containerR}
              y={CY - containerR}
              width={containerR * 2}
              height={containerR * 2}
              fill={containerFill}
              stroke={config.outerContainerColor}
              strokeWidth={1.5}
            />
          )}
        </>
      )}

      {/* Layers — array order is bottom→top */}
      {visible.map(({ layer, size, transforms }) => (
        <g key={layer.id} opacity={layer.opacity}>
          {transforms.map((t, i) => (
            <image
              key={i}
              href={layer.src}
              x={-size.w / 2}
              y={-size.h / 2}
              width={size.w}
              height={size.h}
              transform={t}
              preserveAspectRatio="xMidYMid meet"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

// Memoized for the same reason as StarPreview — layers carry large data-URL
// hrefs, so skipping unrelated re-renders keeps the images mode responsive.
export default memo(ImagePreview);

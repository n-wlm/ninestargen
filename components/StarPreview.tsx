'use client';

import { memo, useId, useMemo } from 'react';
import type { StarConfig } from '@/types/star';
import type { GeometryComposition, GeometryLayer } from '@/types/geometry';
import { compositionFromConfig, DEFAULT_GEOMETRY_COMPOSITION } from '@/types/geometry';
import { buildStarPaths, buildInnerPolygonPath } from '@/lib/star-geometry';

const VIEWBOX_SIZE = 600;
const CX = VIEWBOX_SIZE / 2;
const CY = VIEWBOX_SIZE / 2;
const TWO_PI = Math.PI * 2;

interface StarPreviewProps {
  /** Full multi-layer composition (the generator passes this). */
  composition?: GeometryComposition;
  /** Legacy single-star convenience — thumbnails (presets, history, corner previews). */
  config?: StarConfig;
  className?: string;
  style?: React.CSSProperties;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

function dashArray(dash: StarConfig['strokeDash']): string | undefined {
  if (dash === 'dashed') return '12,8';
  if (dash === 'dotted') return '2,8';
  return undefined;
}

function ngon9Path(cx: number, cy: number, r: number, rot: number): string {
  const pts = Array.from({ length: 9 }, (_, i) => {
    const a = rot + (TWO_PI * i) / 9;
    return `${(cx + r * Math.cos(a)).toFixed(3)},${(cy + r * Math.sin(a)).toFixed(3)}`;
  });
  return `M ${pts.join(' L ')} Z`;
}

const GRADIENT_COORDS: Record<string, { x1: string; y1: string; x2: string; y2: string }> = {
  'to-bottom':       { x1: '0%', y1: '0%',   x2: '0%',   y2: '100%' },
  'to-right':        { x1: '0%', y1: '50%',  x2: '100%', y2: '50%' },
  'to-bottom-right': { x1: '0%', y1: '0%',   x2: '100%', y2: '100%' },
  'to-top-right':    { x1: '0%', y1: '100%', x2: '100%', y2: '0%' },
};
const GRADIENT_COORDS_FALLBACK = GRADIENT_COORDS['to-bottom-right'];

// One star layer: its own defs (gradient/filter ids are unique per component
// instance via useId, so stacked layers never cross-bleed), its paths, and the
// optional inner polygon. `opacity` wraps everything; `fillOpacity` keeps its
// legacy scope (star paths only, not the inner polygon).
const StarLayerGroup = memo(function StarLayerGroup({ layer }: { layer: GeometryLayer }) {
  const uid = useId().replace(/:/g, '_');
  const gradId = `grad_${uid}`;
  const filterId = `filter_${uid}`;
  const hasFilter = layer.glowRadius > 0 || layer.shadowBlur > 0;

  const cx = CX + layer.offsetX;
  const cy = CY + layer.offsetY;
  // Depend only on the GEOMETRIC fields buildStarPaths reads — so a colour /
  // opacity / stroke / effect change (which replaces the layer object) doesn't
  // rebuild the path strings, only re-applies fill/stroke attributes.
  const { starType, outerRadius, innerRadiusRatio, rotation, curveIntensity, cornerRounding, petalWidth, petalCurve, showInnerPolygon } = layer;
  const paths = useMemo(
    () => buildStarPaths(cx, cy, layer),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cx, cy, starType, outerRadius, innerRadiusRatio, rotation, curveIntensity, cornerRounding, petalWidth, petalCurve],
  );
  const innerPath = useMemo(
    () => (showInnerPolygon ? buildInnerPolygonPath(cx, cy, layer) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cx, cy, showInnerPolygon, starType, outerRadius, innerRadiusRatio, rotation, curveIntensity, cornerRounding, petalWidth, petalCurve],
  );

  const fill =
    layer.fillType === 'none' ? 'none' : layer.fillType === 'solid' ? layer.fillColor : `url(#${gradId})`;
  const gradientCoords = GRADIENT_COORDS[layer.gradientDirection] ?? GRADIENT_COORDS_FALLBACK;

  const strokeProps = {
    stroke: layer.strokeWidth > 0 ? layer.strokeColor : 'none',
    strokeWidth: layer.strokeWidth,
    strokeDasharray: dashArray(layer.strokeDash),
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <g opacity={layer.opacity}>
      <defs>
        {layer.fillType === 'linear-gradient' && (
          <linearGradient id={gradId} {...gradientCoords} gradientUnits="objectBoundingBox">
            {layer.gradientColors.map((color, i) => (
              <stop key={i} offset={`${(i / (layer.gradientColors.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </linearGradient>
        )}
        {layer.fillType === 'radial-gradient' && (
          <radialGradient id={gradId} cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            {layer.gradientColors.map((color, i) => (
              <stop key={i} offset={`${(i / (layer.gradientColors.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </radialGradient>
        )}

        {hasFilter && (
          <filter id={filterId} x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
            {layer.shadowBlur > 0 && (
              <>
                <feGaussianBlur in="SourceAlpha" stdDeviation={layer.shadowBlur} result="shadowBlur" />
                <feFlood floodColor={layer.shadowColor} result="shadowColor" />
                <feComposite in="shadowColor" in2="shadowBlur" operator="in" result="shadow" />
              </>
            )}
            {layer.glowRadius > 0 && (
              <>
                <feGaussianBlur in="SourceGraphic" stdDeviation={layer.glowRadius} result="glowBlur" />
                <feFlood floodColor={layer.glowColor} result="glowColor" />
                <feComposite in="glowColor" in2="glowBlur" operator="in" result="glow" />
              </>
            )}
            <feMerge>
              {layer.shadowBlur > 0 && <feMergeNode in="shadow" />}
              {layer.glowRadius > 0 && <feMergeNode in="glow" />}
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      <g opacity={layer.fillOpacity} filter={hasFilter ? `url(#${filterId})` : undefined}>
        {paths.map((d, i) => (
          <path key={i} d={d} fill={fill} {...strokeProps} />
        ))}
      </g>

      {innerPath && <path d={innerPath} fill={layer.innerPolygonColor} stroke="none" />}
    </g>
  );
});

function StarPreview({ composition, config, className, style, svgRef }: StarPreviewProps) {
  const comp = useMemo(
    () => composition ?? (config ? compositionFromConfig(config) : DEFAULT_GEOMETRY_COMPOSITION),
    [composition, config],
  );

  const visible = comp.layers.filter((l) => l.visible);
  // The outer container wraps the largest visible star; with one layer this
  // degrades exactly to the pre-layer behavior.
  const anchor = visible.reduce<GeometryLayer | undefined>(
    (a, b) => (!a || b.outerRadius > a.outerRadius ? b : a),
    undefined,
  ) ?? comp.layers[comp.layers.length - 1];
  const containerR = anchor.outerRadius + comp.outerContainerPadding;
  const containerFill = comp.outerContainerFill === 'none' ? 'none' : comp.outerContainerFill;
  const baseRot = (anchor.rotation * Math.PI) / 180;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Nine-pointed star preview"
      role="img"
    >
      {comp.bgColor !== 'transparent' && (
        <rect width={VIEWBOX_SIZE} height={VIEWBOX_SIZE} fill={comp.bgColor} />
      )}

      {/* Outer container (behind all stars) */}
      {comp.outerContainer !== 'none' && (
        <>
          {comp.outerContainer === 'circle' && (
            <circle cx={CX} cy={CY} r={containerR} fill={containerFill} stroke={comp.outerContainerColor} strokeWidth={1.5} />
          )}
          {comp.outerContainer === '9-gon' && (
            <path d={ngon9Path(CX, CY, containerR, baseRot)} fill={containerFill} stroke={comp.outerContainerColor} strokeWidth={1.5} />
          )}
          {comp.outerContainer === 'square' && (
            <rect
              x={CX - containerR}
              y={CY - containerR}
              width={containerR * 2}
              height={containerR * 2}
              fill={containerFill}
              stroke={comp.outerContainerColor}
              strokeWidth={1.5}
            />
          )}
        </>
      )}

      {/* Star layers, bottom → top; hidden layers skip rendering (and defs) entirely */}
      {visible.map((layer) => (
        <StarLayerGroup key={layer.id} layer={layer} />
      ))}
    </svg>
  );
}

// Memoized: the generator page re-renders on unrelated state (history panel,
// modals, toasts) — without memo every such render rebuilds all star paths.
export default memo(StarPreview);

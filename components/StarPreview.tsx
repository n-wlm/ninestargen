'use client';

import { useId } from 'react';
import type { StarConfig } from '@/types/star';
import { buildStarPaths, buildInnerPolygonPath } from '@/lib/star-geometry';

const VIEWBOX_SIZE = 600;
const CX = VIEWBOX_SIZE / 2;
const CY = VIEWBOX_SIZE / 2;
const TWO_PI = Math.PI * 2;

interface StarPreviewProps {
  config: StarConfig;
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

export default function StarPreview({ config, className, style, svgRef }: StarPreviewProps) {
  const id = useId().replace(/:/g, '_');
  const gradId = `grad_${id}`;
  const filterId = `filter_${id}`;
  const hasFilter = config.glowRadius > 0 || config.shadowBlur > 0;

  const paths = buildStarPaths(CX, CY, config);
  const innerPath = config.showInnerPolygon ? buildInnerPolygonPath(CX, CY, config) : null;

  function getFill(index: number): string {
    if (config.fillType === 'none') return 'none';
    if (config.fillType === 'solid') return config.fillColor;
    return `url(#${gradId})`;
  }

  function gradientCoords() {
    const dir = config.gradientDirection;
    if (dir === 'to-bottom') return { x1: '0%', y1: '0%', x2: '0%', y2: '100%' };
    if (dir === 'to-right') return { x1: '0%', y1: '50%', x2: '100%', y2: '50%' };
    if (dir === 'to-bottom-right') return { x1: '0%', y1: '0%', x2: '100%', y2: '100%' };
    if (dir === 'to-top-right') return { x1: '0%', y1: '100%', x2: '100%', y2: '0%' };
    return { x1: '0%', y1: '0%', x2: '100%', y2: '100%' };
  }

  const strokeProps = {
    stroke: config.strokeWidth > 0 ? config.strokeColor : 'none',
    strokeWidth: config.strokeWidth,
    strokeDasharray: dashArray(config.strokeDash),
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  // Outer container
  const containerR = config.outerRadius + config.outerContainerPadding;
  const containerFill = config.outerContainerFill === 'none' ? 'none' : config.outerContainerFill;
  const containerStroke = config.outerContainerColor;
  const containerStrokeW = 1.5;
  const baseRot = (config.rotation * Math.PI) / 180;

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
      <defs>
        {config.fillType === 'linear-gradient' && (
          <linearGradient id={gradId} {...gradientCoords()} gradientUnits="objectBoundingBox">
            {config.gradientColors.map((color, i) => (
              <stop key={i} offset={`${(i / (config.gradientColors.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </linearGradient>
        )}
        {config.fillType === 'radial-gradient' && (
          <radialGradient id={gradId} cx="50%" cy="50%" r="50%" gradientUnits="objectBoundingBox">
            {config.gradientColors.map((color, i) => (
              <stop key={i} offset={`${(i / (config.gradientColors.length - 1)) * 100}%`} stopColor={color} />
            ))}
          </radialGradient>
        )}

        {hasFilter && (
          <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
            {config.glowRadius > 0 && (
              <>
                <feGaussianBlur in="SourceGraphic" stdDeviation={config.glowRadius} result="blur" />
                <feFlood floodColor={config.glowColor} result="glowColor" />
                <feComposite in="glowColor" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </>
            )}
            {config.shadowBlur > 0 && config.glowRadius === 0 && (
              <feDropShadow
                dx={config.shadowOffsetX}
                dy={config.shadowOffsetY}
                stdDeviation={config.shadowBlur}
                floodColor={config.shadowColor}
              />
            )}
          </filter>
        )}
      </defs>

      {config.bgColor !== 'transparent' && (
        <rect width={VIEWBOX_SIZE} height={VIEWBOX_SIZE} fill={config.bgColor} />
      )}

      {/* Outer container (behind star) */}
      {config.outerContainer !== 'none' && (
        <>
          {config.outerContainer === 'circle' && (
            <circle cx={CX} cy={CY} r={containerR} fill={containerFill} stroke={containerStroke} strokeWidth={containerStrokeW} />
          )}
          {config.outerContainer === '9-gon' && (
            <path d={ngon9Path(CX, CY, containerR, baseRot)} fill={containerFill} stroke={containerStroke} strokeWidth={containerStrokeW} />
          )}
          {config.outerContainer === 'square' && (
            <rect
              x={CX - containerR}
              y={CY - containerR}
              width={containerR * 2}
              height={containerR * 2}
              fill={containerFill}
              stroke={containerStroke}
              strokeWidth={containerStrokeW}
            />
          )}
        </>
      )}

      {/* Star paths */}
      <g opacity={config.fillOpacity} filter={hasFilter ? `url(#${filterId})` : undefined}>
        {paths.map((d, i) => (
          <path key={i} d={d} fill={getFill(i)} {...strokeProps} />
        ))}
      </g>

      {innerPath && (
        <path d={innerPath} fill={config.innerPolygonColor} stroke="none" />
      )}
    </svg>
  );
}
